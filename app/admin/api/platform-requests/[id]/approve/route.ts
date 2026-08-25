import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { parseOptionalAdminNote } from "@/lib/admin-trust-review";
import { adminRpcErrorResponse } from "@/lib/admin-rpc-errors";
import { dispatchNotificationOutbox } from "@/lib/notification-outbox";
import { logAdminAction } from "@/lib/admin-actions";

interface ApproveBody {
  platform_id?: unknown;
  label?: unknown;
  category?: unknown;
  default_monthly_price?: unknown;
  brand_color?: unknown;
  brand_initials?: unknown;
  display_order?: unknown;
  admin_internal_note?: unknown;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asInteger(value: unknown): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;
  return Number.isInteger(parsed) ? parsed : null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { admin, userClient, supabase } = auth;
  const { id } = await params;

  let body: ApproveBody;
  try {
    body = (await request.json()) as ApproveBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const platformId = asString(body.platform_id).toLowerCase();
  const label = asString(body.label);
  const category = asString(body.category);
  const price = asInteger(body.default_monthly_price);
  const brandColor = asString(body.brand_color).toUpperCase();
  const brandInitials = asString(body.brand_initials).toUpperCase();
  const displayOrder = asInteger(body.display_order) ?? 0;

  // Shape check only — the RPC is the authority on every rule below and
  // re-validates server-side inside the approving transaction.
  if (!platformId || !label || !category || price === null || !brandColor || !brandInitials) {
    return NextResponse.json(
      { error: "All platform fields are required." },
      { status: 400 },
    );
  }

  const { data, error } = await userClient.rpc("admin_approve_platform_request", {
    p_request_id: id,
    p_platform_id: platformId,
    p_label: label,
    p_category: category,
    p_default_monthly_price: price,
    p_brand_color: brandColor,
    p_brand_initials: brandInitials,
    p_display_order: displayOrder,
    p_admin_note: parseOptionalAdminNote(body.admin_internal_note),
  });
  if (error) {
    return adminRpcErrorResponse(
      "platform_request_approve",
      error,
      "Platform request could not be approved.",
    );
  }

  const result = (data ?? {}) as Record<string, unknown>;
  await logAdminAction(supabase, {
    admin_id: admin.id,
    action_type: "platform_request_approved",
    target_user_id:
      typeof result.user_id === "string" ? result.user_id : null,
    target_resource_id: id,
    target_resource_type: "platform_request",
    payload: {
      platform_id: platformId,
      platform_label: label,
      category,
      reactivated: result.reactivated === true,
      siblings_approved: result.siblings_approved ?? 0,
    },
  });

  const delivery = await dispatchNotificationOutbox(supabase);
  return NextResponse.json({ success: true, result: data, delivery });
}
