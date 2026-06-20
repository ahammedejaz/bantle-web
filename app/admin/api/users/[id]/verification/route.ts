// PATCH /admin/api/users/[id]/verification - temporary admin/manual badge control.
// Body: { action: "manual_verify" | "manual_unverify" }

import { type NextRequest, NextResponse } from "next/server";
import { logAdminAction } from "@/lib/admin-actions";
import {
  adminErrorResponse,
  safeAdminErrorLog,
} from "@/lib/admin-safe-errors";
import { requireAdmin } from "@/lib/admin-auth";

type VerificationAction = "manual_verify" | "manual_unverify";

interface VerificationActionBody {
  action?: string;
}

const USER_SELECT =
  "id, is_admin, is_verified, rating_avg, rating_count, verification_override, verified_manually_by, verified_manually_at";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { admin, supabase } = auth;

  const { id } = await params;
  const userId = id;

  let body: VerificationActionBody;
  try {
    body = (await request.json()) as VerificationActionBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isVerificationAction(body.action)) {
    return NextResponse.json(
      {
        error:
          "action must be manual_verify or manual_unverify",
      },
      { status: 400 },
    );
  }

  const { data: targetUser, error: targetError } = await supabase
    .from("profiles")
    .select(USER_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (targetError || !targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (targetUser.is_admin) {
    return NextResponse.json(
      { error: "Cannot change verification for an admin account" },
      { status: 400 },
    );
  }

  const previous = {
    is_verified: targetUser.is_verified,
    verification_override: targetUser.verification_override,
    rating_avg: targetUser.rating_avg,
    rating_count: targetUser.rating_count,
  };

  const manualVerified = body.action === "manual_verify";
  const { data: updatedUser, error: updateError } = await supabase
    .from("profiles")
    .update({
      is_verified: manualVerified,
      verification_override: manualVerified ? "verified" : "unverified",
      verified_manually_by: admin.id,
      verified_manually_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select(USER_SELECT)
    .maybeSingle();

  if (updateError || !updatedUser) {
    const correlationId = safeAdminErrorLog(
      "admin_user_verification_update_failed",
      updateError,
      { operation: "user_verification_update" },
    );
    return adminErrorResponse("Verification state could not be updated.", 500, {
      correlationId,
    });
  }

  await logAdminAction(supabase, {
    admin_id: admin.id,
    action_type: "user_verification_updated",
    target_user_id: userId,
    target_resource_id: null,
    target_resource_type: "user",
    payload: {
      action: body.action,
      previous,
      next: {
        is_verified: updatedUser.is_verified,
        verification_override: updatedUser.verification_override,
        rating_avg: updatedUser.rating_avg,
        rating_count: updatedUser.rating_count,
      },
      notification: { status: "disabled", reason: "legacy_badge_events_retired" },
    },
  });

  return NextResponse.json({ success: true, user: updatedUser });
}

function isVerificationAction(
  action: string | undefined,
): action is VerificationAction {
  return (
    action === "manual_verify" ||
    action === "manual_unverify"
  );
}
