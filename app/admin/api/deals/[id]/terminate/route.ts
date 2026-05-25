// POST /admin/api/deals/[id]/terminate — force-terminate a pending/active deal.
// Body: { reason: string }

import { type NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-actions";
import {
  getInternalFunctionHeaders,
  internalFunctionConfigError,
} from "@/lib/admin-internal-functions";

type ListingSummary = {
  id: string;
  title: string | null;
  platform: string | null;
  status: string | null;
  archived_at: string | null;
};

type DealRow = {
  id: string;
  listing_id: string;
  host_id: string | null;
  buyer_id: string | null;
  conversation_id: string | null;
  status: string | null;
  agreed_price: number;
  duration_months: number | null;
  started_at: string | null;
  ends_at: string | null;
  terminated_at: string | null;
  terminated_by: string | null;
  termination_reason: string | null;
  termination_source: string | null;
  created_at: string | null;
  listing: ListingSummary | ListingSummary[] | null;
};

type NotificationSummary = {
  recipient_count: number;
  notification_inserted_count: number;
  notification_failed_count: number;
  push_success_count: number;
  push_failure_count: number;
  push_skipped_count: number;
  message_inserted_count: number;
  message_failed_count: number;
  warnings: string[];
};

const EMPTY_SUMMARY: NotificationSummary = {
  recipient_count: 0,
  notification_inserted_count: 0,
  notification_failed_count: 0,
  push_success_count: 0,
  push_failure_count: 0,
  push_skipped_count: 0,
  message_inserted_count: 0,
  message_failed_count: 0,
  warnings: [],
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { admin, supabase } = auth;
  const { id } = await params;

  let body: { reason?: string };
  try {
    body = (await request.json()) as { reason?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const reason = (body.reason ?? "").trim();
  if (reason.length < 3 || reason.length > 500) {
    return NextResponse.json(
      { error: "Reason must be 3-500 characters." },
      { status: 400 },
    );
  }

  const dealId = id;
  const existing = await fetchDeal(supabase, dealId);
  if (!existing) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  if (isAdminTerminated(existing)) {
    return NextResponse.json({
      deal: existing,
      already_terminated: true,
      notification_summary: EMPTY_SUMMARY,
    });
  }

  if (existing.status !== "pending" && existing.status !== "active") {
    return NextResponse.json(
      {
        error:
          "Only pending or active deals can be force-terminated. Completed, disputed, and user-cancelled deals are left unchanged.",
        status: existing.status,
      },
      { status: 409 },
    );
  }

  const terminatedAt = existing.terminated_at ?? new Date().toISOString();
  const { data: updatedMarker, error: updateError } = await supabase
    .from("deals")
    .update({
      status: "cancelled",
      terminated_at: terminatedAt,
      terminated_by: admin.id,
      termination_reason: reason,
      termination_source: "admin",
    })
    .eq("id", dealId)
    .in("status", ["pending", "active"])
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error("[admin deal terminate]", updateError);
    return NextResponse.json(
      { error: `Terminate failed: ${updateError.message}` },
      { status: 500 },
    );
  }

  if (!updatedMarker) {
    const current = await fetchDeal(supabase, dealId);
    if (isAdminTerminated(current)) {
      return NextResponse.json({
        deal: current,
        already_terminated: true,
        notification_summary: EMPTY_SUMMARY,
      });
    }
    return NextResponse.json(
      { error: "Deal changed before it could be terminated." },
      { status: 409 },
    );
  }

  const updated = await fetchDeal(supabase, dealId);
  if (!updated) {
    return NextResponse.json(
      { error: "Deal terminated, but detail reload failed." },
      { status: 500 },
    );
  }

  const notificationSummary = await notifyParticipants({
    supabase,
    deal: updated,
    previousStatus: existing.status,
    reason,
    terminatedAt,
  });

  const messageSummary = await insertSystemMessage({
    supabase,
    deal: updated,
    reason,
  });
  notificationSummary.message_inserted_count =
    messageSummary.inserted ? 1 : 0;
  notificationSummary.message_failed_count =
    messageSummary.failed ? 1 : 0;
  if (messageSummary.warning) {
    notificationSummary.warnings.push(messageSummary.warning);
  }

  await logAdminAction(supabase, {
    admin_id: admin.id,
    action_type: "deal_terminated",
    target_user_id: updated.host_id ?? updated.buyer_id,
    target_resource_id: updated.id,
    target_resource_type: "deal",
    reason,
    payload: {
      deal_id: updated.id,
      listing_id: updated.listing_id,
      listing_title: listingFromRelation(updated.listing)?.title ?? null,
      platform: listingFromRelation(updated.listing)?.platform ?? null,
      host_id: updated.host_id,
      buyer_id: updated.buyer_id,
      previous_status: existing.status,
      status: updated.status,
      terminated_at: terminatedAt,
      terminated_by: admin.id,
      termination_reason: reason,
      termination_source: "admin",
      notification_summary: notificationSummary,
    },
  });

  return NextResponse.json({
    deal: updated,
    already_terminated: false,
    notification_summary: notificationSummary,
  });
}

async function fetchDeal(
  supabase: SupabaseClient,
  dealId: string,
): Promise<DealRow | null> {
  const { data, error } = await supabase
    .from("deals")
    .select(
      `id,listing_id,host_id,buyer_id,conversation_id,status,agreed_price,duration_months,started_at,ends_at,terminated_at,terminated_by,termination_reason,termination_source,created_at,
       listing:listings!deals_listing_id_fkey(id,title,platform,status,archived_at)`,
    )
    .eq("id", dealId)
    .maybeSingle();

  if (error) {
    console.error("[admin deal terminate] fetch failed:", error);
    return null;
  }
  return (data as unknown as DealRow | null) ?? null;
}

function isAdminTerminated(deal: DealRow | null): boolean {
  return deal?.termination_source === "admin" && !!deal.terminated_at;
}

function listingFromRelation(
  listing: DealRow["listing"],
): ListingSummary | null {
  if (Array.isArray(listing)) return listing[0] ?? null;
  return listing;
}

async function notifyParticipants(args: {
  supabase: SupabaseClient;
  deal: DealRow;
  previousStatus: string | null;
  reason: string;
  terminatedAt: string;
}): Promise<NotificationSummary> {
  const { supabase, deal, previousStatus, reason, terminatedAt } = args;
  const listing = listingFromRelation(deal.listing);
  const recipients = new Map<string, "host" | "buyer" | "host_and_buyer">();
  if (deal.host_id) recipients.set(deal.host_id, "host");
  if (deal.buyer_id) {
    const existingRole = recipients.get(deal.buyer_id);
    recipients.set(
      deal.buyer_id,
      existingRole === "host" ? "host_and_buyer" : "buyer",
    );
  }

  const summary: NotificationSummary = {
    ...EMPTY_SUMMARY,
    recipient_count: recipients.size,
    warnings: [],
  };

  const rows = Array.from(recipients.entries()).map(([userId, role]) => ({
    user_id: userId,
    kind: "deal_terminated",
    payload: payloadForRecipient({
      deal,
      listing,
      reason,
      terminatedAt,
      previousStatus,
      role,
    }),
  }));

  if (rows.length > 0) {
    const { error } = await supabase.from("notifications").insert(rows);
    if (error) {
      summary.notification_failed_count = rows.length;
      summary.warnings.push(`notification_failed:${error.message}`);
      console.error(
        "[admin deal terminate] notification insert failed:",
        error.code,
        error.message,
        error.details,
      );
    } else {
      summary.notification_inserted_count = rows.length;
    }
  }

  let internalHeaders: Record<string, string>;
  try {
    internalHeaders = getInternalFunctionHeaders();
  } catch (error) {
    const message = internalFunctionConfigError(error);
    console.error("[admin deal terminate] push config failed:", message);
    summary.push_failure_count += recipients.size;
    summary.warnings.push(`push_failed:${message}`);
    return summary;
  }

  await Promise.all(
    Array.from(recipients.entries()).map(async ([recipientId, role]) => {
      const { data, error } = await supabase.functions.invoke(
        "send_push_notification",
        {
          headers: internalHeaders,
          body: {
            recipient_id: recipientId,
            kind: "deal_terminated",
            data: payloadForRecipient({
              deal,
              listing,
              reason,
              terminatedAt,
              previousStatus,
              role,
            }),
          },
        },
      );

      if (error) {
        summary.push_failure_count += 1;
        summary.warnings.push(`push_failed:${error.message}`);
        return;
      }

      const pushResult = data as
        | { sent?: boolean; skipped?: boolean; reason?: string; error?: string }
        | null;
      if (pushResult?.sent) {
        summary.push_success_count += 1;
      } else if (pushResult?.skipped) {
        summary.push_skipped_count += 1;
      } else if (pushResult?.error) {
        summary.push_failure_count += 1;
        summary.warnings.push(`push_failed:${pushResult.error}`);
      } else {
        summary.push_skipped_count += 1;
      }
    }),
  );

  return summary;
}

function payloadForRecipient(args: {
  deal: DealRow;
  listing: ListingSummary | null;
  reason: string;
  terminatedAt: string;
  previousStatus: string | null;
  role: string;
}) {
  const { deal, listing, reason, terminatedAt, previousStatus, role } = args;
  return {
    deal_id: deal.id,
    listing_id: deal.listing_id,
    listing_title: listing?.title ?? null,
    platform: listing?.platform ?? null,
    reason,
    terminated_at: terminatedAt,
    terminated_by: deal.terminated_by,
    termination_source: "admin",
    previous_status: previousStatus,
    status: deal.status,
    role,
  };
}

async function insertSystemMessage(args: {
  supabase: SupabaseClient;
  deal: DealRow;
  reason: string;
}): Promise<{ inserted: boolean; failed: boolean; warning?: string }> {
  const { supabase, deal, reason } = args;
  if (!deal.conversation_id) return { inserted: false, failed: false };

  const { error } = await supabase.from("messages").insert({
    conversation_id: deal.conversation_id,
    sender_id: null,
    kind: "deal_cancelled",
    deal_id: deal.id,
    text: `Deal terminated by Bantle: ${reason}`,
  });

  if (error) {
    console.error("[admin deal terminate] system message failed:", error);
    return {
      inserted: false,
      failed: true,
      warning: `message_failed:${error.message}`,
    };
  }

  return { inserted: true, failed: false };
}
