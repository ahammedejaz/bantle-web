// POST /admin/api/broadcasts/[id]/retry - retry delivery for an existing
// failed/partial incident broadcast without creating a new broadcast row.

import { type NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-actions";
import {
  getInternalFunctionHeaders,
} from "@/lib/admin-internal-functions";
import {
  adminErrorResponse,
  safeAdminErrorCode,
  safeAdminErrorLog,
  safeAdminSummary,
} from "@/lib/admin-safe-errors";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type BroadcastRow = {
  id: string;
  admin_id: string;
  title: string;
  body: string;
  reason: string;
  audience_filter: Record<string, unknown>;
  status: string;
  recipient_count: number;
  push_success_count: number;
  push_failure_count: number;
  push_skipped_count: number;
  notification_inserted_count: number;
  notification_failed_count: number;
  sent_at: string | null;
  created_at: string;
  completed_at: string | null;
  error_summary: unknown;
  idempotency_key: string;
  event_id: string;
};

type DispatcherResult = {
  success: boolean;
  error: string | null;
  result: Record<string, unknown> | null;
};

const BROADCAST_RETRY_ERROR =
  "Broadcast retry could not be completed. Try again or check server logs.";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { admin, supabase } = auth;
  const { id } = await params;

  const broadcastId = id;
  if (!UUID_RE.test(broadcastId)) {
    return NextResponse.json({ error: "Invalid broadcast id." }, { status: 400 });
  }

  const before = await fetchBroadcast(supabase, broadcastId);
  if (!before) {
    return NextResponse.json({ error: "Broadcast not found." }, { status: 404 });
  }
  if (before.status !== "failed" && before.status !== "partial_failure") {
    return NextResponse.json(
      { error: "Only failed or partial-failure broadcasts can be retried." },
      { status: 409 },
    );
  }

  let internalHeaders: Record<string, string>;
  try {
    internalHeaders = getInternalFunctionHeaders();
  } catch (error) {
    const correlationId = safeAdminErrorLog(
      "admin_broadcasts_retry_config_failed",
      error,
      { operation: "broadcast_retry" },
    );
    return adminErrorResponse(BROADCAST_RETRY_ERROR, 500, { correlationId });
  }

  const dispatch = await invokeDispatcherRetry(
    supabase,
    broadcastId,
    internalHeaders,
  );
  const after = await fetchBroadcast(supabase, broadcastId);
  if (!after) {
    const correlationId = safeAdminErrorLog(
      "admin_broadcasts_retry_reload_failed",
      "broadcast_reload_failed",
      { operation: "broadcast_retry" },
    );
    return adminErrorResponse(BROADCAST_RETRY_ERROR, 500, { correlationId });
  }

  await logAdminAction(supabase, {
    admin_id: admin.id,
    action_type: "broadcast_retried",
    target_resource_id: after.id,
    target_resource_type: "broadcast",
    reason: before.reason,
    payload: {
      retry: true,
      broadcast_id: after.id,
      title: after.title,
      audience_type:
        typeof after.audience_filter?.audience_type === "string"
          ? after.audience_filter.audience_type
          : "unknown",
      previous_status: before.status,
      status: after.status,
      recipient_count: after.recipient_count,
      notification_inserted_count: after.notification_inserted_count,
      notification_failed_count: after.notification_failed_count,
      push_success_count: after.push_success_count,
      push_failure_count: after.push_failure_count,
      push_skipped_count: after.push_skipped_count,
      error_summary: safeAdminSummary(after.error_summary),
      idempotency_key: after.idempotency_key,
      event_id: after.event_id,
      dispatcher_error: dispatch.error,
    },
  });

  if (!dispatch.success) {
    const correlationId = safeAdminErrorLog(
      "admin_broadcasts_retry_dispatch_failed",
      dispatch.error,
      { operation: "broadcast_retry" },
    );
    return adminErrorResponse(BROADCAST_RETRY_ERROR, 502, { correlationId });
  }

  return NextResponse.json({
    broadcast: normalizeBroadcast(after),
    dispatcher: dispatch,
  });
}

async function fetchBroadcast(
  supabase: SupabaseClient,
  broadcastId: string,
): Promise<BroadcastRow | null> {
  const { data, error } = await supabase
    .from("broadcasts")
    .select(
      "id,admin_id,title,body,reason,audience_filter,status,recipient_count,push_success_count,push_failure_count,push_skipped_count,notification_inserted_count,notification_failed_count,sent_at,created_at,completed_at,error_summary,idempotency_key,event_id",
    )
    .eq("id", broadcastId)
    .maybeSingle();

  if (error) {
    safeAdminErrorLog("admin_broadcasts_retry_lookup_failed", error, {
      operation: "broadcast_retry_lookup",
    });
    return null;
  }
  return (data as unknown as BroadcastRow | null) ?? null;
}

async function invokeDispatcherRetry(
  supabase: SupabaseClient,
  broadcastId: string,
  internalHeaders: Record<string, string>,
): Promise<DispatcherResult> {
  const { data, error } = await supabase.functions.invoke(
    "broadcast_push_dispatcher",
    {
      headers: internalHeaders,
      body: { broadcast_id: broadcastId, retry: true },
    },
  );

  if (error) {
    const safeCode = safeAdminErrorCode(error);
    safeAdminErrorLog("admin_broadcasts_retry_dispatcher_failed", error, {
      operation: "broadcast_retry_dispatch",
    });
    return {
      success: false,
      error: `dispatcher_invoke_failed:${safeCode}`,
      result: safeDispatcherResult(data),
    };
  }

  return { success: true, error: null, result: safeDispatcherResult(data) };
}

function normalizeBroadcast(row: BroadcastRow) {
  return {
    id: row.id,
    admin_id: row.admin_id,
    title: row.title,
    body: row.body,
    reason: row.reason,
    audience_filter: row.audience_filter,
    audience_type:
      typeof row.audience_filter?.audience_type === "string"
        ? row.audience_filter.audience_type
        : "unknown",
    status: row.status,
    recipient_count: row.recipient_count,
    push_success_count: row.push_success_count,
    push_failure_count: row.push_failure_count,
    push_skipped_count: row.push_skipped_count,
    notification_inserted_count: row.notification_inserted_count,
    notification_failed_count: row.notification_failed_count,
    sent_at: row.sent_at,
    created_at: row.created_at,
    completed_at: row.completed_at,
    error_summary: safeAdminSummary(row.error_summary),
    idempotency_key: row.idempotency_key,
    event_id: row.event_id,
  };
}

function safeDispatcherResult(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of [
    "status",
    "correlation_id",
    "recipient_count",
    "notification_inserted_count",
    "notification_failed_count",
    "push_success_count",
    "push_failure_count",
    "push_skipped_count",
  ]) {
    const value = record[key];
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      result[key] = value;
    }
  }
  if (Array.isArray(record.errors)) {
    result.error_count = record.errors.length;
  }
  return result;
}
