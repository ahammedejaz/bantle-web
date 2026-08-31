// Read-only aggregate metrics behind the admin dashboard.
//
// One implementation, two callers: the server component renders the first
// paint with this data directly (no client fetch, no skeleton), and
// GET /admin/api/dashboard serves the same shape to the client-side Refresh
// button. Both hand in a service-role client, so the counts are identical
// whichever path produced them.

import type { SupabaseClient } from "@supabase/supabase-js";

type CountResult = {
  count: number | null;
  error: { code?: string; message: string } | null;
};

type ProfileSummary = {
  display_name: string | null;
  email: string | null;
};

type LatestAuditRow = {
  id: string;
  action_type: string;
  target_resource_type: string | null;
  target_resource_id: string | null;
  created_at: string;
  admin: ProfileSummary | ProfileSummary[] | null;
};

export type DashboardData = {
  /** ISO timestamp of when these numbers were computed. */
  generated_at: string;
  users: {
    total: number;
    active: number;
    deleted: number;
    temporarily_banned: number;
    permanently_banned: number;
    with_push_token: number;
    new_7d: number;
    new_30d: number;
  };
  reports: {
    total: number;
    open: number;
    resolved: number;
    dismissed: number;
    new_7d: number;
    new_30d: number;
  };
  /**
   * The human review queues. Everything here is a count of items sitting in
   * `pending`, i.e. a user actively waiting on an admin decision. These are
   * the numbers the dashboard exists to surface.
   */
  queues: {
    identity_verifications_pending: number;
    name_change_requests_pending: number;
    platform_requests_pending: number;
  };
  listings: {
    total: number;
    active: number;
    closed: number;
    archived: number;
    created_7d: number;
    created_30d: number;
  };
  deals: {
    total: number;
    pending: number;
    active: number;
    completed: number;
    cancelled: number;
    disputed: number;
    created_7d: number;
    created_30d: number;
  };
  platforms: {
    total: number;
    active: number;
    inactive: number;
  };
  broadcasts: {
    total: number;
    completed: number;
    partial_failure: number;
    failed: number;
    sent_7d: number;
    sent_30d: number;
  };
  audit: {
    total_actions: number;
    actions_7d: number;
    actions_30d: number;
    listing_closed_actions: number;
    deal_terminated_actions: number;
    broadcast_sent_actions: number;
    latest_actions: Array<{
      id: string;
      action_type: string;
      target_resource_type: string | null;
      target_resource_id: string | null;
      created_at: string;
      admin: ProfileSummary | null;
    }>;
  };
};

export async function getDashboardMetrics(
  supabase: SupabaseClient,
): Promise<DashboardData> {
  const now = new Date();
  const nowIso = now.toISOString();
  const since7d = daysAgo(now, 7).toISOString();
  const since30d = daysAgo(now, 30).toISOString();

  const [users, reports, queues, listings, deals, platforms, broadcasts, audit] =
    await Promise.all([
      getUserMetrics(supabase, nowIso, since7d, since30d),
      getReportMetrics(supabase, since7d, since30d),
      getQueueMetrics(supabase),
      getListingMetrics(supabase, since7d, since30d),
      getDealMetrics(supabase, since7d, since30d),
      getPlatformMetrics(supabase),
      getBroadcastMetrics(supabase, since7d, since30d),
      getAuditMetrics(supabase, since7d, since30d),
    ]);

  return {
    generated_at: nowIso,
    users,
    reports,
    queues,
    listings,
    deals,
    platforms,
    broadcasts,
    audit,
  };
}

async function getUserMetrics(
  supabase: SupabaseClient,
  nowIso: string,
  since7d: string,
  since30d: string,
) {
  const activeBase = () =>
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .or("permanently_banned.is.null,permanently_banned.eq.false");

  const [
    total,
    activeNoBan,
    activeExpiredBan,
    deleted,
    temporarilyBanned,
    permanentlyBanned,
    activePushNoBan,
    activePushExpiredBan,
    new7d,
    new30d,
  ] = await Promise.all([
    countOrThrow(
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      "users.total",
    ),
    countOrThrow(activeBase().is("banned_until", null), "users.active_null"),
    countOrThrow(
      activeBase().lte("banned_until", nowIso),
      "users.active_expired_ban",
    ),
    countOrThrow(
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .not("deleted_at", "is", null),
      "users.deleted",
    ),
    countOrThrow(
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null)
        .gt("banned_until", nowIso),
      "users.temporarily_banned",
    ),
    countOrThrow(
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null)
        .eq("permanently_banned", true),
      "users.permanently_banned",
    ),
    countOrThrow(
      activeBase().not("push_token", "is", null).is("banned_until", null),
      "users.with_push_token_null",
    ),
    countOrThrow(
      activeBase().not("push_token", "is", null).lte("banned_until", nowIso),
      "users.with_push_token_expired_ban",
    ),
    countOrThrow(
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since7d),
      "users.new_7d",
    ),
    countOrThrow(
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since30d),
      "users.new_30d",
    ),
  ]);

  return {
    total,
    active: activeNoBan + activeExpiredBan,
    deleted,
    temporarily_banned: temporarilyBanned,
    permanently_banned: permanentlyBanned,
    with_push_token: activePushNoBan + activePushExpiredBan,
    new_7d: new7d,
    new_30d: new30d,
  };
}

