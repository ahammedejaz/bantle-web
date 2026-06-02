// GET /admin/api/users/[id]/listings — paginated listings owned by user.

import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

const PAGE_SIZE = 20;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const { id } = await params;
  const userId = id;
  const page = Math.max(
    1,
    parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10),
  );
  const offset = (page - 1) * PAGE_SIZE;

  const { data, error, count } = await supabase
    .from("listings")
    .select(
      `id, title, platform, category, listing_type, monthly_price, slots_total, duration_months, status, created_at, archived_at,
       terms:listing_terms(terms_type,monthly_price,one_time_price,duration_months,access_duration_months,access_type,access_notes)`,
      { count: "exact" },
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({
    listings: ((data ?? []) as Array<{
      terms?: Array<{
        terms_type: string | null;
        monthly_price: number | null;
        one_time_price: number | null;
        duration_months: number | null;
        access_duration_months: number | null;
        access_type: string | null;
        access_notes: string | null;
      }> | null;
      listing_type?: string | null;
      monthly_price: number;
      duration_months: number;
    }>).map((listing) => {
      const terms = listing.terms?.[0] ?? null;
      return {
        ...listing,
        terms_type: terms?.terms_type ?? listing.listing_type ?? "monthly",
        monthly_price: terms?.monthly_price ?? listing.monthly_price,
        one_time_price: terms?.one_time_price ?? null,
        duration_months: terms?.duration_months ?? listing.duration_months,
        access_duration_months: terms?.access_duration_months ?? null,
        access_type: terms?.access_type ?? null,
        access_notes: terms?.access_notes ?? null,
        terms: null,
      };
    }),
    total: count ?? 0,
    page,
    page_size: PAGE_SIZE,
  });
}
