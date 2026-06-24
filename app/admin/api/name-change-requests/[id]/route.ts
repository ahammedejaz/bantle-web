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

  const { data: requestRow, error } = await supabase
    .from("name_change_requests")
    .select(
      `id,user_id,current_display_name,requested_display_name,status,profile_verification_id,
       requested_at,reviewed_at,approved_at,rejected_at,user_visible_rejection_message,
       admin_internal_note,created_at,updated_at,
       user:profiles!name_change_requests_user_id_fkey(id,display_name,identity_verification_status,is_verified,created_at),
       reviewer:profiles!name_change_requests_reviewed_by_fkey(id,display_name)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !requestRow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    request: requestRow,
  });
}
