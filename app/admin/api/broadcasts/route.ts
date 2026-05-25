// GET /admin/api/broadcasts — recent incident broadcasts.
// POST /admin/api/broadcasts — send an incident-only broadcast.

import { type NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-actions";
import {
  BROADCAST_ALL_USERS_CONFIRMATION_TEXT,
  BROADCAST_CONFIRMATION_TEXT,
  getBroadcastPreview,
  parseAudienceType,
  type BroadcastAudienceType,
} from "@/lib/admin-broadcasts";
import { getInternalFunctionHeaders } from "@/lib/admin-internal-functions";
import {
  adminErrorResponse,
  safeAdminErrorCode,
  safeAdminErrorLog,
  safeAdminSummary,
} from "@/lib/admin-safe-errors";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
const BROADCAST_SEND_ERROR =
  "Broadcast could not be sent. Try again or check server logs.";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const URL_RE = /(https?:\/\/|www\.|[a-z0-9-]+\.[a-z]{2,})/i;
const MARKETING_RE =
  /\b(promo|promotion|discount|sale|offer|reward|cashback|inactive|hurry)\b|limited time|come back|we miss you|don't miss|dont miss|deal for you/i;

type BroadcastAdmin = {
  id: string;
  display_name: string | null;
  email: string | null;
};

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
  admin?: BroadcastAdmin | BroadcastAdmin[] | null;
};

type DispatcherResult = {
  success: boolean;
  error: string | null;
  result: Record<string, unknown> | null;
};

