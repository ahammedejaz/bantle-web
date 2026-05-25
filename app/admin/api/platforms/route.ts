// GET /admin/api/platforms — list all platforms with listing counts.
// POST /admin/api/platforms — create a new platform.
//
// No pagination on GET: <50 platforms expected, list-everything is
// the right UX for a small catalog the admin curates by hand.

import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-actions";
import {
  adminErrorResponse,
  safeAdminErrorLog,
} from "@/lib/admin-safe-errors";

const VALID_CATEGORIES = ["music", "video", "cloud", "work"] as const;
type Category = (typeof VALID_CATEGORIES)[number];
const SLUG_RE = /^[a-z0-9_]+$/;
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const { data: platforms, error } = await supabase
    .from("platforms")
    .select(
      "id, label, category, default_monthly_price, brand_color, brand_initials, is_active, display_order, created_at",
    )
    .order("display_order", { ascending: true })
    .order("label", { ascending: true });

  if (error) {
    console.error("[admin platforms list]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  // listings.platform is text without FK (recon Query 2b), so this is
  // a value-match count, not a join. Archived listings still count —
  // admin wants the full historical attachment, not just live ones.
  const counts = await Promise.all(
    (platforms ?? []).map(async (p) => {
      const { count } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("platform", p.id);
      return { id: p.id, count: count ?? 0 };
    }),
  );
  const countMap = new Map(counts.map((c) => [c.id, c.count]));

  return NextResponse.json({
    platforms: (platforms ?? []).map((p) => ({
      ...p,
      listing_count: countMap.get(p.id) ?? 0,
    })),
  });
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

  const id =
    typeof body.id === "string" ? body.id.trim().toLowerCase() : "";
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const category = typeof body.category === "string" ? body.category : "";
  const default_monthly_price = Number(body.default_monthly_price);
  const brand_color =
    typeof body.brand_color === "string" ? body.brand_color.trim() : "";
  const brand_initials =
    typeof body.brand_initials === "string"
      ? body.brand_initials.trim().toUpperCase()
      : "";
  const display_order =
    typeof body.display_order === "number" ? body.display_order : 0;

  if (!id || !SLUG_RE.test(id) || id.length < 2 || id.length > 40) {
    return NextResponse.json(
      {
        error:
          "id must be 2-40 chars, lowercase letters/digits/underscores only",
      },
      { status: 400 },
    );
  }
  if (!label || label.length > 60) {
    return NextResponse.json(
      { error: "label is required, max 60 chars" },
      { status: 400 },
    );
  }
  if (!VALID_CATEGORIES.includes(category as Category)) {
    return NextResponse.json(
      { error: `category must be one of: ${VALID_CATEGORIES.join(", ")}` },
      { status: 400 },
    );
  }
  if (
    !Number.isInteger(default_monthly_price) ||
    default_monthly_price < 1 ||
    default_monthly_price > 100000
  ) {
    return NextResponse.json(
      { error: "default_monthly_price must be an integer between 1 and 100000" },
      { status: 400 },
    );
  }
  if (!HEX_RE.test(brand_color)) {
    return NextResponse.json(
      { error: "brand_color must be a hex color like #1ED760" },
      { status: 400 },
    );
  }
  if (
    !brand_initials ||
    brand_initials.length < 1 ||
    brand_initials.length > 3
  ) {
    return NextResponse.json(
      { error: "brand_initials must be 1-3 characters" },
      { status: 400 },
    );
  }
  if (!Number.isInteger(display_order)) {
    return NextResponse.json(
      { error: "display_order must be an integer" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("platforms")
    .insert({
      id,
      label,
      category,
      default_monthly_price,
      brand_color,
      brand_initials,
      is_active: true,
      display_order,
    })
    .select()
    .single();

  if (error) {
    // 23505 = unique_violation (slug already exists)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: `A platform with id "${id}" already exists` },
        { status: 409 },
      );
    }
    const correlationId = safeAdminErrorLog(
      "admin_platforms_create_failed",
      error,
      { operation: "platform_create" },
    );
    return adminErrorResponse("Platform could not be created.", 500, {
      correlationId,
    });
  }

  await logAdminAction(supabase, {
    admin_id: admin.id,
    action_type: "platform_created",
    target_resource_id: id,
    target_resource_type: "platform",
    payload: { label, category, default_monthly_price, brand_color },
  });

  return NextResponse.json({ platform: data }, { status: 201 });
}
