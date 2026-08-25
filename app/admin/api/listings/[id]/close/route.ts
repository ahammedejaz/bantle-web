import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { adminRpcErrorResponse } from "@/lib/admin-rpc-errors";
import { dispatchNotificationOutbox } from "@/lib/notification-outbox";

type CloseResult = {
  listing_id: string;
  status: string;
  closed_at: string | null;
  active_deal_count?: number;
  pending_deal_count?: number;
  idempotent: boolean;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { admin, userClient, supabase } = auth;
  const { id } = await params;

  let body: { reason?: unknown };
  try {
    body = (await request.json()) as { reason?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (reason.length < 3 || reason.length > 500) {
    return NextResponse.json(
      { error: "Reason must be 3-500 characters." },
      { status: 400 },
    );
  }

  const { data, error } = await userClient.rpc("admin_close_listing", {
    p_listing_id: id,
    p_reason: reason,
  });
  if (error) {
    return adminRpcErrorResponse(
      "listing_close",
      error,
      "Listing could not be closed.",
    );
  }
  const result = data as unknown as CloseResult;
  const delivery = result.idempotent
    ? { claimed: 0, completed: 0, retryableFailed: 0, dispatcherErrors: 0 }
    : await dispatchNotificationOutbox(supabase);

  return NextResponse.json({
    listing: {
      id: result.listing_id,
      status: result.status,
      closed_reason: reason,
      closed_by: admin.id,
      closed_at: result.closed_at,
    },
    already_closed: result.idempotent,
    notification_summary: {
      recipient_count: result.idempotent ? 0 : 1,
      notification_inserted_count: result.idempotent ? 0 : 1,
      notification_failed_count: 0,
      push_success_count: delivery.completed,
      push_failure_count: delivery.retryableFailed + delivery.dispatcherErrors,
      push_skipped_count: 0,
      warnings:
        delivery.retryableFailed + delivery.dispatcherErrors > 0
          ? ["push_delivery_deferred"]
          : [],
    },
    deal_counts: {
      pending: result.pending_deal_count ?? 0,
      active: result.active_deal_count ?? 0,
    },
  });
}
