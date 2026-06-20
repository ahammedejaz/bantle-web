// GET/PATCH /admin/api/settings/verification - deprecated rating thresholds.

import { type NextRequest, NextResponse } from "next/server";
import {
  adminErrorResponse,
  safeAdminErrorLog,
} from "@/lib/admin-safe-errors";
import { requireAdmin } from "@/lib/admin-auth";

const SETTINGS_SELECT =
  "id, min_rating_count, min_rating_avg, loss_rating_avg, updated_at, updated_by";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("verification_settings")
    .select(SETTINGS_SELECT)
    .eq("id", true)
    .maybeSingle();

  if (error || !data) {
    const correlationId = safeAdminErrorLog(
      "admin_verification_settings_get_failed",
      error,
      { operation: "verification_settings_get" },
    );
    return adminErrorResponse("Verification settings could not be loaded.", 500, {
      correlationId,
    });
  }

  return NextResponse.json({
    settings: data,
    deprecated: true,
    read_only: true,
  });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  return NextResponse.json(
    {
      error:
        "Rating-based verification settings are deprecated and read-only.",
    },
    { status: 410 },
  );
}
