import type { SupabaseClient } from "@supabase/supabase-js";

export const BROADCAST_CONFIRMATION_TEXT = "SEND INCIDENT BROADCAST";
export const BROADCAST_TEST_USER_FALLBACK =
  "b0103e79-885f-4ea8-a353-5a91c2db007c";

export type BroadcastAudienceType = "test_syed" | "all_eligible";

export interface BroadcastPreview {
  audience_type: BroadcastAudienceType;
  recipient_count: number;
  push_token_count: number;
  no_push_token_count: number;
  excluded_deleted_or_banned_count: number;
  rate_limit: {
    allowed: boolean;
    next_allowed_at: string | null;
  };
}

export interface BroadcastRateLimit {
  all_user_allowed: boolean;
  next_allowed_at: string | null;
  last_all_user_broadcast_at: string | null;
}

type ProfileAudienceRow = {
  id: string;
  push_token: string | null;
  deleted_at: string | null;
  banned_until: string | null;
  permanently_banned: boolean | null;
};

type RateLimitBroadcastRow = {
  sent_at: string | null;
  created_at: string | null;
  audience_filter: unknown;
};

export function parseAudienceType(
  raw: string | null | undefined,
): BroadcastAudienceType | null {
  if (raw === "test_syed" || raw === "all_eligible") return raw;
  return null;
}

export function getTestBroadcastUserId(): string {
  return (
    process.env.BANTLE_BROADCAST_TEST_USER_ID ?? BROADCAST_TEST_USER_FALLBACK
  );
}

export async function getBroadcastRateLimit(
  supabase: SupabaseClient,
): Promise<BroadcastRateLimit> {
  const { data, error } = await supabase
    .from("broadcasts")
    .select("sent_at,created_at,audience_filter")
    .in("status", ["sending", "completed", "partial_failure"])
    .order("sent_at", { ascending: false, nullsFirst: false })
    .limit(50);

  if (error) {
    console.warn("[admin broadcasts] rate limit lookup failed:", error.message);
    return {
      all_user_allowed: false,
      next_allowed_at: null,
      last_all_user_broadcast_at: null,
    };
  }

  const lastAllUser = ((data ?? []) as RateLimitBroadcastRow[]).find((row) => {
    const audience = row.audience_filter as { audience_type?: unknown } | null;
    return audience?.audience_type === "all_eligible";
  });

  const lastAt = lastAllUser?.sent_at ?? lastAllUser?.created_at ?? null;
  if (!lastAt) {
    return {
      all_user_allowed: true,
      next_allowed_at: null,
      last_all_user_broadcast_at: null,
    };
  }

  const lastTime = new Date(lastAt).getTime();
  if (Number.isNaN(lastTime)) {
    return {
      all_user_allowed: true,
      next_allowed_at: null,
      last_all_user_broadcast_at: null,
    };
  }

  const nextAllowed = lastTime + 24 * 60 * 60 * 1000;
  const allowed = Date.now() >= nextAllowed;
  return {
    all_user_allowed: allowed,
    next_allowed_at: allowed ? null : new Date(nextAllowed).toISOString(),
    last_all_user_broadcast_at: lastAt,
  };
}

export async function getBroadcastPreview(
  supabase: SupabaseClient,
  audienceType: BroadcastAudienceType,
): Promise<BroadcastPreview> {
  let query = supabase
    .from("profiles")
    .select("id,push_token,deleted_at,banned_until,permanently_banned");

  if (audienceType === "test_syed") {
    query = query.eq("id", getTestBroadcastUserId());
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Audience lookup failed: ${error.message}`);
  }

  const rows = ((data ?? []) as ProfileAudienceRow[]).filter((row) => !!row.id);
  const eligible = rows.filter(isBroadcastEligible);
  const pushTokenCount = eligible.filter((row) => !!row.push_token).length;
  const rateLimit = await getBroadcastRateLimit(supabase);

  return {
    audience_type: audienceType,
    recipient_count: eligible.length,
    push_token_count: pushTokenCount,
    no_push_token_count: eligible.length - pushTokenCount,
    excluded_deleted_or_banned_count: rows.length - eligible.length,
    rate_limit: {
      allowed: audienceType === "test_syed" ? true : rateLimit.all_user_allowed,
      next_allowed_at:
        audienceType === "test_syed" ? null : rateLimit.next_allowed_at,
    },
  };
}

function isBroadcastEligible(row: ProfileAudienceRow): boolean {
  if (row.deleted_at) return false;
  if (row.permanently_banned) return false;
  if (!row.banned_until) return true;
  const bannedUntil = new Date(row.banned_until).getTime();
  return Number.isNaN(bannedUntil) || bannedUntil <= Date.now();
}
