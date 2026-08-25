import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { parseOptionalAdminNote } from "@/lib/admin-trust-review";
import { adminRpcErrorResponse } from "@/lib/admin-rpc-errors";
import { dispatchNotificationOutbox } from "@/lib/notification-outbox";

interface ApproveBody {
  admin_internal_note?: unknown;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { userClient, supabase } = auth;
  const { id } = await params;

  let body: ApproveBody = {};
  try {
    body = (await request.json()) as ApproveBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const adminNote = parseOptionalAdminNote(body.admin_internal_note);
  const { data, error } = await userClient.rpc(
    "admin_approve_identity_verification",
    { p_request_id: id, p_admin_note: adminNote },
  );
  if (error) {
    return adminRpcErrorResponse(
      "identity_verification_approve",
      error,
      "Verification could not be approved.",
    );
  }

  const delivery = await dispatchNotificationOutbox(supabase);
  return NextResponse.json({ success: true, result: data, delivery });
}
