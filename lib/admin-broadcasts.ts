import type { SupabaseClient } from "@supabase/supabase-js";

export const BROADCAST_CONFIRMATION_TEXT = "SEND INCIDENT BROADCAST";

export type BroadcastAudienceType = "test_syed" | "all_eligible";

export interface BroadcastPreview {
  audience_type: BroadcastAudienceType;
  recipient_count: number;
  push_token_count: number;
  no_push_token_count: number;
  excluded_deleted_or_banned_count: number;
}

type ProfileAudienceRow = {
  id: string;
  push_token: string | null;
  deleted_at: string | null;
  banned_until: string | null;
  permanently_banned: boolean | null;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseAudienceType(
  raw: string | null | undefined,
): BroadcastAudienceType | null {
  if (raw === "test_syed" || raw === "all_eligible") return raw;
  return null;
}

export function getTestBroadcastUserId(): string {
  const configured = process.env.BANTLE_BROADCAST_TEST_USER_ID?.trim();
  if (!configured) {
    throw new Error("Broadcast test recipient is not configured.");
  }
  if (!UUID_RE.test(configured)) {
    throw new Error("Broadcast test recipient is not configured correctly.");
  }
  return configured;
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

  return {
    audience_type: audienceType,
    recipient_count: eligible.length,
    push_token_count: pushTokenCount,
    no_push_token_count: eligible.length - pushTokenCount,
    excluded_deleted_or_banned_count: rows.length - eligible.length,
  };
}

function isBroadcastEligible(row: ProfileAudienceRow): boolean {
  if (row.deleted_at) return false;
  if (row.permanently_banned) return false;
  if (!row.banned_until) return true;
  const bannedUntil = new Date(row.banned_until).getTime();
  return Number.isNaN(bannedUntil) || bannedUntil <= Date.now();
}