async function getReportMetrics(
  supabase: SupabaseClient,
  since7d: string,
  since30d: string,
) {
  const [total, open, reviewed, actioned, dismissed, new7d, new30d] =
    await Promise.all([
      countOrThrow(
        supabase
          .from("user_reports")
          .select("id", { count: "exact", head: true }),
        "reports.total",
      ),
      countOrThrow(
        supabase
          .from("user_reports")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        "reports.open",
      ),
      countOrThrow(
        supabase
          .from("user_reports")
          .select("id", { count: "exact", head: true })
          .eq("status", "reviewed"),
        "reports.reviewed",
      ),
      countOrThrow(
        supabase
          .from("user_reports")
          .select("id", { count: "exact", head: true })
          .eq("status", "actioned"),
        "reports.actioned",
      ),
      countOrThrow(
        supabase
          .from("user_reports")
          .select("id", { count: "exact", head: true })
          .eq("status", "dismissed"),
        "reports.dismissed",
      ),
      countOrThrow(
        supabase
          .from("user_reports")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since7d),
        "reports.new_7d",
      ),
      countOrThrow(
        supabase
          .from("user_reports")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since30d),
        "reports.new_30d",
      ),
    ]);

  return {
    total,
    open,
    resolved: reviewed + actioned,
    dismissed,
    new_7d: new7d,
    new_30d: new30d,
  };
}

// The three review queues live in tables added after the dashboard was first
// built (identity verification, name changes, platform requests). Each uses
// the same pending/approved/rejected status enum; `pending` is the queue.
async function getQueueMetrics(supabase: SupabaseClient) {
  const [identityPending, nameChangesPending, platformRequestsPending] =
    await Promise.all([
      countOrThrow(
        supabase
          .from("profile_verifications")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        "queues.identity_verifications_pending",
      ),
      countOrThrow(
        supabase
          .from("name_change_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        "queues.name_change_requests_pending",
      ),
      countOrThrow(
        supabase
          .from("platform_requests")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        "queues.platform_requests_pending",
      ),
    ]);

  return {
    identity_verifications_pending: identityPending,
    name_change_requests_pending: nameChangesPending,
    platform_requests_pending: platformRequestsPending,
  };
}

async function getListingMetrics(
  supabase: SupabaseClient,
  since7d: string,
  since30d: string,
) {
  const [total, active, closed, archived, created7d, created30d] =
    await Promise.all([
      countOrThrow(
        supabase.from("listings").select("id", { count: "exact", head: true }),
        "listings.total",
      ),
      countOrThrow(
        supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("status", "active")
          .is("archived_at", null),
        "listings.active",
      ),
      countOrThrow(
        supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("status", "closed"),
        "listings.closed",
      ),
      countOrThrow(
        supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .not("archived_at", "is", null),
        "listings.archived",
      ),
      countOrThrow(
        supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since7d),
        "listings.created_7d",
      ),
      countOrThrow(
        supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since30d),
        "listings.created_30d",
      ),
    ]);

  return {
    total,
    active,
    closed,
    archived,
    created_7d: created7d,
    created_30d: created30d,
  };
}

async function getDealMetrics(
  supabase: SupabaseClient,
  since7d: string,
  since30d: string,
) {
  const statuses = ["pending", "active", "completed", "cancelled", "disputed"];
  const [
    total,
    pending,
    active,
    completed,
    cancelled,
    disputed,
    created7d,
    created30d,
  ] = await Promise.all([
    countOrThrow(
      supabase.from("deals").select("id", { count: "exact", head: true }),
      "deals.total",
    ),
    ...statuses.map((status) =>
      countOrThrow(
        supabase
          .from("deals")
          .select("id", { count: "exact", head: true })
          .eq("status", status),
        `deals.${status}`,
      ),
    ),
    countOrThrow(
      supabase
        .from("deals")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since7d),
      "deals.created_7d",
    ),
    countOrThrow(
      supabase
        .from("deals")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since30d),
      "deals.created_30d",
    ),
  ]);

  return {
    total,
    pending,
    active,
    completed,
    cancelled,
    disputed,
    created_7d: created7d,
    created_30d: created30d,
  };
}

async function getPlatformMetrics(supabase: SupabaseClient) {
  const [total, active, inactive] = await Promise.all([
    countOrThrow(
      supabase.from("platforms").select("id", { count: "exact", head: true }),
      "platforms.total",
    ),
    countOrThrow(
      supabase
        .from("platforms")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      "platforms.active",
    ),
    countOrThrow(
      supabase
        .from("platforms")
        .select("id", { count: "exact", head: true })
        .eq("is_active", false),
      "platforms.inactive",
    ),
  ]);

  return { total, active, inactive };
}

