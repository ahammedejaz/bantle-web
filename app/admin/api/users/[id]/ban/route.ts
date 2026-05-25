// POST /admin/api/users/[id]/ban — apply a ban (temp or permanent).
// Body: { type: 'temp' | 'permanent', reason: string }
//
// Reuses the exact pattern from Phase 2's ban_temp / ban_perm in
// reports/[id]/resolve. Differences:
//   - No report attached (target_resource_id is null)
//   - target_resource_type = 'user'
//   - Defense-in-depth: reject self-ban and banning another admin

import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-actions";
import { sendAdminPush } from "@/lib/admin-push";

const TEMP_BAN_DAYS = 7;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { admin, supabase } = auth;

  const { id } = await params;
  const userId = id;

  // Defense in depth: prevent admin from banning themselves.
  if (userId === admin.id) {
    return NextResponse.json(
      { error: "Cannot ban yourself" },
      { status: 400 },
    );
  }

  let body: { type?: string; reason?: string };
  try {
    body = (await request.json()) as { type?: string; reason?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = body.type;
  const reason = (body.reason ?? "").trim();

  if (type !== "temp" && type !== "permanent") {
    return NextResponse.json(
      { error: "type must be 'temp' or 'permanent'" },
      { status: 400 },
    );
  }
  if (!reason) {
    return NextResponse.json({ error: "Reason required" }, { status: 400 });
  }

  // Verify target user exists and isn't another admin.
  const { data: targetUser, error: fetchError } = await supabase
    .from("profiles")
    .select("id, is_admin")
    .eq("id", userId)
    .maybeSingle();

  if (fetchError || !targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (targetUser.is_admin) {
    return NextResponse.json(
      { error: "Cannot ban an admin" },
      { status: 400 },
    );
  }

  if (type === "temp") {
    const bannedUntil = new Date();
    bannedUntil.setDate(bannedUntil.getDate() + TEMP_BAN_DAYS);

    const { error: banError } = await supabase
      .from("profiles")
      .update({
        banned_until: bannedUntil.toISOString(),
        banned_reason: reason,
        banned_by: admin.id,
      })
      .eq("id", userId);

    if (banError) {
      return NextResponse.json(
        { error: `Ban failed: ${banError.message}` },
        { status: 500 },
      );
    }

    await sendAdminPush({
      supabase,
      recipientUserId: userId,
      title: "Account suspended",
      body: `Your Bantle account has been suspended for ${TEMP_BAN_DAYS} days due to a community guidelines violation.`,
      data: {
        type: "ban_temp",
        banned_until: bannedUntil.toISOString(),
      },
    });

    const { error: notifError } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        kind: "moderation_ban_temp",
        payload: { reason, banned_until: bannedUntil.toISOString() },
      });
    if (notifError) {
      console.error(
        "[admin user ban_temp] notifications insert failed:",
        notifError.code,
        notifError.message,
        notifError.details,
      );
    }

    await logAdminAction(supabase, {
      admin_id: admin.id,
      action_type: "user_banned",
      target_user_id: userId,
      target_resource_id: null,
      target_resource_type: "user",
      reason,
      payload: {
        type: "temp",
        banned_until: bannedUntil.toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      banned_until: bannedUntil.toISOString(),
    });
  }

  // type === "permanent"
  const { error: banError } = await supabase
    .from("profiles")
    .update({
      permanently_banned: true,
      banned_reason: reason,
      banned_by: admin.id,
    })
    .eq("id", userId);

  if (banError) {
    return NextResponse.json(
      { error: `Permaban failed: ${banError.message}` },
      { status: 500 },
    );
  }

  await sendAdminPush({
    supabase,
    recipientUserId: userId,
    title: "Account permanently removed",
    body: "Your Bantle account has been permanently removed due to a community guidelines violation.",
    data: { type: "ban_perm" },
  });

  const { error: notifError } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      kind: "moderation_ban_perm",
      payload: { reason },
    });
  if (notifError) {
    console.error(
      "[admin user ban_perm] notifications insert failed:",
      notifError.code,
      notifError.message,
      notifError.details,
    );
  }

  await logAdminAction(supabase, {
    admin_id: admin.id,
    action_type: "user_soft_deleted",
    target_user_id: userId,
    target_resource_id: null,
    target_resource_type: "user",
    reason,
    payload: { type: "permanent" },
  });

  return NextResponse.json({ success: true });
}
