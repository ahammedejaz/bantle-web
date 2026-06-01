// PATCH /admin/api/platform-categories/[id] — update category metadata.
//
// Category ids are stable by design. Rename is intentionally unsupported
// because platforms.category references the id.

import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction, type AdminActionType } from "@/lib/admin-actions";
import {
  adminErrorResponse,
  safeAdminErrorLog,
} from "@/lib/admin-safe-errors";
import {
  isValidCategoryIconKey,
  validateCategoryDisplayOrder,
  validateCategoryLabel,
} from "@/lib/platform-categories";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { admin, supabase } = auth;
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.id === "string" && body.id !== id) {
    return NextResponse.json(
      { error: "Category ids are stable and cannot be renamed" },
      { status: 400 },
    );
  }

  const updates: Record<string, unknown> = {};

  if (typeof body.label === "string") {
    const label = body.label.trim();
    const labelError = validateCategoryLabel(label);
    if (labelError) {
      return NextResponse.json({ error: labelError }, { status: 400 });
    }
    updates.label = label;
  }

  if ("display_order" in body) {
    const displayOrder = Number(body.display_order);
    const orderError = validateCategoryDisplayOrder(displayOrder);
    if (orderError) {
      return NextResponse.json({ error: orderError }, { status: 400 });
    }
    updates.display_order = displayOrder;
  }

  if ("icon_key" in body) {
    const iconKey =
      typeof body.icon_key === "string" && body.icon_key.trim()
        ? body.icon_key.trim()
        : null;
    if (iconKey !== null && !isValidCategoryIconKey(iconKey)) {
      return NextResponse.json(
        {
          error:
            "icon_key must be one of: music, video, cloud, work, game, book, fitness, news, shopping, other",
        },
        { status: 400 },
      );
    }
    updates.icon_key = iconKey;
  }

  if (typeof body.is_active === "boolean") {
    updates.is_active = body.is_active;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 },
    );
  }

  const { data: existing, error: fetchError } = await supabase
    .from("platform_categories")
    .select("id, is_active")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !existing) {
    if (fetchError) {
      safeAdminErrorLog("admin_platform_category_fetch_failed", fetchError, {
        operation: "platform_category_update",
      });
    }
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("platform_categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    const correlationId = safeAdminErrorLog(
      "admin_platform_category_update_failed",
      error,
      { operation: "platform_category_update" },
    );
    return adminErrorResponse("Platform category could not be updated.", 500, {
      correlationId,
    });
  }

  const actionType: AdminActionType =
    typeof updates.is_active === "boolean" &&
    updates.is_active !== existing.is_active
      ? updates.is_active
        ? "platform_category_activated"
        : "platform_category_deactivated"
      : "platform_category_updated";

  await logAdminAction(supabase, {
    admin_id: admin.id,
    action_type: actionType,
    target_resource_id: id,
    target_resource_type: "platform_category",
    payload: { changes: updates },
  });

  return NextResponse.json({ category: data });
}
