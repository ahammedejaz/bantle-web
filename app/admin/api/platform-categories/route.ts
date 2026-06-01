// GET /admin/api/platform-categories — list managed category rows.
// POST /admin/api/platform-categories — create a stable category id.

import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-actions";
import {
  adminErrorResponse,
  safeAdminErrorLog,
} from "@/lib/admin-safe-errors";
import {
  isValidCategoryIconKey,
  validateCategoryDisplayOrder,
  validateCategoryId,
  validateCategoryLabel,
} from "@/lib/platform-categories";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("platform_categories")
    .select("id, label, display_order, icon_key, is_active, created_at, updated_at")
    .order("display_order", { ascending: true })
    .order("label", { ascending: true });

  if (error) {
    const correlationId = safeAdminErrorLog(
      "admin_platform_categories_list_failed",
      error,
      { operation: "platform_category_list" },
    );
    return adminErrorResponse("Platform categories could not be loaded.", 500, {
      correlationId,
    });
  }

  return NextResponse.json({ categories: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { admin, supabase } = auth;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id.trim().toLowerCase() : "";
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const display_order = Number(body.display_order ?? 0);
  const icon_key =
    typeof body.icon_key === "string" && body.icon_key.trim()
      ? body.icon_key.trim()
      : null;
  const is_active =
    typeof body.is_active === "boolean" ? body.is_active : true;

  const idError = validateCategoryId(id);
  if (idError) return NextResponse.json({ error: idError }, { status: 400 });

  const labelError = validateCategoryLabel(label);
  if (labelError) {
    return NextResponse.json({ error: labelError }, { status: 400 });
  }

  const orderError = validateCategoryDisplayOrder(display_order);
  if (orderError) {
    return NextResponse.json({ error: orderError }, { status: 400 });
  }

  if (icon_key !== null && !isValidCategoryIconKey(icon_key)) {
    return NextResponse.json(
      {
        error:
          "icon_key must be one of: music, video, cloud, work, game, book, fitness, news, shopping, other",
      },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("platform_categories")
    .insert({
      id,
      label,
      display_order,
      icon_key,
      is_active,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: `A category with id "${id}" already exists` },
        { status: 409 },
      );
    }
    const correlationId = safeAdminErrorLog(
      "admin_platform_category_create_failed",
      error,
      { operation: "platform_category_create" },
    );
    return adminErrorResponse("Platform category could not be created.", 500, {
      correlationId,
    });
  }

  await logAdminAction(supabase, {
    admin_id: admin.id,
    action_type: "platform_category_created",
    target_resource_id: id,
    target_resource_type: "platform_category",
    payload: { label, display_order, icon_key, is_active },
  });

  return NextResponse.json({ category: data }, { status: 201 });
}
