// GET /admin/api/broadcasts — recent incident broadcasts.
// POST /admin/api/broadcasts — send an incident-only broadcast.

import { type NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-actions";
import {
  BROADCAST_CONFIRMATION_TEXT,
  getBroadcastPreview,
  parseAudienceType,
  type BroadcastAudienceType,
} from "@/lib/admin-broadcasts";
import {
  getInternalFunctionHeaders,
  internalFunctionConfigError,
} from "@/lib/admin-internal-functions";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
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

  let body: {
    title?: string;
    body?: string;
    reason?: string;
    audience_type?: string;
    confirmation_text?: string;
    idempotency_key?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validation = validateBroadcastBody(body);
  if ("error" in validation) return validation.error;

  const { title, body: messageBody, reason, audienceType, idempotencyKey } =
    validation.value;
  let internalHeaders: Record<string, string>;
  try {
    internalHeaders = getInternalFunctionHeaders();
  } catch (error) {
    const message = internalFunctionConfigError(error);
    console.error("[admin broadcasts create] dispatcher config failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
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

  const preview = await getBroadcastPreview(supabase, audienceType);

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
    console.error("[admin broadcasts create]", insertError);
    return NextResponse.json(
      { error: insertError?.message ?? "Broadcast create failed." },
      { status: 500 },
    );
  }

  const broadcastId = inserted.id as string;
  const dispatch = await invokeDispatcher(supabase, broadcastId, internalHeaders);
  const broadcast = await fetchBroadcast(supabase, broadcastId);
  if (!broadcast) {
    return NextResponse.json(
      { error: "Broadcast dispatched, but reload failed." },
      { status: 500 },
    );
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
      error_summary: broadcast.error_summary,
      idempotency_key: broadcast.idempotency_key,
      event_id: broadcast.event_id,
      dispatcher_error: dispatch.error,
    },
  });

  return NextResponse.json({
    broadcast: normalizeBroadcast(broadcast),
    idempotent: false,
    dispatcher: dispatch,
  });
}

function validateBroadcastBody(body: {
  title?: string;
  body?: string;
  reason?: string;
  audience_type?: string;
  confirmation_text?: string;
  idempotency_key?: string;
}):
  | {
      value: {
        title: string;
        body: string;
        reason: string;
        audienceType: BroadcastAudienceType;
        idempotencyKey: string;
      };
    }
  | { error: NextResponse } {
  const title = (body.title ?? "").trim();
  const messageBody = (body.body ?? "").trim();
  const reason = (body.reason ?? "").trim();
  const audienceType = parseAudienceType(body.audience_type);
  const idempotencyKey = (body.idempotency_key ?? "").trim();

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
    },
  };
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
    console.warn("[admin broadcasts] idempotency lookup failed:", error.message);
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
    console.error("[admin broadcasts] reload failed:", error);
    return null;
  }
  return (data as unknown as BroadcastRow | null) ?? null;
}

async function invokeDispatcher(
  supabase: SupabaseClient,
  broadcastId: string,
  internalHeaders: Record<string, string>,
): Promise<{ success: boolean; error: string | null; result: unknown }> {
  const { data, error } = await supabase.functions.invoke(
    "broadcast_push_dispatcher",
    {
      headers: internalHeaders,
      body: { broadcast_id: broadcastId },
    },
  );

  if (error) {
    const message = error.message;
    await supabase
      .from("broadcasts")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_summary: [`dispatcher_invoke_failed:${message}`],
      })
      .eq("id", broadcastId);
    return { success: false, error: message, result: data ?? null };
  }

  return { success: true, error: null, result: data ?? null };
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
    error_summary: row.error_summary,
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
