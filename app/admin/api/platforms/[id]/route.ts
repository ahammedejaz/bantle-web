// PATCH /admin/api/platforms/[id] — update an existing platform.
// Body: any subset of:
//   { label, category, default_monthly_price, brand_color,
//     brand_initials, is_active, display_order }
// Slug (id) is IMMUTABLE — changing it would orphan listings since
// listings.platform has NO FK to platforms.id (recon Query 2b).

import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-actions";

const VALID_CATEGORIES = ["music", "video", "cloud", "work"] as const;
type Category = (typeof VALID_CATEGORIES)[number];
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { admin, supabase } = auth;

  const platformId = params.id;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Confirm it exists before doing any work. Also fetches baseline so
  // future audit improvements (before/after diff) can extend the payload.
  const { data: existing, error: fetchError } = await supabase
    .from("platforms")
    .select("id")
    .eq("id", platformId)
    .maybeSingle();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Platform not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};

  if (typeof body.label === "string") {
    const label = body.label.trim();
    if (!label || label.length > 60) {
      return NextResponse.json(
        { error: "label must be 1-60 chars" },
        { status: 400 },
      );
    }
    updates.label = label;
  }

  if (typeof body.category === "string") {
    if (!VALID_CATEGORIES.includes(body.category as Category)) {
      return NextResponse.json(
        { error: `category must be one of: ${VALID_CATEGORIES.join(", ")}` },
        { status: 400 },
      );
    }
    updates.category = body.category;
  }

  if ("default_monthly_price" in body) {
    const price = Number(body.default_monthly_price);
    if (!Number.isInteger(price) || price < 1 || price > 100000) {
      return NextResponse.json(
        { error: "default_monthly_price must be an integer 1-100000" },
        { status: 400 },
      );
    }
    updates.default_monthly_price = price;
  }

  if (typeof body.brand_color === "string") {
    const color = body.brand_color.trim();
    if (!HEX_RE.test(color)) {
      return NextResponse.json(
        { error: "brand_color must be a hex color like #1ED760" },
        { status: 400 },
      );
    }
    updates.brand_color = color;
  }

  if (typeof body.brand_initials === "string") {
    const initials = body.brand_initials.trim().toUpperCase();
    if (!initials || initials.length < 1 || initials.length > 3) {
      return NextResponse.json(
        { error: "brand_initials must be 1-3 characters" },
        { status: 400 },
      );
    }
    updates.brand_initials = initials;
  }

  if (typeof body.is_active === "boolean") {
    updates.is_active = body.is_active;
  }

  if (typeof body.display_order === "number") {
    if (!Number.isInteger(body.display_order)) {
      return NextResponse.json(
        { error: "display_order must be an integer" },
        { status: 400 },
      );
    }
    updates.display_order = body.display_order;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("platforms")
    .update(updates)
    .eq("id", platformId)
    .select()
    .single();

  if (error) {
    console.error("[admin platforms update]", error);
    return NextResponse.json(
      { error: `Update failed: ${error.message}` },
      { status: 500 },
    );
  }

  // Audit captures the field-level changes. is_active toggles log as
  // platform_updated (not a separate kind) — keeps the audit type set
  // small and the change is fully captured in the payload.
  await logAdminAction(supabase, {
    admin_id: admin.id,
    action_type: "platform_updated",
    target_resource_id: platformId,
    target_resource_type: "platform",
    payload: { changes: updates },
  });

  return NextResponse.json({ platform: data });
}
