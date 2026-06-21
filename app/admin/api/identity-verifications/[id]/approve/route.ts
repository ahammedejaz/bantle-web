import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-actions";
import {
  addDaysIso,
  getTrustRetentionSettings,
  parseOptionalAdminNote,
} from "@/lib/admin-trust-review";
import {
  adminErrorResponse,
  safeAdminErrorLog,
} from "@/lib/admin-safe-errors";

interface ApproveBody {
  admin_internal_note?: unknown;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { admin, supabase } = auth;

  const { id } = await params;

  let body: ApproveBody = {};
  try {
    body = (await request.json()) as ApproveBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { data: existing, error: existingError } = await supabase
    .from("profile_verifications")
    .select("id,user_id,status,storage_bucket")
    .eq("id", id)
    .maybeSingle();

  if (existingError || !existing) {
    return NextResponse.json({ error: "Verification not found" }, { status: 404 });
  }
  if (existing.storage_bucket !== "verification-selfies") {
    return NextResponse.json(
      { error: "Invalid verification storage bucket" },
      { status: 400 },
    );
  }
  if (existing.status !== "pending") {
    return NextResponse.json(
      { error: "Verification request is not pending" },
      { status: 409 },
    );
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const settings = await getTrustRetentionSettings(supabase);
  const imageRetentionUntil = addDaysIso(
    now,
    settings.approved_selfie_retention_days,
  );
  const adminInternalNote = parseOptionalAdminNote(body.admin_internal_note);

  const { data: updatedVerification, error: updateError } = await supabase
    .from("profile_verifications")
    .update({
      status: "approved",
      reviewed_by: admin.id,
      reviewed_at: nowIso,
      approved_at: nowIso,
      rejected_at: null,
      user_visible_rejection_message: null,
      admin_internal_note: adminInternalNote,
      image_retention_until: imageRetentionUntil,
    })
    .eq("id", id)
    .eq("status", "pending")
    .select("id,user_id,status,reviewed_at,approved_at")
    .maybeSingle();

  if (updateError) {
    const correlationId = safeAdminErrorLog(
      "admin_identity_verification_approve_update_failed",
      updateError,
      { operation: "identity_verification_approve_update" },
    );
    return adminErrorResponse("Verification could not be approved.", 500, {
      correlationId,
    });
  }
  if (!updatedVerification) {
    return NextResponse.json(
      { error: "Verification request is not pending" },
      { status: 409 },
    );
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      identity_verification_status: "approved",
      identity_verified_at: nowIso,
      identity_verification_rejected_at: null,
      identity_reverification_required_at: null,
      latest_profile_verification_id: id,
    })
    .eq("id", existing.user_id);

  if (profileError) {
    const correlationId = safeAdminErrorLog(
      "admin_identity_verification_approve_profile_failed",
      profileError,
      { operation: "identity_verification_approve_profile" },
    );
    return adminErrorResponse("Profile identity status could not be updated.", 500, {
      correlationId,
    });
  }

  const { error: badgeError } = await supabase.rpc(
    "refresh_profile_reviewed_badge",
    { p_user_id: existing.user_id },
  );

  if (badgeError) {
    const correlationId = safeAdminErrorLog(
      "admin_identity_verification_approve_badge_refresh_failed",
      badgeError,
      { operation: "identity_verification_approve_badge_refresh" },
    );
    return adminErrorResponse("Reviewed badge could not be refreshed.", 500, {
      correlationId,
    });
  }

  await logAdminAction(supabase, {
    admin_id: admin.id,
    action_type: "identity_verification_approved",
    target_user_id: existing.user_id,
    target_resource_id: id,
    target_resource_type: "identity_verification",
    payload: {
      previous_status: existing.status,
      next_status: "approved",
      retention_days: settings.approved_selfie_retention_days,
    },
  });

  return NextResponse.json({
    success: true,
    verification: updatedVerification,
  });
}
