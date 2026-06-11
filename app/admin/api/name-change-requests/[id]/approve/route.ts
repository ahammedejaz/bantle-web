import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-actions";
import { parseOptionalAdminNote } from "@/lib/admin-trust-review";
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
    .from("name_change_requests")
    .select("id,user_id,current_display_name,requested_display_name,status")
    .eq("id", id)
    .maybeSingle();

  if (existingError || !existing) {
    return NextResponse.json(
      { error: "Name-change request not found" },
      { status: 404 },
    );
  }
  if (existing.status !== "pending") {
    return NextResponse.json(
      { error: "Name-change request is not pending" },
      { status: 409 },
    );
  }

  const requestedDisplayName = existing.requested_display_name.trim();
  if (!requestedDisplayName) {
    return NextResponse.json(
      { error: "Requested display name is invalid" },
      { status: 400 },
    );
  }

  const nowIso = new Date().toISOString();
  const adminInternalNote = parseOptionalAdminNote(body.admin_internal_note);

  const { data: updatedRequest, error: updateError } = await supabase
    .from("name_change_requests")
    .update({
      status: "approved",
      reviewed_by: admin.id,
      reviewed_at: nowIso,
      approved_at: nowIso,
      rejected_at: null,
      admin_internal_note: adminInternalNote,
    })
    .eq("id", id)
    .eq("status", "pending")
    .select("id,user_id,status,reviewed_at,approved_at")
    .maybeSingle();

  if (updateError) {
    const correlationId = safeAdminErrorLog(
      "admin_name_change_approve_update_failed",
      updateError,
      { operation: "name_change_approve_update" },
    );
    return adminErrorResponse("Name-change request could not be approved.", 500, {
      correlationId,
    });
  }
  if (!updatedRequest) {
    return NextResponse.json(
      { error: "Name-change request is not pending" },
      { status: 409 },
    );
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ display_name: requestedDisplayName })
    .eq("id", existing.user_id);

  if (profileError) {
    const correlationId = safeAdminErrorLog(
      "admin_name_change_approve_profile_failed",
      profileError,
      { operation: "name_change_approve_profile" },
    );
    return adminErrorResponse("Display name could not be updated.", 500, {
      correlationId,
    });
  }

  await logAdminAction(supabase, {
    admin_id: admin.id,
    action_type: "name_change_approved",
    target_user_id: existing.user_id,
    target_resource_id: id,
    target_resource_type: "name_change_request",
    payload: {
      previous_status: existing.status,
      next_status: "approved",
    },
  });

  return NextResponse.json({
    success: true,
    request: updatedRequest,
  });
}
