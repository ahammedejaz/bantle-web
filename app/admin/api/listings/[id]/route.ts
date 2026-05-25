// GET /admin/api/listings/[id] — listing detail for admin review.

import { type NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";

type HostSummary = {
  id: string;
  display_name: string | null;
  email: string | null;
  deleted_at: string | null;
  banned_until: string | null;
  banned_reason: string | null;
  permanently_banned: boolean | null;
  rating_avg: number | null;
  rating_count: number | null;
  is_admin: boolean | null;
};

type ListingDetail = {
  id: string;
  user_id: string;
  title: string;
  platform: string;
  category: string;
  description: string | null;
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const { id } = await params;
  const listingId = id;

  const { data, error } = await supabase
    .from("listings")
    .select(
      `id,user_id,title,platform,category,description,monthly_price,slots_total,duration_months,status,archived_at,created_at,updated_at,closed_reason,closed_by,closed_at,
       host:profiles!listings_user_id_fkey(id,display_name,email,deleted_at,banned_until,banned_reason,permanently_banned,rating_avg,rating_count,is_admin)`,
    )
    .eq("id", listingId)
    .maybeSingle();

  if (error) {
    console.error("[admin listing detail]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const listing = normalizeListing(data as unknown as ListingDetail);

  const [
    slotsAvailable,
    activePendingDeals,
    recentDeals,
    auditEntries,
    hostReportCounts,
  ] = await Promise.all([
    getSlotsAvailable(supabase, listingId),
    getDeals(supabase, listingId, true),
    getDeals(supabase, listingId, false),
    getAuditEntries(supabase, listingId),
    listing.user_id ? getHostReportCounts(supabase, listing.user_id) : null,
  ]);

  return NextResponse.json({
    listing: {
      ...listing,
      slots_available: slotsAvailable,
    },
    host: listing.host,
    active_pending_deals: activePendingDeals,
    recent_deals: recentDeals,
    audit_entries: auditEntries,
    host_report_counts: hostReportCounts,
  });
}

async function getSlotsAvailable(
  supabase: SupabaseClient,
  listingId: string,
): Promise<number | null> {
  const { data, error } = await supabase.rpc("listing_slots_available", {
    p_listing_id: listingId,
  });
  if (error || typeof data !== "number") return null;
  return data;
}

async function getDeals(
  supabase: SupabaseClient,
  listingId: string,
  activePendingOnly: boolean,
) {
  let query = supabase
    .from("deals")
    .select(
      `id,status,agreed_price,duration_months,started_at,ends_at,terminated_at,created_at,host_id,buyer_id,
       host:profiles!deals_host_id_fkey(id,display_name,email,deleted_at),
       buyer:profiles!deals_buyer_id_fkey(id,display_name,email,deleted_at)`,
    )
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false })
    .limit(activePendingOnly ? 100 : 20);

  if (activePendingOnly) {
    query = query.in("status", ["pending", "active"]);
  }

  const { data, error } = await query;
  if (error) {
    console.warn("[admin listing detail] deals failed:", error.message);
    return [];
  }
  return data ?? [];
}

async function getAuditEntries(supabase: SupabaseClient, listingId: string) {
  const { data, error } = await supabase
    .from("admin_actions")
    .select(
      "id,admin_id,action_type,target_user_id,target_resource_id,target_resource_type,reason,payload,created_at",
    )
    .eq("target_resource_id", listingId)
    .eq("target_resource_type", "listing")
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) {
    console.warn("[admin listing detail] audit failed:", error.message);
    return [];
  }
  return data ?? [];
}

async function getHostReportCounts(supabase: SupabaseClient, hostId: string) {
  const [pending, total] = await Promise.all([
    supabase
      .from("user_reports")
      .select("id", { count: "exact", head: true })
      .eq("reported_id", hostId)
      .eq("status", "pending"),
    supabase
      .from("user_reports")
      .select("id", { count: "exact", head: true })
      .eq("reported_id", hostId),
  ]);

  return {
    pending: pending.count ?? 0,
    total: total.count ?? 0,
  };
}

function normalizeListing(row: ListingDetail): ListingDetail {
  return {
    ...row,
    host: Array.isArray(row.host) ? (row.host[0] ?? null) : row.host,
  };
}
