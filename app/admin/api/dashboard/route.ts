// GET /admin/api/dashboard — read-only operational dashboard metrics.
//
// The aggregation lives in lib/admin-dashboard-metrics.ts so the dashboard's
// Server Component can render the same numbers on first paint; this route
// serves the client-side Refresh path.

import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDashboardMetrics } from "@/lib/admin-dashboard-metrics";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    return NextResponse.json(await getDashboardMetrics(auth.supabase));
  } catch (error) {
    console.error("[admin dashboard]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