async function getBroadcastMetrics(
  supabase: SupabaseClient,
  since7d: string,
  since30d: string,
) {
  const [total, completed, partialFailure, failed, sent7d, sent30d] =
    await Promise.all([
      countOptionalBroadcast(
        supabase
          .from("broadcasts")
          .select("id", { count: "exact", head: true }),
        "broadcasts.total",
      ),
      countOptionalBroadcast(
        supabase
          .from("broadcasts")
          .select("id", { count: "exact", head: true })
          .eq("status", "completed"),
        "broadcasts.completed",
      ),
      countOptionalBroadcast(
        supabase
          .from("broadcasts")
          .select("id", { count: "exact", head: true })
          .eq("status", "partial_failure"),
        "broadcasts.partial_failure",
      ),
      countOptionalBroadcast(
        supabase
          .from("broadcasts")
          .select("id", { count: "exact", head: true })
          .eq("status", "failed"),
        "broadcasts.failed",
      ),
      countOptionalBroadcast(
        supabase
          .from("broadcasts")
          .select("id", { count: "exact", head: true })
          .gte("sent_at", since7d),
        "broadcasts.sent_7d",
      ),
      countOptionalBroadcast(
        supabase
          .from("broadcasts")
          .select("id", { count: "exact", head: true })
          .gte("sent_at", since30d),
        "broadcasts.sent_30d",
      ),
    ]);

  return {
    total,
    completed,
    partial_failure: partialFailure,
    failed,
    sent_7d: sent7d,
    sent_30d: sent30d,
  };
}

async function getAuditMetrics(
  supabase: SupabaseClient,
  since7d: string,
  since30d: string,
) {
  const [
    totalActions,
    actions7d,
    actions30d,
    listingClosedActions,
    dealTerminatedActions,
    broadcastSentActions,
    latestActions,
  ] = await Promise.all([
    countOrThrow(
      supabase
        .from("admin_actions")
        .select("id", { count: "exact", head: true }),
      "audit.total_actions",
    ),
    countOrThrow(
      supabase
        .from("admin_actions")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since7d),
      "audit.actions_7d",
    ),
    countOrThrow(
      supabase
        .from("admin_actions")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since30d),
      "audit.actions_30d",
    ),
    countOrThrow(
      supabase
        .from("admin_actions")
        .select("id", { count: "exact", head: true })
        .eq("action_type", "listing_closed"),
      "audit.listing_closed_actions",
    ),
    countOrThrow(
      supabase
        .from("admin_actions")
        .select("id", { count: "exact", head: true })
        .eq("action_type", "deal_terminated"),
      "audit.deal_terminated_actions",
    ),
    countOrThrow(
      supabase
        .from("admin_actions")
        .select("id", { count: "exact", head: true })
        .eq("action_type", "broadcast_sent"),
      "audit.broadcast_sent_actions",
    ),
    getLatestActions(supabase),
  ]);

  return {
    total_actions: totalActions,
    actions_7d: actions7d,
    actions_30d: actions30d,
    listing_closed_actions: listingClosedActions,
    deal_terminated_actions: dealTerminatedActions,
    broadcast_sent_actions: broadcastSentActions,
    latest_actions: latestActions,
  };
}

async function getLatestActions(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("admin_actions")
    .select(
      `id,action_type,target_resource_type,target_resource_id,created_at,
       admin:profiles!admin_actions_admin_id_fkey(display_name,email)`,
    )
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    throw new Error(`audit.latest_actions: ${error.message}`);
  }

  return ((data ?? []) as unknown as LatestAuditRow[]).map((action) => ({
    id: action.id,
    action_type: action.action_type,
    target_resource_type: action.target_resource_type,
    target_resource_id: action.target_resource_id,
    created_at: action.created_at,
    admin: normalizeLatestActionAdmin(action.admin),
  }));
}

function normalizeLatestActionAdmin(
  rawAdmin: ProfileSummary | ProfileSummary[] | null,
): ProfileSummary | null {
  const admin = Array.isArray(rawAdmin) ? (rawAdmin[0] ?? null) : rawAdmin;
  if (!admin) return null;

  const trimmedDisplayName = admin.display_name?.trim() ?? "";
  const displayName = trimmedDisplayName || null;
  return {
    display_name: displayName,
    email: displayName ? null : maskEmailForAdminDisplay(admin.email),
  };
}

function maskEmailForAdminDisplay(email?: string | null): string | null {
  const trimmed = email?.trim();
  if (!trimmed) return null;

  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 0 || atIndex === trimmed.length - 1) return null;

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  return `${local[0]}***@${domain}`;
}

async function countOrThrow(
  query: PromiseLike<CountResult>,
  label: string,
): Promise<number> {
  const { count, error } = await query;
  if (error) throw new Error(`${label}: ${error.message}`);
  return count ?? 0;
}

async function countOptionalBroadcast(
  query: PromiseLike<CountResult>,
  label: string,
): Promise<number> {
  const { count, error } = await query;
  if (!error) return count ?? 0;
  if (isMissingBroadcastTable(error)) return 0;
  throw new Error(`${label}: ${error.message}`);
}

function isMissingBroadcastTable(error: { code?: string; message: string }) {
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    (error.message.toLowerCase().includes("broadcasts") &&
      error.message.toLowerCase().includes("could not find"))
  );
}

function daysAgo(now: Date, days: number) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}
