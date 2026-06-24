// GET /admin/api/users — search users.
// Query params:
//   q: search term (matches email substring, display_name substring,
//      or exact UUID). Optional. If empty, returns most recent users.
//   page: 1-based page number. Default 1.
// Page size: 20.

import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

const PAGE_SIZE = 20;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const params = request.nextUrl.searchParams;
  const q = (params.get("q") ?? "").trim();
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from("profiles")
    .select(
      "id, display_name, email, created_at, is_admin, banned_until, permanently_banned, deleted_at, rating_avg, rating_count, is_verified, identity_verification_status, manual_verification_status, manual_verification_category",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (q) {
    if (UUID_RE.test(q)) {
      query = query.eq("id", q);
    } else {
      // Escape % and _ so they're treated as literal characters.
      const safe = q.replace(/[%_]/g, "\\$&");
      query = query.or(
        `email.ilike.%${safe}%,display_name.ilike.%${safe}%`,
      );
    }
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[admin users list]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({
    users: data ?? [],
    total: count ?? 0,
    page,
    page_size: PAGE_SIZE,
  });
}
