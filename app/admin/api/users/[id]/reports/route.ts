// GET /admin/api/users/[id]/reports — both reports filed by user and
// reports filed against the user. Returns two arrays.
//
// Privacy boundary: in the admin user-detail context, reporter
// display_name CAN be shown to the admin (different threat model
// than user-facing data export, where reporter identity must be
// concealed from the reported user).

import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

const LIMIT = 50;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const { id } = await params;
  const userId = id;

  const [filed, received] = await Promise.all([
    supabase
      .from("user_reports")
      .select(
        `id, category, details, status, resolution_action, created_at, resolved_at,
         reported:profiles!user_reports_reported_id_fkey(display_name)`,
      )
      .eq("reporter_id", userId)
      .order("created_at", { ascending: false })
      .limit(LIMIT),
    supabase
      .from("user_reports")
      .select(
        `id, category, details, status, resolution_action, created_at, resolved_at,
         reporter:profiles!user_reports_reporter_id_fkey(display_name)`,
      )
      .eq("reported_id", userId)
      .order("created_at", { ascending: false })
      .limit(LIMIT),
  ]);

  if (filed.error || received.error) {
    console.error(
      "[admin user reports]",
      filed.error ?? received.error,
    );
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({
    reports_filed: filed.data ?? [],
    reports_received: received.data ?? [],
  });
}
