// POST /admin/api/users/[id]/restore — clear ban or self-delete state.
// Body: { type: 'ban' | 'self_delete', reason?: string }
//
// 'ban' clears banned_until, banned_reason, banned_by, permanently_banned.
// 'self_delete' clears deleted_at.
//
// No push notification on restore — the user discovers next time they
// open the app, which is the right UX. Audit log captures it.

import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-actions";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { admin, supabase } = auth;

  const { id } = await params;
  const userId = id;

  let body: { type?: string; reason?: string };
  try {
    body = (await request.json()) as { type?: string; reason?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = body.type;
  const reason = (body.reason ?? "").trim() || null;

  if (type !== "ban" && type !== "self_delete") {
    return NextResponse.json(
      { error: "type must be 'ban' or 'self_delete'" },
      { status: 400 },
    );
  }

  if (type === "ban") {
    const { error } = await supabase
      .from("profiles")
      .update({
        banned_until: null,
        banned_reason: null,
        banned_by: null,
        permanently_banned: false,
      })
      .eq("id", userId);

    if (error) {
      return NextResponse.json(
        { error: `Restore failed: ${error.message}` },
        { status: 500 },
      );
    }

    await logAdminAction(supabase, {
      admin_id: admin.id,
      action_type: "user_restored",
      target_user_id: userId,
      target_resource_id: null,
      target_resource_type: "user",
      reason,
      payload: { type: "ban" },
    });

    return NextResponse.json({ success: true });
  }

  // type === "self_delete"
  const { error } = await supabase
    .from("profiles")
    .update({ deleted_at: null })
    .eq("id", userId);

  if (error) {
    return NextResponse.json(
      { error: `Restore failed: ${error.message}` },
      { status: 500 },
    );
  }

  await logAdminAction(supabase, {
    admin_id: admin.id,
    action_type: "user_restored",
    target_user_id: userId,
    target_resource_id: null,
    target_resource_type: "user",
    reason,
    payload: { type: "self_delete" },
  });

  return NextResponse.json({ success: true });
}
