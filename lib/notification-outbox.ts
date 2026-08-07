import type { SupabaseClient } from "@supabase/supabase-js";
import { getInternalFunctionHeaders } from "./admin-internal-functions";
import { safeAdminErrorCode, safeAdminErrorLog } from "./admin-safe-errors";

type DeliveryJob = {
  id: string;
  recipient_id: string;
  delivery_kind: string;
  payload: Record<string, unknown>;
};

export type DeliverySummary = {
  claimed: number;
  completed: number;
  retryableFailed: number;
  dispatcherErrors: number;
};

/**
 * Best-effort post-commit delivery. Authoritative state is already committed;
 * failures remain durably retryable and never cause a route to replay writes.
 */
export async function dispatchNotificationOutbox(
  supabase: SupabaseClient,
  limit = 10,
): Promise<DeliverySummary> {
  const summary: DeliverySummary = {
    claimed: 0,
    completed: 0,
    retryableFailed: 0,
    dispatcherErrors: 0,
  };
  let headers: Record<string, string>;
  try {
    headers = getInternalFunctionHeaders();
  } catch (error) {
    safeAdminErrorLog("notification_outbox_config_failed", error, {
      operation: "notification_outbox_dispatch",
    });
    summary.dispatcherErrors += 1;
    return summary;
  }

  const { data, error } = await supabase.rpc(
    "claim_notification_delivery_jobs",
    { p_limit: Math.max(1, Math.min(limit, 25)) },
  );
  if (error) {
    safeAdminErrorLog("notification_outbox_claim_failed", error, {
      operation: "notification_outbox_claim",
    });
    summary.dispatcherErrors += 1;
    return summary;
  }
  const jobs = Array.isArray(data) ? (data as DeliveryJob[]) : [];
  summary.claimed = jobs.length;

  for (const job of jobs) {
    const delivery = await supabase.functions.invoke("send_push_notification", {
      headers,
      body: {
        recipient_id: job.recipient_id,
        kind: job.delivery_kind,
        data: job.payload,
      },
    });
    const result = delivery.data as
      | { sent?: boolean; skipped?: boolean; error?: string }
      | null;
    if (!delivery.error && (result?.sent || result?.skipped)) {
      const completion = await supabase.rpc(
        "complete_notification_delivery_job",
        { p_job_id: job.id },
      );
      if (completion.error) summary.dispatcherErrors += 1;
      else summary.completed += 1;
      continue;
    }

    const safeCode = delivery.error
      ? safeAdminErrorCode(delivery.error)
      : "dispatcher_error";
    const failure = await supabase.rpc("fail_notification_delivery_job", {
      p_job_id: job.id,
      p_safe_error_code: safeCode,
      p_retryable: true,
    });
    if (failure.error) summary.dispatcherErrors += 1;
    else summary.retryableFailed += 1;
  }
  return summary;
}
