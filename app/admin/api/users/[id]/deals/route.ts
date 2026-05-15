// GET /admin/api/users/[id]/deals — deals where user is host OR buyer.
// Includes counterparty display_name via FK join. Counterparty UUID
// intentionally excluded from response (privacy boundary established
// in Phase 4.3 mobile / Phase 2 admin).

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
    .from("deals")
    .select(
      `id, status, agreed_price, duration_months, started_at, ends_at, terminated_at, created_at, host_id, buyer_id,
       host:profiles!deals_host_id_fkey(display_name),
       buyer:profiles!deals_buyer_id_fkey(display_name)`,
      { count: "exact" },
    )
    .or(`host_id.eq.${userId},buyer_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({
    deals: data ?? [],
    total: count ?? 0,
    page,
    page_size: PAGE_SIZE,
    user_id: userId,
  });
}
