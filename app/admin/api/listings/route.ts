// GET /admin/api/listings — search and filter listings for admin review.

import { type NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ListingRow = {
  id: string;
  user_id: string;
  title: string;
  platform: string;
  category: string;
  monthly_price: number;
  slots_total: number;
  duration_months: number;
  status: string | null;
  archived_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  closed_reason: string | null;
  closed_by: string | null;
  closed_at: string | null;
  host: HostSummary | null;
};

type HostSummary = {
  id: string;
  display_name: string | null;
  email: string | null;
  deleted_at: string | null;
  banned_until: string | null;
  permanently_banned: boolean | null;
  is_admin?: boolean | null;
};

type DealCount = {
  pending_deal_count: number;
  active_deal_count: number;
};

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const params = request.nextUrl.searchParams;
  const q = (params.get("q") ?? "").trim();
  const userId = (params.get("user_id") ?? "").trim();
  const platform = (params.get("platform") ?? "").trim();
  const status = (params.get("status") ?? "all").trim();
  const archived = (params.get("archived") ?? "all").trim();
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10));
  const requestedPageSize = parseInt(
    params.get("page_size") ?? String(DEFAULT_PAGE_SIZE),
    10,
  );
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number.isFinite(requestedPageSize) ? requestedPageSize : DEFAULT_PAGE_SIZE),
  );
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("listings")
    .select(
      `id,user_id,title,platform,category,monthly_price,slots_total,duration_months,status,archived_at,created_at,updated_at,closed_reason,closed_by,closed_at,
       host:profiles!listings_user_id_fkey(id,display_name,email,deleted_at,banned_until,permanently_banned,is_admin)`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (userId) {
    if (!UUID_RE.test(userId)) {
      return NextResponse.json({ error: "Invalid user_id" }, { status: 400 });
    }
    query = query.eq("user_id", userId);
  }

  if (platform) {
    query = query.eq("platform", platform);
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (archived === "yes") {
    query = query.not("archived_at", "is", null);
  } else if (archived === "no") {
    query = query.is("archived_at", null);
  } else if (archived !== "all") {
    return NextResponse.json(
      { error: "archived must be all, yes, or no" },
      { status: 400 },
    );
  }

  if (q) {
    if (UUID_RE.test(q)) {
      query = query.or(`id.eq.${q},user_id.eq.${q}`);
    } else {
      const safe = q.replace(/[,%()*]/g, "").trim();
      if (safe) {
        const { data: hosts, error: hostSearchError } = await supabase
          .from("profiles")
          .select("id")
          .or(`email.ilike.%${safe}%,display_name.ilike.%${safe}%`)
          .limit(50);

        if (hostSearchError) {
          console.warn(
            "[admin listings list] host search failed:",
            hostSearchError.message,
          );
        }

        const hostIds = ((hosts ?? []) as Array<{ id: string | null }>)
          .map((h) => h.id)
          .filter((id): id is string => Boolean(id));
        const clauses = [`title.ilike.%${safe}%`, `platform.ilike.%${safe}%`];
        if (hostIds.length > 0) {
          clauses.push(`user_id.in.(${hostIds.join(",")})`);
        }
        query = query.or(clauses.join(","));
      }
    }
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[admin listings list]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const listings = ((data ?? []) as unknown as ListingRow[]).map(normalizeListing);
  const ids = listings.map((l) => l.id);
  const [slotMap, dealCountMap] = await Promise.all([
    getSlotsAvailableMap(supabase, ids),
    getDealCountMap(supabase, ids),
  ]);

  return NextResponse.json({
    listings: listings.map((listing) => ({
      ...listing,
      slots_available: slotMap.get(listing.id) ?? null,
      pending_deal_count:
        dealCountMap.get(listing.id)?.pending_deal_count ?? 0,
      active_deal_count: dealCountMap.get(listing.id)?.active_deal_count ?? 0,
    })),
    total: count ?? 0,
    page,
    page_size: pageSize,
  });
}

async function getSlotsAvailableMap(
  supabase: SupabaseClient,
  ids: string[],
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  await Promise.all(
    ids.map(async (id) => {
      const { data, error } = await supabase.rpc("listing_slots_available", {
        p_listing_id: id,
      });
      if (!error && typeof data === "number") {
        out.set(id, data);
      }
    }),
  );
  return out;
}

async function getDealCountMap(
  supabase: SupabaseClient,
  ids: string[],
): Promise<Map<string, DealCount>> {
  const out = new Map<string, DealCount>();
  for (const id of ids) {
    out.set(id, { pending_deal_count: 0, active_deal_count: 0 });
  }
  if (ids.length === 0) return out;

  const { data, error } = await supabase
    .from("deals")
    .select("listing_id,status")
    .in("listing_id", ids)
    .in("status", ["pending", "active"]);

  if (error) {
    console.warn("[admin listings list] deal counts failed:", error.message);
    return out;
  }

  for (const row of (data ?? []) as Array<{
    listing_id: string | null;
    status: string | null;
  }>) {
    if (!row.listing_id) continue;
    const counts = out.get(row.listing_id) ?? {
      pending_deal_count: 0,
      active_deal_count: 0,
    };
    if (row.status === "pending") counts.pending_deal_count += 1;
    if (row.status === "active") counts.active_deal_count += 1;
    out.set(row.listing_id, counts);
  }
  return out;
}

function normalizeListing(row: ListingRow): ListingRow {
  return {
    ...row,
    host: Array.isArray(row.host) ? (row.host[0] ?? null) : row.host,
  };
}
