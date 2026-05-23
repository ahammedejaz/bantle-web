// GET /admin/api/deals — search and filter deals for admin review.

import { type NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
const ZERO_UUID = "00000000-0000-0000-0000-000000000000";
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ProfileSummary = {
  id: string;
  display_name: string | null;
  email: string | null;
  deleted_at: string | null;
  banned_until: string | null;
  permanently_banned: boolean | null;
  is_admin?: boolean | null;
};

type ListingSummary = {
  id: string;
  title: string | null;
  platform: string | null;
  status: string | null;
  archived_at: string | null;
};

type DealListRow = {
  id: string;
  listing_id: string;
  host_id: string | null;
  buyer_id: string | null;
  conversation_id: string | null;
  status: string | null;
  agreed_price: number;
  duration_months: number | null;
  started_at: string | null;
  ends_at: string | null;
  terminated_at: string | null;
  terminated_by: string | null;
  termination_reason: string | null;
  termination_source: string | null;
  created_at: string | null;
  listing: ListingSummary | ListingSummary[] | null;
  host: ProfileSummary | ProfileSummary[] | null;
  buyer: ProfileSummary | ProfileSummary[] | null;
};

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const params = request.nextUrl.searchParams;
  const q = (params.get("q") ?? "").trim();
  const userId = (params.get("user_id") ?? "").trim();
  const listingId = (params.get("listing_id") ?? "").trim();
  const platform = (params.get("platform") ?? "").trim();
  const status = (params.get("status") ?? "all").trim();
  const role = (params.get("role") ?? "all").trim();
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10));
  const requestedPageSize = parseInt(
    params.get("page_size") ?? String(DEFAULT_PAGE_SIZE),
    10,
  );
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(
      1,
      Number.isFinite(requestedPageSize)
        ? requestedPageSize
        : DEFAULT_PAGE_SIZE,
    ),
  );
  const offset = (page - 1) * pageSize;

  if (userId && !UUID_RE.test(userId)) {
    return NextResponse.json({ error: "Invalid user_id" }, { status: 400 });
  }
  if (listingId && !UUID_RE.test(listingId)) {
    return NextResponse.json(
      { error: "Invalid listing_id" },
      { status: 400 },
    );
  }
  if (!["all", "host", "buyer"].includes(role)) {
    return NextResponse.json(
      { error: "role must be all, host, or buyer" },
      { status: 400 },
    );
  }

  const platformListingIds = platform
    ? await getListingIdsForPlatform(supabase, platform)
    : null;
  if (platform && platformListingIds?.length === 0) {
    return emptyResponse(page, pageSize);
  }

  const searchFilters = q
    ? await resolveSearchFilters(supabase, q)
    : null;
  if (searchFilters?.forceEmpty) {
    return emptyResponse(page, pageSize);
  }

  let query = supabase
    .from("deals")
    .select(
      `id,listing_id,host_id,buyer_id,conversation_id,status,agreed_price,duration_months,started_at,ends_at,terminated_at,terminated_by,termination_reason,termination_source,created_at,
       listing:listings!deals_listing_id_fkey(id,title,platform,status,archived_at),
       host:profiles!deals_host_id_fkey(id,display_name,email,deleted_at,banned_until,permanently_banned,is_admin),
       buyer:profiles!deals_buyer_id_fkey(id,display_name,email,deleted_at,banned_until,permanently_banned,is_admin)`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }
  if (listingId) {
    query = query.eq("listing_id", listingId);
  } else if (platformListingIds) {
    query = query.in("listing_id", platformListingIds);
  }
  if (userId) {
    if (role === "host") {
      query = query.eq("host_id", userId);
    } else if (role === "buyer") {
      query = query.eq("buyer_id", userId);
    } else {
      query = query.or(`host_id.eq.${userId},buyer_id.eq.${userId}`);
    }
  }
  if (searchFilters) {
    query = query.or(searchFilters.orClause);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[admin deals list]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({
    deals: ((data ?? []) as unknown as DealListRow[]).map(normalizeDeal),
    total: count ?? 0,
    page,
    page_size: pageSize,
  });
}

async function resolveSearchFilters(
  supabase: SupabaseClient,
  q: string,
): Promise<{ orClause: string; forceEmpty?: false } | { forceEmpty: true }> {
  if (UUID_RE.test(q)) {
    return {
      orClause: [
        `id.eq.${q}`,
        `listing_id.eq.${q}`,
        `host_id.eq.${q}`,
        `buyer_id.eq.${q}`,
      ].join(","),
    };
  }

  const safe = q.replace(/[,%()*]/g, "").trim();
  if (!safe) return { forceEmpty: true };

  const [profiles, listings] = await Promise.all([
    supabase
      .from("profiles")
      .select("id")
      .or(`email.ilike.%${safe}%,display_name.ilike.%${safe}%`)
      .limit(50),
    supabase
      .from("listings")
      .select("id")
      .or(`title.ilike.%${safe}%,platform.ilike.%${safe}%`)
      .limit(100),
  ]);

  if (profiles.error) {
    console.warn("[admin deals list] profile search failed:", profiles.error);
  }
  if (listings.error) {
    console.warn("[admin deals list] listing search failed:", listings.error);
  }

  const profileIds = ((profiles.data ?? []) as Array<{ id: string | null }>)
    .map((p) => p.id)
    .filter((id): id is string => Boolean(id));
  const listingIds = ((listings.data ?? []) as Array<{ id: string | null }>)
    .map((l) => l.id)
    .filter((id): id is string => Boolean(id));

  const clauses: string[] = [];
  if (listingIds.length > 0) {
    clauses.push(`listing_id.in.(${listingIds.join(",")})`);
  }
  if (profileIds.length > 0) {
    clauses.push(`host_id.in.(${profileIds.join(",")})`);
    clauses.push(`buyer_id.in.(${profileIds.join(",")})`);
  }

  if (clauses.length === 0) return { forceEmpty: true };
  return { orClause: clauses.join(",") };
}

async function getListingIdsForPlatform(
  supabase: SupabaseClient,
  platform: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("id")
    .eq("platform", platform)
    .limit(500);
  if (error) {
    console.warn("[admin deals list] platform listing lookup failed:", error);
    return [ZERO_UUID];
  }
  return ((data ?? []) as Array<{ id: string | null }>)
    .map((row) => row.id)
    .filter((id): id is string => Boolean(id));
}

function normalizeDeal(row: DealListRow) {
  return {
    ...row,
    listing: Array.isArray(row.listing)
      ? (row.listing[0] ?? null)
      : row.listing,
    host: Array.isArray(row.host) ? (row.host[0] ?? null) : row.host,
    buyer: Array.isArray(row.buyer) ? (row.buyer[0] ?? null) : row.buyer,
  };
}

function emptyResponse(page: number, pageSize: number) {
  return NextResponse.json({
    deals: [],
    total: 0,
    page,
    page_size: pageSize,
  });
}
