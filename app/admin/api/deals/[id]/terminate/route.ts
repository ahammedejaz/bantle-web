import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { adminRpcErrorResponse } from "@/lib/admin-rpc-errors";
import { dispatchNotificationOutbox } from "@/lib/notification-outbox";

type TerminateResult = {
  deal_id: string;
  status: string;
  terminated_at: string | null;
  notification_count?: number;
  system_message_created?: boolean;
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

  const { data, error } = await userClient.rpc("admin_terminate_deal", {
    p_deal_id: id,
    p_reason: reason,
  });
  if (error) {
    return adminRpcErrorResponse(
      "deal_terminate",
      error,
      "Deal could not be terminated.",
    );
  }
  const result = data as unknown as TerminateResult;
  const delivery = result.idempotent
    ? { claimed: 0, completed: 0, retryableFailed: 0, dispatcherErrors: 0 }
    : await dispatchNotificationOutbox(supabase);
  const notificationCount = result.idempotent
    ? 0
    : result.notification_count ?? 0;

  return NextResponse.json({
    deal: {
      id: result.deal_id,
      status: result.status,
      terminated_at: result.terminated_at,
      terminated_by: admin.id,
      termination_reason: reason,
      termination_source: "admin",
    },
    already_terminated: result.idempotent,
    notification_summary: {
      recipient_count: notificationCount,
      notification_inserted_count: notificationCount,
      notification_failed_count: 0,
      push_success_count: delivery.completed,
      push_failure_count: delivery.retryableFailed + delivery.dispatcherErrors,
      push_skipped_count: 0,
      message_inserted_count: result.system_message_created ? 1 : 0,
      message_failed_count: 0,
      warnings:
        delivery.retryableFailed + delivery.dispatcherErrors > 0
          ? ["push_delivery_deferred"]
          : [],
    },
  });
}
