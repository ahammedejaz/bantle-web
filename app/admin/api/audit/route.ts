// GET /admin/api/audit — read-only admin_actions feed.

import { type NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

type ProfileSummary = {
  id: string;
  display_name: string | null;
  email: string | null;
};

type TargetUserSummary = ProfileSummary & {
  deleted_at: string | null;
};

type AuditActionRow = {
  id: string;
  admin_id: string;
  action_type: string;
  target_user_id: string | null;
  target_resource_id: string | null;
  target_resource_type: string | null;
  reason: string | null;
  payload: unknown;
  created_at: string;
  admin: ProfileSummary | ProfileSummary[] | null;
  target_user: TargetUserSummary | TargetUserSummary[] | null;
};

type AuditSearch =
  | { orClause: string; forceEmpty?: false }
  | { forceEmpty: true };

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const params = request.nextUrl.searchParams;
  const pageResult = parsePositiveInteger(params.get("page"), "page");
  if ("error" in pageResult) return pageResult.error;

  const pageSizeResult = parsePositiveInteger(
    params.get("page_size"),
    "page_size",
  );
  if ("error" in pageSizeResult) return pageSizeResult.error;

  const page = pageResult.value ?? 1;
  const requestedPageSize = pageSizeResult.value ?? DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(MAX_PAGE_SIZE, requestedPageSize);
  const offset = (page - 1) * pageSize;

  const actionType = (params.get("action_type") ?? "all").trim();
  const adminId = (params.get("admin_id") ?? "").trim();
  const targetUserId = (params.get("target_user_id") ?? "").trim();
  const targetResourceType = (
    params.get("target_resource_type") ?? "all"
  ).trim();
  const targetResourceId = (params.get("target_resource_id") ?? "").trim();
  const q = (params.get("q") ?? "").trim();

  if (adminId && !UUID_RE.test(adminId)) {
    return NextResponse.json({ error: "Invalid admin_id" }, { status: 400 });
  }
  if (targetUserId && !UUID_RE.test(targetUserId)) {
    return NextResponse.json(
      { error: "Invalid target_user_id" },
      { status: 400 },
    );
  }

  const dateFromResult = parseDateParam(params.get("date_from"), "date_from");
  if ("error" in dateFromResult) return dateFromResult.error;
  const dateToResult = parseDateParam(params.get("date_to"), "date_to", true);
  if ("error" in dateToResult) return dateToResult.error;

  const dateFrom = dateFromResult.value;
  const dateTo = dateToResult.value;
  if (dateFrom && dateTo && dateTo.getTime() < dateFrom.getTime()) {
    return NextResponse.json(
      { error: "date_to must be after date_from" },
      { status: 400 },
    );
  }

  const search = q ? await resolveSearch(supabase, q) : null;
  if (search?.forceEmpty) {
    return NextResponse.json({
      actions: [],
      total: 0,
      page,
      page_size: pageSize,
    });
  }

  let query = supabase
    .from("admin_actions")
    .select(
      `id,admin_id,action_type,target_user_id,target_resource_id,target_resource_type,reason,payload,created_at,
       admin:profiles!admin_actions_admin_id_fkey(id,display_name,email),
       target_user:profiles!admin_actions_target_user_id_fkey(id,display_name,email,deleted_at)`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (actionType && actionType !== "all") {
    query = query.eq("action_type", actionType);
  }
  if (adminId) {
    query = query.eq("admin_id", adminId);
  }
  if (targetUserId) {
    query = query.eq("target_user_id", targetUserId);
  }
  if (targetResourceType && targetResourceType !== "all") {
    query = query.eq("target_resource_type", targetResourceType);
  }
  if (targetResourceId) {
    query = query.eq("target_resource_id", targetResourceId);
  }
  if (dateFrom) {
    query = query.gte("created_at", dateFrom.toISOString());
  }
  if (dateTo) {
    query = query.lte("created_at", dateTo.toISOString());
  }
  if (search && !search.forceEmpty) {
    query = query.or(search.orClause);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[admin audit list]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({
    actions: ((data ?? []) as unknown as AuditActionRow[]).map(
      normalizeAuditAction,
    ),
    total: count ?? 0,
    page,
    page_size: pageSize,
  });
}

function parsePositiveInteger(
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

function parseDateParam(
  raw: string | null,
  name: string,
  endOfDay = false,
): { value: Date | null } | { error: NextResponse } {
  if (raw === null || raw.trim() === "") return { value: null };
  const trimmed = raw.trim();
  const date = DATE_ONLY_RE.test(trimmed)
    ? new Date(
        `${trimmed}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`,
      )
    : new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    return {
      error: NextResponse.json({ error: `Invalid ${name}` }, { status: 400 }),
    };
  }
  return { value: date };
}

async function resolveSearch(
  supabase: SupabaseClient,
  q: string,
): Promise<AuditSearch> {
  if (UUID_RE.test(q)) {
    return {
      orClause: [
        `id.eq.${q}`,
        `admin_id.eq.${q}`,
        `target_user_id.eq.${q}`,
        `target_resource_id.eq.${q}`,
      ].join(","),
    };
  }

  const safe = q.replace(/[,%()*]/g, "").trim();
  if (!safe) return { forceEmpty: true };

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .or(`email.ilike.%${safe}%,display_name.ilike.%${safe}%`)
    .limit(100);

  if (error) {
    console.warn("[admin audit list] profile search failed:", error.message);
  }

  const profileIds = ((data ?? []) as Array<{ id: string | null }>)
    .map((profile) => profile.id)
    .filter((id): id is string => Boolean(id));

  const clauses = [
    `action_type.ilike.%${safe}%`,
    `target_resource_type.ilike.%${safe}%`,
    `target_resource_id.ilike.%${safe}%`,
    `reason.ilike.%${safe}%`,
  ];

  if (profileIds.length > 0) {
    clauses.push(`admin_id.in.(${profileIds.join(",")})`);
    clauses.push(`target_user_id.in.(${profileIds.join(",")})`);
  }

  return { orClause: clauses.join(",") };
}

function normalizeAuditAction(row: AuditActionRow) {
  return {
    ...row,
    admin: Array.isArray(row.admin) ? (row.admin[0] ?? null) : row.admin,
    target_user: Array.isArray(row.target_user)
      ? (row.target_user[0] ?? null)
      : row.target_user,
  };
}
