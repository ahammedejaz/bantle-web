import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  parsePage,
  parseReviewStatusFilter,
} from "@/lib/admin-trust-review";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const params = request.nextUrl.searchParams;
  const status = parseReviewStatusFilter(params.get("status"));
  if (!status) {
    return NextResponse.json(
      { error: "Invalid status filter" },
      { status: 400 },
    );
  }

  const page = parsePage(params.get("page"));
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from("name_change_requests")
    .select(
      `id,user_id,current_display_name,requested_display_name,status,profile_verification_id,
       requested_at,reviewed_at,approved_at,rejected_at,created_at,updated_at,
       user:profiles!name_change_requests_user_id_fkey(id,display_name,identity_verification_status,is_verified)`,
      { count: "exact" },
    )
    .range(offset, offset + PAGE_SIZE - 1);

  if (status !== "all") {
    query = query.eq("status", status).order("requested_at", { ascending: false });
  } else {
    query = query
      .order("reviewed_at", { ascending: true, nullsFirst: true })
      .order("requested_at", { ascending: false });
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("[admin name changes list]", error.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({
    requests: data ?? [],
    total: count ?? 0,
    page,
    page_size: PAGE_SIZE,
  });
}
