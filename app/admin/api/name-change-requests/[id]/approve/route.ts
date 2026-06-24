import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getNameChangeAdminError } from "@/lib/name-change-errors";
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

  const adminInternalNote = parseOptionalAdminNote(body.admin_internal_note);

  const { data: updatedRequest, error: rpcError } = await supabase.rpc(
    "approve_name_change_request",
    {
      p_request_id: id,
      p_admin_id: admin.id,
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
      "admin_name_change_approve_rpc_failed",
      rpcError,
      { operation: "name_change_approve_rpc" },
    );
    return adminErrorResponse("Name-change request could not be approved.", 500, {
      correlationId,
    });
  }

  return NextResponse.json({
    success: true,
    request: Array.isArray(updatedRequest) ? updatedRequest[0] : updatedRequest,
  });
}