type BroadcastRequestBody = {
  title?: string;
  body?: string;
  reason?: string;
  audience_type?: string;
  confirmation_text?: string;
  all_eligible_confirmation_text?: string;
  preview_recipient_count?: unknown;
  idempotency_key?: string;
};

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const params = request.nextUrl.searchParams;
  const pageResult = parsePositiveInt(params.get("page"), "page");
  if ("error" in pageResult) return pageResult.error;
  const pageSizeResult = parsePositiveInt(params.get("page_size"), "page_size");
  if ("error" in pageSizeResult) return pageSizeResult.error;

  const page = pageResult.value ?? 1;
  const pageSize = Math.min(pageSizeResult.value ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const offset = (page - 1) * pageSize;
  const status = (params.get("status") ?? "all").trim();
  const audienceType = (params.get("audience_type") ?? "all").trim();

  let query = supabase
    .from("broadcasts")
    .select(
      `id,admin_id,title,body,reason,audience_filter,status,recipient_count,push_success_count,push_failure_count,push_skipped_count,notification_inserted_count,notification_failed_count,sent_at,created_at,completed_at,error_summary,idempotency_key,event_id,
       admin:profiles!broadcasts_admin_id_fkey(id,display_name,email)`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (audienceType && audienceType !== "all") {
    const parsedAudience = parseAudienceType(audienceType);
    if (!parsedAudience) {
      return NextResponse.json(
        { error: "Invalid audience_type" },
        { status: 400 },
      );
    }
    query = query.filter("audience_filter->>audience_type", "eq", parsedAudience);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[admin broadcasts list]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({
    broadcasts: ((data ?? []) as unknown as BroadcastRow[]).map(normalizeBroadcast),
    total: count ?? 0,
    page,
    page_size: pageSize,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { admin, supabase } = auth;

  let body: BroadcastRequestBody;
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validation = validateBroadcastBody(body);
  if ("error" in validation) return validation.error;

  const {
    title,
    body: messageBody,
    reason,
    audienceType,
    idempotencyKey,
    previewRecipientCount,
  } = validation.value;
  let internalHeaders: Record<string, string>;
  try {
    internalHeaders = getInternalFunctionHeaders();
  } catch (error) {
    const correlationId = safeAdminErrorLog(
      "admin_broadcasts_create_config_failed",
      error,
      { operation: "broadcast_create" },
    );
    return adminErrorResponse(BROADCAST_SEND_ERROR, 500, { correlationId });
  }

  const existing = await findBroadcastByIdempotency(supabase, idempotencyKey);
  if (existing) {
    const existingAudience = existing.audience_filter?.audience_type;
    const matches =
      existing.title === title &&
      existing.body === messageBody &&
      existing.reason === reason &&
      existingAudience === audienceType;
    if (!matches) {
      return NextResponse.json(
        { error: "Idempotency key already used for a different broadcast." },
        { status: 409 },
      );
    }
    return NextResponse.json({
      broadcast: normalizeBroadcast(existing),
      idempotent: true,
    });
  }

  let preview: Awaited<ReturnType<typeof getBroadcastPreview>>;
  try {
    preview = await getBroadcastPreview(supabase, audienceType);
  } catch (error) {
    const correlationId = safeAdminErrorLog(
      "admin_broadcasts_create_preview_failed",
      error,
      { operation: "broadcast_create", audience_type: audienceType },
    );
    return adminErrorResponse(BROADCAST_SEND_ERROR, 500, { correlationId });
  }
  if (
    audienceType === "all_eligible" &&
    previewRecipientCount !== preview.recipient_count
  ) {
    return NextResponse.json(
      {
        error:
          "Audience count changed. Refresh the audience preview before sending.",
      },
      { status: 409 },
    );
  }

  const sentAt = new Date().toISOString();
  const eventId = `broadcast:${idempotencyKey}`;
  const { data: inserted, error: insertError } = await supabase
    .from("broadcasts")
    .insert({
      admin_id: admin.id,
      title,
      body: messageBody,
      reason,
      audience_filter: {
        audience_type: audienceType,
        recipient_count: preview.recipient_count,
        push_token_count: preview.push_token_count,
      },
      status: "sending",
      recipient_count: preview.recipient_count,
      sent_at: sentAt,
      idempotency_key: idempotencyKey,
      event_id: eventId,
    })
    .select("id")
    .maybeSingle();

  if (insertError || !inserted?.id) {
    if ((insertError as { code?: string } | null)?.code === "23505") {
      const raced = await findBroadcastByIdempotency(supabase, idempotencyKey);
      if (raced) {
        return NextResponse.json({
          broadcast: normalizeBroadcast(raced),
          idempotent: true,
        });
      }
    }
    const correlationId = safeAdminErrorLog(
      "admin_broadcasts_create_insert_failed",
      insertError,
      { operation: "broadcast_create" },
    );
    return NextResponse.json(
      { error: BROADCAST_SEND_ERROR, correlation_id: correlationId },
      { status: 500 },
    );
  }

  const broadcastId = inserted.id as string;
  const dispatch = await invokeDispatcher(
    supabase,
    broadcastId,
    internalHeaders,
  );
  const broadcast = await fetchBroadcast(supabase, broadcastId);
  if (!broadcast) {
    const correlationId = safeAdminErrorLog(
      "admin_broadcasts_create_reload_failed",
      "broadcast_reload_failed",
      { operation: "broadcast_create" },
    );
    return adminErrorResponse(BROADCAST_SEND_ERROR, 500, { correlationId });
  }

  await logAdminAction(supabase, {
    admin_id: admin.id,
    action_type: "broadcast_sent",
    target_resource_id: broadcast.id,
    target_resource_type: "broadcast",
    reason,
    payload: {
      broadcast_id: broadcast.id,
      title: broadcast.title,
      audience_type: audienceType,
      recipient_count: broadcast.recipient_count,
      notification_inserted_count: broadcast.notification_inserted_count,
      notification_failed_count: broadcast.notification_failed_count,
      push_success_count: broadcast.push_success_count,
      push_failure_count: broadcast.push_failure_count,
      push_skipped_count: broadcast.push_skipped_count,
      status: broadcast.status,
      error_summary: safeAdminSummary(broadcast.error_summary),
      idempotency_key: broadcast.idempotency_key,
      event_id: broadcast.event_id,
      dispatcher_error: dispatch.error,
    },
  });

  if (!dispatch.success) {
    const correlationId = safeAdminErrorLog(
      "admin_broadcasts_create_dispatch_failed",
      dispatch.error,
      { operation: "broadcast_create" },
    );
    return adminErrorResponse(BROADCAST_SEND_ERROR, 502, { correlationId });
  }

  return NextResponse.json({
    broadcast: normalizeBroadcast(broadcast),
    idempotent: false,
    dispatcher: dispatch,
  });
}

function validateBroadcastBody(body: BroadcastRequestBody):
  | {
      value: {
        title: string;
        body: string;
        reason: string;
        audienceType: BroadcastAudienceType;
        idempotencyKey: string;
        previewRecipientCount: number | null;
      };
    }
  | { error: NextResponse } {
  const title = (body.title ?? "").trim();
  const messageBody = (body.body ?? "").trim();
  const reason = (body.reason ?? "").trim();
  const audienceType = parseAudienceType(body.audience_type);
  const idempotencyKey = (body.idempotency_key ?? "").trim();
  const previewRecipientCount = parsePreviewRecipientCount(
    body.preview_recipient_count,
  );

  if (title.length < 5 || title.length > 80) {
    return {
      error: NextResponse.json(
        { error: "Title must be 5-80 characters." },
        { status: 400 },
      ),
    };
  }
  if (messageBody.length < 10 || messageBody.length > 240) {
    return {
      error: NextResponse.json(
        { error: "Body must be 10-240 characters." },
        { status: 400 },
      ),
    };
  }
  if (reason.length < 10 || reason.length > 500) {
    return {
      error: NextResponse.json(
        { error: "Reason must be 10-500 characters." },
        { status: 400 },
      ),
    };
  }
  if (/[\r\n]/.test(title) || /[\r\n]/.test(messageBody)) {
    return {
      error: NextResponse.json(
        { error: "Title and body must be single-line incident notices." },
        { status: 400 },
      ),
    };
  }
  if (URL_RE.test(title) || URL_RE.test(messageBody)) {
    return {
      error: NextResponse.json(
        { error: "Links are not allowed in Phase 8 incident broadcasts." },
        { status: 400 },
      ),
    };
  }
  if (MARKETING_RE.test(title) || MARKETING_RE.test(messageBody)) {
    return {
      error: NextResponse.json(
        {
          error:
            "Broadcasts are for incidents only. Marketing or re-engagement wording is blocked.",
        },
        { status: 400 },
      ),
    };
  }
  if (!audienceType) {
    return {
      error: NextResponse.json(
        { error: "Audience must be test_syed or all_eligible." },
        { status: 400 },
      ),
    };
  }
  if (body.confirmation_text !== BROADCAST_CONFIRMATION_TEXT) {
    return {
      error: NextResponse.json(
        { error: "Confirmation phrase does not match." },
        { status: 400 },
      ),
    };
  }
  if (audienceType === "all_eligible") {
    if (
      body.all_eligible_confirmation_text !==
      BROADCAST_ALL_USERS_CONFIRMATION_TEXT
    ) {
      return {
        error: NextResponse.json(
          { error: "All-user confirmation phrase does not match." },
          { status: 400 },
        ),
      };
    }
    if (previewRecipientCount === null) {
      return {
        error: NextResponse.json(
          { error: "Refresh the audience preview before sending to all users." },
          { status: 400 },
        ),
      };
    }
  }
  if (!UUID_RE.test(idempotencyKey)) {
    return {
      error: NextResponse.json(
        { error: "Invalid idempotency key." },
        { status: 400 },
      ),
    };
  }

  return {
    value: {
      title,
      body: messageBody,
      reason,
      audienceType,
      idempotencyKey,
      previewRecipientCount,
    },
  };
}

function parsePreviewRecipientCount(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isSafeInteger(raw) && raw >= 0) {
    return raw;
  }
  if (typeof raw === "string" && /^\d+$/.test(raw.trim())) {
    const value = Number(raw);
    return Number.isSafeInteger(value) ? value : null;
  }
  return null;
}

async function findBroadcastByIdempotency(
  supabase: SupabaseClient,
  idempotencyKey: string,
): Promise<BroadcastRow | null> {
  const { data, error } = await supabase
    .from("broadcasts")
    .select(
      `id,admin_id,title,body,reason,audience_filter,status,recipient_count,push_success_count,push_failure_count,push_skipped_count,notification_inserted_count,notification_failed_count,sent_at,created_at,completed_at,error_summary,idempotency_key,event_id,
       admin:profiles!broadcasts_admin_id_fkey(id,display_name,email)`,
    )
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  if (error) {
    safeAdminErrorLog("admin_broadcasts_idempotency_lookup_failed", error, {
      operation: "broadcast_idempotency_lookup",
    });
    return null;
  }
  return (data as unknown as BroadcastRow | null) ?? null;
}

async function fetchBroadcast(
  supabase: SupabaseClient,
  broadcastId: string,
): Promise<BroadcastRow | null> {
  const { data, error } = await supabase
    .from("broadcasts")
    .select(
      `id,admin_id,title,body,reason,audience_filter,status,recipient_count,push_success_count,push_failure_count,push_skipped_count,notification_inserted_count,notification_failed_count,sent_at,created_at,completed_at,error_summary,idempotency_key,event_id,
       admin:profiles!broadcasts_admin_id_fkey(id,display_name,email)`,
    )
    .eq("id", broadcastId)
    .maybeSingle();

  if (error) {
    safeAdminErrorLog("admin_broadcasts_reload_failed", error, {
      operation: "broadcast_reload",
    });
    return null;
  }
  return (data as unknown as BroadcastRow | null) ?? null;
}

async function invokeDispatcher(
  supabase: SupabaseClient,
  broadcastId: string,
  internalHeaders: Record<string, string>,
): Promise<DispatcherResult> {
  const { data, error } = await supabase.functions.invoke(
    "broadcast_push_dispatcher",
    {
      headers: internalHeaders,
      body: { broadcast_id: broadcastId },
    },
  );

  if (error) {
    const safeCode = safeAdminErrorCode(error);
    safeAdminErrorLog("admin_broadcasts_dispatcher_invoke_failed", error, {
      operation: "broadcast_dispatch",
    });
    await supabase
      .from("broadcasts")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_summary: [`dispatcher_invoke_failed:${safeCode}`],
      })
      .eq("id", broadcastId);
    return {
      success: false,
      error: `dispatcher_invoke_failed:${safeCode}`,
      result: safeDispatcherResult(data),
    };
  }

  return { success: true, error: null, result: safeDispatcherResult(data) };
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

function normalizeBroadcast(row: BroadcastRow) {
  const admin = Array.isArray(row.admin) ? row.admin[0] : row.admin ?? null;
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
    admin,
  };
}

function parsePositiveInt(
  raw: string | null,
  name: string,
): { value: number | null } | { error: NextResponse } {
  if (raw === null || raw.trim() === "") return { value: null };
  if (!/^\d+$/.test(raw.trim())) {
    return {
      error: NextResponse.json({ error: `Invalid ${name}` }, { status: 400 }),
    };
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) {
    return {
      error: NextResponse.json({ error: `Invalid ${name}` }, { status: 400 }),
    };
  }
  return { value };
}
