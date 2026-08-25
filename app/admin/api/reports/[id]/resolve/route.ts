import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { adminRpcErrorResponse } from "@/lib/admin-rpc-errors";
import { dispatchNotificationOutbox } from "@/lib/notification-outbox";

const VALID_ACTIONS = new Set([
  "resolve",
  "dismiss",
  "warn",
  "ban_temp",
  "ban_perm",
]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { userClient, supabase } = auth;
  const { id } = await params;

  let body: { action?: unknown; reason?: unknown };
  try {
    body = (await request.json()) as { action?: unknown; reason?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = typeof body.action === "string" ? body.action : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (!VALID_ACTIONS.has(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  if (["warn", "ban_temp", "ban_perm"].includes(action) && !reason) {
    return NextResponse.json(
      { error: "Reason is required for this action" },
      { status: 400 },
    );
  }
  if (reason.length > 1000) {
    return NextResponse.json({ error: "Reason is too long" }, { status: 400 });
  }

  const { data, error } = await userClient.rpc("admin_resolve_report", {
    p_report_id: id,
    p_action: action,
    p_reason: reason || null,
  });
  if (error) {
    return adminRpcErrorResponse(
      "report_resolution",
      error,
      "Report action could not be completed.",
    );
  }

  const delivery = await dispatchNotificationOutbox(supabase);
  return NextResponse.json({ success: true, result: data, delivery });
}
