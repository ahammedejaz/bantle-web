// POST /admin/api/listings/[id]/close — force-close a listing.
// Body: { reason: string }

import { type NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-actions";
import {
  getInternalFunctionHeaders,
  internalFunctionConfigError,
} from "@/lib/admin-internal-functions";

type ListingRow = {
  id: string;
  user_id: string;
  title: string;
  platform: string;
  status: string | null;
  archived_at: string | null;
  closed_reason: string | null;
  closed_by: string | null;
  closed_at: string | null;
  updated_at: string | null;
};

type NotificationSummary = {
  recipient_count: number;
  notification_inserted_count: number;
  notification_failed_count: number;
  push_success_count: number;
  push_failure_count: number;
  push_skipped_count: number;
  warnings: string[];
};

const EMPTY_SUMMARY: NotificationSummary = {
  recipient_count: 0,
  notification_inserted_count: 0,
  notification_failed_count: 0,
  push_success_count: 0,
  push_failure_count: 0,
  push_skipped_count: 0,
  warnings: [],
};

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { admin, supabase } = auth;

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

  const listingId = params.id;
  const existing = await fetchListing(supabase, listingId);
  if (!existing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const dealCounts = await getDealCounts(supabase, listingId);

  if (existing.status === "closed") {
    return NextResponse.json({
      listing: existing,
      already_closed: true,
      notification_summary: EMPTY_SUMMARY,
      deal_counts: dealCounts,
    });
  }

  if (existing.status !== "active") {
    return NextResponse.json(
      {
        error:
          "Only active listings can be force-closed. This listing has an unexpected or non-active status.",
        status: existing.status,
      },
      { status: 409 },
    );
  }

  const closedAt = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from("listings")
    .update({
      status: "closed",
      closed_reason: reason,
      closed_by: admin.id,
      closed_at: closedAt,
      updated_at: closedAt,
    })
    .eq("id", listingId)
    .eq("status", "active")
    .select(
      "id,user_id,title,platform,status,archived_at,closed_reason,closed_by,closed_at,updated_at",
    )
    .maybeSingle();

  if (updateError) {
    console.error("[admin listing close]", updateError);
    return NextResponse.json(
      { error: `Close failed: ${updateError.message}` },
      { status: 500 },
    );
  }

  if (!updated) {
    const current = await fetchListing(supabase, listingId);
    if (current?.status === "closed") {
      return NextResponse.json({
        listing: current,
        already_closed: true,
        notification_summary: EMPTY_SUMMARY,
        deal_counts: dealCounts,
      });
    }
    return NextResponse.json(
      { error: "Listing changed before it could be closed." },
      { status: 409 },
    );
  }

  const listing = updated as ListingRow;
  const notificationSummary = await notifyHost({
    supabase,
    listing,
    reason,
    closedAt,
    dealCounts,
  });

  await logAdminAction(supabase, {
    admin_id: admin.id,
    action_type: "listing_closed",
    target_user_id: listing.user_id,
    target_resource_id: listing.id,
    target_resource_type: "listing",
    reason,
    payload: {
      listing_id: listing.id,
      title: listing.title,
      platform: listing.platform,
      previous_status: existing.status,
      status: listing.status,
      archived_at: listing.archived_at,
      closed_reason: reason,
      closed_by: admin.id,
      closed_at: closedAt,
      active_deal_count: dealCounts.active,
      pending_deal_count: dealCounts.pending,
      notification_summary: notificationSummary,
    },
  });

  return NextResponse.json({
    listing,
    already_closed: false,
    notification_summary: notificationSummary,
    deal_counts: dealCounts,
  });
}

async function fetchListing(
  supabase: SupabaseClient,
  listingId: string,
): Promise<ListingRow | null> {
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id,user_id,title,platform,status,archived_at,closed_reason,closed_by,closed_at,updated_at",
    )
    .eq("id", listingId)
    .maybeSingle();

  if (error) {
    console.error("[admin listing close] fetch failed:", error);
    return null;
  }
  return (data as ListingRow | null) ?? null;
}

async function getDealCounts(
  supabase: SupabaseClient,
  listingId: string,
): Promise<{ pending: number; active: number }> {
  const { data, error } = await supabase
    .from("deals")
    .select("status")
    .eq("listing_id", listingId)
    .in("status", ["pending", "active"]);

  if (error) {
    console.warn("[admin listing close] deal count failed:", error.message);
    return { pending: 0, active: 0 };
  }

  let pending = 0;
  let active = 0;
  for (const row of (data ?? []) as Array<{ status: string | null }>) {
    if (row.status === "pending") pending += 1;
    if (row.status === "active") active += 1;
  }
  return { pending, active };
}

async function notifyHost(args: {
  supabase: SupabaseClient;
  listing: ListingRow;
  reason: string;
  closedAt: string;
  dealCounts: { pending: number; active: number };
}): Promise<NotificationSummary> {
  const { supabase, listing, reason, closedAt, dealCounts } = args;
  const payload = {
    listing_id: listing.id,
    listing_title: listing.title,
    platform: listing.platform,
    reason,
    closed_at: closedAt,
    active_deal_count: dealCounts.active,
    pending_deal_count: dealCounts.pending,
  };
  const summary: NotificationSummary = {
    ...EMPTY_SUMMARY,
    recipient_count: 1,
    warnings: [],
  };

  const { error: notificationError } = await supabase
    .from("notifications")
    .insert({
      user_id: listing.user_id,
      kind: "listing_closed",
      payload,
    });

  if (notificationError) {
    summary.notification_failed_count = 1;
    summary.warnings.push(`notification_failed:${notificationError.message}`);
    console.error(
      "[admin listing close] notification insert failed:",
      notificationError.code,
      notificationError.message,
      notificationError.details,
    );
  } else {
    summary.notification_inserted_count = 1;
  }

  let internalHeaders: Record<string, string>;
  try {
    internalHeaders = getInternalFunctionHeaders();
  } catch (error) {
    const message = internalFunctionConfigError(error);
    console.error("[admin listing close] push config failed:", message);
    summary.push_failure_count = 1;
    summary.warnings.push(`push_failed:${message}`);
    return summary;
  }

  const { data, error: pushError } = await supabase.functions.invoke(
    "send_push_notification",
    {
      headers: internalHeaders,
      body: {
        recipient_id: listing.user_id,
        kind: "listing_closed",
        data: payload,
      },
    },
  );

  if (pushError) {
    summary.push_failure_count = 1;
    summary.warnings.push(`push_failed:${pushError.message}`);
    return summary;
  }

  const pushResult = data as
    | { sent?: boolean; skipped?: boolean; reason?: string; error?: string }
    | null;
  if (pushResult?.sent) {
    summary.push_success_count = 1;
  } else if (pushResult?.skipped) {
    summary.push_skipped_count = 1;
  } else if (pushResult?.error) {
    summary.push_failure_count = 1;
    summary.warnings.push(`push_failed:${pushResult.error}`);
  } else {
    summary.push_skipped_count = 1;
  }

  return summary;
}
