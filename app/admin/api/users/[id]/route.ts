// GET /admin/api/users/[id] — full user profile + activity counts.

import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

const USER_DETAIL_SELECT = `
  id,
  display_name,
  email,
  created_at,
  last_seen_at,
  is_admin,
  is_verified,
  rating_avg,
  rating_count,
  identity_verification_status,
  identity_verified_at,
  identity_verification_rejected_at,
  identity_reverification_required_at,
  manual_verification_status,
  manual_verification_category,
  manual_verified_at,
  manual_verification_revoked_at,
  manual_verification_expires_at,
  verification_override,
  verified_manually_at,
  banned_until,
  banned_reason,
  banned_by,
  permanently_banned,
  deleted_at,
  age_attested,
  analytics_consent,
  bio,
  avatar_url
`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const { id } = await params;
  const userId = id;

  const { data: user, error: userError } = await supabase
    .from("profiles")
    .select(USER_DETAIL_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Counts — run in parallel for speed.
  const [
    listingsTotal,
    listingsActive,
    dealsHost,
    dealsBuyer,
    reportsFiled,
    reportsReceived,
  ] = await Promise.all([
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "active"),
    supabase
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("host_id", userId),
    supabase
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("buyer_id", userId),
    supabase
      .from("user_reports")
      .select("id", { count: "exact", head: true })
      .eq("reporter_id", userId),
    supabase
      .from("user_reports")
      .select("id", { count: "exact", head: true })
      .eq("reported_id", userId),
  ]);

  return NextResponse.json({
    user,
    counts: {
      listings_total: listingsTotal.count ?? 0,
      listings_active: listingsActive.count ?? 0,
      deals_as_host: dealsHost.count ?? 0,
      deals_as_buyer: dealsBuyer.count ?? 0,
      reports_filed: reportsFiled.count ?? 0,
      reports_received: reportsReceived.count ?? 0,
    },
  });
}
