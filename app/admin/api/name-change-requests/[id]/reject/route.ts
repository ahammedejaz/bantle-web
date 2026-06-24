import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getNameChangeAdminError } from "@/lib/name-change-errors";
import {
  parseOptionalAdminNote,
  parseRequiredRejectionMessage,
} from "@/lib/admin-trust-review";
import {
  adminErrorResponse,
  safeAdminErrorLog,
} from "@/lib/admin-safe-errors";
import { notifyTrustStatusUpdate } from "@/lib/trust-notifications";

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

  const adminInternalNote = parseOptionalAdminNote(body.admin_internal_note);

  const { data: updatedRequest, error: rpcError } = await supabase.rpc(
    "reject_name_change_request",
    {
      p_request_id: id,
      p_admin_id: admin.id,
      p_user_visible_rejection_message: rejectionMessage.value,
      p_admin_note: adminInternalNote,
    },
  );

  if (rpcError) {
    const mapped = getNameChangeAdminError(rpcError);
    if (mapped) {
      return NextResponse.json(
        { error: mapped.message },
        { status: mapped.status },
      );
    }
    const correlationId = safeAdminErrorLog(
      "admin_name_change_reject_rpc_failed",
      rpcError,
      { operation: "name_change_reject_rpc" },
    );
    return adminErrorResponse("Name-change request could not be rejected.", 500, {
      correlationId,
    });
  }

  const requestRow = Array.isArray(updatedRequest)
    ? updatedRequest[0]
    : updatedRequest;
  if (requestRow?.user_id) {
    await notifyTrustStatusUpdate({
      supabase,
      userId: requestRow.user_id,
      kind: "name_change_rejected",
      operation: "name_change_reject_notify",
      payload: {
        source: "name_change",
        route: "edit_profile",
        user_visible_message: rejectionMessage.value,
      },
    });
  }

  return NextResponse.json({
    success: true,
    request: requestRow,
  });
}
