import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-actions";
import {
  parseOptionalAdminNote,
  parseRequiredRejectionMessage,
} from "@/lib/admin-trust-review";
import {
  adminErrorResponse,
  safeAdminErrorLog,
} from "@/lib/admin-safe-errors";

interface RejectBody {
  user_visible_rejection_message?: unknown;
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

  let body: RejectBody;
  try {
    body = (await request.json()) as RejectBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rejectionMessage = parseRequiredRejectionMessage(
    body.user_visible_rejection_message,
  );
  if ("error" in rejectionMessage) {
    return NextResponse.json({ error: rejectionMessage.error }, { status: 400 });
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

  const nowIso = new Date().toISOString();
  const adminInternalNote = parseOptionalAdminNote(body.admin_internal_note);

  const { data: updatedRequest, error: updateError } = await supabase
    .from("name_change_requests")
    .update({
      status: "rejected",
      reviewed_by: admin.id,
      reviewed_at: nowIso,
      rejected_at: nowIso,
      approved_at: null,
      user_visible_rejection_message: rejectionMessage.value,
      admin_internal_note: adminInternalNote,
    })
    .eq("id", id)
    .eq("status", "pending")
    .select("id,user_id,status,reviewed_at,rejected_at")
    .maybeSingle();

  if (updateError) {
    const correlationId = safeAdminErrorLog(
      "admin_name_change_reject_update_failed",
      updateError,
      { operation: "name_change_reject_update" },
    );
    return adminErrorResponse("Name-change request could not be rejected.", 500, {
      correlationId,
    });
  }
  if (!updatedRequest) {
    return NextResponse.json(
      { error: "Name-change request is not pending" },
      { status: 409 },
    );
  }

  await logAdminAction(supabase, {
    admin_id: admin.id,
    action_type: "name_change_rejected",
    target_user_id: existing.user_id,
    target_resource_id: id,
    target_resource_type: "name_change_request",
    reason: rejectionMessage.value,
    payload: {
      previous_status: existing.status,
      next_status: "rejected",
    },
  });

  return NextResponse.json({
    success: true,
    request: updatedRequest,
  });
}
