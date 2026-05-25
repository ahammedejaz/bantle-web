// GET /admin/api/users/[id]/audit — admin_actions targeting this user.
// Returns chronological list (latest first) of every admin action
// where target_user_id matches.

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

  const { data, error } = await supabase
    .from("admin_actions")
    .select(
      `id, action_type, target_resource_id, target_resource_type, reason, payload, created_at,
       admin:profiles!admin_actions_admin_id_fkey(display_name)`,
    )
    .eq("target_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(LIMIT);

  if (error) {
    console.error("[admin user audit]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({ actions: data ?? [] });
}
