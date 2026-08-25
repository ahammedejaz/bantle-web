import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  parseOptionalAdminNote,
  parseRequiredRejectionMessage,
} from "@/lib/admin-trust-review";
import { adminRpcErrorResponse } from "@/lib/admin-rpc-errors";
import { dispatchNotificationOutbox } from "@/lib/notification-outbox";

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
  const { userClient, supabase } = auth;
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

  const { data, error } = await userClient.rpc(
    "admin_reject_identity_verification",
    {
      p_request_id: id,
      p_user_message: rejectionMessage.value,
      p_admin_note: parseOptionalAdminNote(body.admin_internal_note),
    },
  );
  if (error) {
    return adminRpcErrorResponse(
      "identity_verification_reject",
      error,
      "Verification could not be rejected.",
    );
  }

  const delivery = await dispatchNotificationOutbox(supabase);
  return NextResponse.json({ success: true, result: data, delivery });
}
