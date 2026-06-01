// PATCH /admin/api/users/[id]/verification — admin trust verification override.
// Body: { action: "manual_verify" | "manual_unverify" | "clear_override" }

import { type NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logAdminAction } from "@/lib/admin-actions";
import { sendAdminPush } from "@/lib/admin-push";
import {
  adminErrorResponse,
  safeAdminErrorLog,
} from "@/lib/admin-safe-errors";
import { requireAdmin } from "@/lib/admin-auth";

type VerificationAction =
  | "manual_verify"
  | "manual_unverify"
  | "clear_override";

interface VerificationActionBody {
  action?: string;
}

type VerificationNotificationKind =
  | "verification_earned"
  | "verification_lost";

type VerificationNotificationSource = "admin" | "rating_rules";

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
          "action must be manual_verify, manual_unverify, or clear_override",
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

  if (body.action === "clear_override") {
    const { error: clearError } = await supabase
      .from("profiles")
      .update({
        verification_override: null,
        verified_manually_by: admin.id,
        verified_manually_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (clearError) {
      const correlationId = safeAdminErrorLog(
        "admin_user_verification_clear_failed",
        clearError,
        { operation: "user_verification_clear" },
      );
      return adminErrorResponse("Verification override could not be cleared.", 500, {
        correlationId,
      });
    }

    const { data: recomputed, error: recomputeError } = await supabase.rpc(
      "recompute_profile_verification",
      {
        p_apply_hysteresis: false,
        p_notify: false,
        p_profile_id: userId,
      },
    );

    if (recomputeError) {
      const correlationId = safeAdminErrorLog(
        "admin_user_verification_recompute_failed",
        recomputeError,
        { operation: "user_verification_recompute" },
      );
      return adminErrorResponse("Verification state could not be recomputed.", 500, {
        correlationId,
      });
    }

    const { data: updatedUser, error: refetchError } = await supabase
      .from("profiles")
      .select(USER_SELECT)
      .eq("id", userId)
      .maybeSingle();

    if (refetchError || !updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const notification = await notifyVerificationStateChange({
      supabase,
      userId,
      previousIsVerified: targetUser.is_verified,
      nextUser: updatedUser,
      source: "rating_rules",
    });

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
        recompute: recomputed?.[0] ?? null,
        notification,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  }

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

  const notification = await notifyVerificationStateChange({
    supabase,
    userId,
    previousIsVerified: targetUser.is_verified,
    nextUser: updatedUser,
    source: "admin",
  });

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
      notification,
    },
  });

  return NextResponse.json({ success: true, user: updatedUser });
}

function isVerificationAction(
  action: string | undefined,
): action is VerificationAction {
  return (
    action === "manual_verify" ||
    action === "manual_unverify" ||
    action === "clear_override"
  );
}

async function notifyVerificationStateChange(args: {
  supabase: SupabaseClient;
  userId: string;
  previousIsVerified: boolean | null;
  nextUser: {
    is_verified: boolean | null;
    rating_avg: number | null;
    rating_count: number | null;
  };
  source: VerificationNotificationSource;
}): Promise<{
  status: "sent" | "skipped" | "failed";
  reason?: string;
  kind?: VerificationNotificationKind;
  push?: "sent" | "skipped" | "failed";
}> {
  const previousVisibleState = args.previousIsVerified === true;
  const nextVisibleState = args.nextUser.is_verified === true;

  if (previousVisibleState === nextVisibleState) {
    return { status: "skipped", reason: "no_visible_state_change" };
  }

  const kind: VerificationNotificationKind = nextVisibleState
    ? "verification_earned"
    : "verification_lost";
  const copy = verificationNotificationCopy(kind, args.source);
  const payload = {
    source: args.source,
    rating_avg: args.nextUser.rating_avg ?? 0,
    rating_count: args.nextUser.rating_count ?? 0,
    previous_is_verified: previousVisibleState,
    is_verified: nextVisibleState,
  };

  let notificationStatus: "sent" | "failed" = "sent";
  const { error: notificationError } = await args.supabase
    .from("notifications")
    .insert({
      user_id: args.userId,
      kind,
      payload,
    });

  if (notificationError) {
    notificationStatus = "failed";
    safeAdminErrorLog(
      "admin_user_verification_notification_insert_failed",
      notificationError,
      { operation: "user_verification_notification_insert" },
    );
  }

  let pushStatus: "sent" | "skipped" | "failed" = "skipped";
  try {
    const pushResult = await sendAdminPush({
      supabase: args.supabase,
      recipientUserId: args.userId,
      title: copy.title,
      body: copy.body,
      data: {
        kind,
        type: kind,
        source: args.source,
      },
    });

    if (pushResult.sent) {
      pushStatus = "sent";
    } else {
      pushStatus = "skipped";
      safeAdminErrorLog(
        "admin_user_verification_push_skipped",
        pushResult.reason,
        { operation: "user_verification_push" },
      );
    }
  } catch (error) {
    pushStatus = "failed";
    safeAdminErrorLog("admin_user_verification_push_failed", error, {
      operation: "user_verification_push",
    });
  }

  return {
    status: notificationStatus,
    kind,
    push: pushStatus,
  };
}

function verificationNotificationCopy(
  kind: VerificationNotificationKind,
  source: VerificationNotificationSource,
): {
  title: string;
  body: string;
} {
  if (kind === "verification_earned") {
    if (source === "rating_rules") {
      return {
        title: "You earned the Verified badge",
        body: "Your rating history now meets Bantle verification rules.",
      };
    }
    return {
      title: "You’re now verified on Bantle",
      body: "Your profile has been verified by Bantle.",
    };
  }
  if (source === "rating_rules") {
    return {
      title: "Your Verified badge was removed",
      body: "Your rating history no longer meets Bantle verification rules.",
    };
  }
  return {
    title: "Verification removed",
    body: "Your Bantle verification status has been updated.",
  };
}
