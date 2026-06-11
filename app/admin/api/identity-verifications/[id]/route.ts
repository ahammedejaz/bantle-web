import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  createVerificationSelfieSignedUrl,
  SIGNED_URL_TTL_SECONDS,
} from "@/lib/admin-trust-review";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const { id } = await params;

  const { data: verification, error } = await supabase
    .from("profile_verifications")
    .select(
      `id,user_id,status,storage_bucket,storage_path,instruction_code,instruction_code_expires_at,
       submitted_at,reviewed_at,approved_at,rejected_at,user_visible_rejection_message,
       admin_internal_note,image_retention_until,image_deleted_at,created_at,updated_at,
       user:profiles!profile_verifications_user_id_fkey(id,display_name,rating_avg,rating_count,identity_verification_status,is_verified,created_at),
       reviewer:profiles!profile_verifications_reviewed_by_fkey(id,display_name)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !verification) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const signedUrl = await createVerificationSelfieSignedUrl(supabase, {
    storage_bucket: verification.storage_bucket,
    storage_path: verification.storage_path,
    image_deleted_at: verification.image_deleted_at,
  });

  return NextResponse.json({
    verification: {
      id: verification.id,
      user_id: verification.user_id,
      status: verification.status,
      instruction_code: verification.instruction_code,
      instruction_code_expires_at:
        verification.instruction_code_expires_at,
      submitted_at: verification.submitted_at,
      reviewed_at: verification.reviewed_at,
      approved_at: verification.approved_at,
      rejected_at: verification.rejected_at,
      user_visible_rejection_message:
        verification.user_visible_rejection_message,
      admin_internal_note: verification.admin_internal_note,
      image_retention_until: verification.image_retention_until,
      image_deleted_at: verification.image_deleted_at,
      created_at: verification.created_at,
      updated_at: verification.updated_at,
      user: verification.user,
      reviewer: verification.reviewer,
      signed_url: signedUrl.signed_url,
      signed_url_expires_in_seconds:
        signedUrl.signed_url_expires_in_seconds,
      image_unavailable_reason: signedUrl.image_unavailable_reason,
      signed_url_ttl_seconds: SIGNED_URL_TTL_SECONDS,
    },
  });
}
