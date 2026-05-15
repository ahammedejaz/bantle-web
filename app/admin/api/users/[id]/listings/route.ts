// GET /admin/api/users/[id]/listings — paginated listings owned by user.

import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

const PAGE_SIZE = 20;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const userId = params.id;
  const page = Math.max(
    1,
    parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10),
  );
  const offset = (page - 1) * PAGE_SIZE;

  const { data, error, count } = await supabase
    .from("listings")
    .select(
      "id, title, platform, category, monthly_price, slots_total, duration_months, status, created_at, archived_at",
      { count: "exact" },
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({
    listings: data ?? [],
    total: count ?? 0,
    page,
    page_size: PAGE_SIZE,
  });
}
