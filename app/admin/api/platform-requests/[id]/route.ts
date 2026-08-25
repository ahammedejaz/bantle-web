import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;
  const { id } = await params;

  const { data, error } = await supabase
    .from("platform_requests")
    .select(
      `id,user_id,requested_name,normalized_name,suggested_category,user_note,status,
       approved_platform_id,requested_at,reviewed_at,approved_at,rejected_at,
       user_visible_rejection_message,admin_internal_note,created_at,updated_at,
       user:profiles!platform_requests_user_id_fkey(id,display_name,is_verified,created_at),
       reviewer:profiles!platform_requests_reviewed_by_fkey(id,display_name)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[admin platform request detail]", error.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Platform request not found." }, {
      status: 404,
    });
  }

  // Everyone else waiting on the same platform. Approving this row resolves
  // them too, so the reviewer needs to see the count before deciding.
  const { count: siblingCount } = await supabase
    .from("platform_requests")
    .select("id", { count: "exact", head: true })
    .eq("normalized_name", data.normalized_name)
    .eq("status", "pending")
    .neq("id", id);

  const { data: categories } = await supabase
    .from("platform_categories")
    .select("id,label,is_active")
    .order("display_order", { ascending: true })
    .order("label", { ascending: true });

  return NextResponse.json({
    request: data,
    sibling_pending_count: siblingCount ?? 0,
    categories: categories ?? [],
  });
}
