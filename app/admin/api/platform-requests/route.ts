import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { parsePage, parseReviewStatusFilter } from "@/lib/admin-trust-review";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const params = request.nextUrl.searchParams;
  const status = parseReviewStatusFilter(params.get("status"));
  if (!status) {
    return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
  }

  const page = parsePage(params.get("page"));
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from("platform_requests")
    .select(
      `id,user_id,requested_name,normalized_name,suggested_category,user_note,status,
       approved_platform_id,requested_at,reviewed_at,approved_at,rejected_at,
       user:profiles!platform_requests_user_id_fkey(id,display_name,is_verified)`,
      { count: "exact" },
    )
    .range(offset, offset + PAGE_SIZE - 1);

  if (status !== "all") {
    query = query.eq("status", status).order("requested_at", { ascending: false });
  } else {
    // Undecided first, then newest — the same ordering the identity queue uses.
    query = query
      .in("status", ["pending", "approved", "rejected"])
      .order("reviewed_at", { ascending: true, nullsFirst: true })
      .order("requested_at", { ascending: false });
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("[admin platform requests list]", error.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({
    requests: data ?? [],
    total: count ?? 0,
    page,
    page_size: PAGE_SIZE,
  });
}
