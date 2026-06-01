// GET/PATCH /admin/api/settings/verification — trust verification thresholds.

import { type NextRequest, NextResponse } from "next/server";
import { logAdminAction } from "@/lib/admin-actions";
import {
  adminErrorResponse,
  safeAdminErrorLog,
} from "@/lib/admin-safe-errors";
import { requireAdmin } from "@/lib/admin-auth";

interface VerificationSettingsBody {
  min_rating_count?: unknown;
  min_rating_avg?: unknown;
  loss_rating_avg?: unknown;
}

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

  return NextResponse.json({ settings: data });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { admin, supabase } = auth;

  let body: VerificationSettingsBody;
  try {
    body = (await request.json()) as VerificationSettingsBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseVerificationSettings(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data: previous, error: previousError } = await supabase
    .from("verification_settings")
    .select(SETTINGS_SELECT)
    .eq("id", true)
    .maybeSingle();

  if (previousError || !previous) {
    const correlationId = safeAdminErrorLog(
      "admin_verification_settings_previous_failed",
      previousError,
      { operation: "verification_settings_previous" },
    );
    return adminErrorResponse("Verification settings could not be loaded.", 500, {
      correlationId,
    });
  }

  const { data: settings, error: updateError } = await supabase
    .from("verification_settings")
    .update({
      min_rating_count: parsed.value.min_rating_count,
      min_rating_avg: parsed.value.min_rating_avg,
      loss_rating_avg: parsed.value.loss_rating_avg,
      updated_by: admin.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true)
    .select(SETTINGS_SELECT)
    .maybeSingle();

  if (updateError || !settings) {
    const correlationId = safeAdminErrorLog(
      "admin_verification_settings_update_failed",
      updateError,
      { operation: "verification_settings_update" },
    );
    return adminErrorResponse("Verification settings could not be saved.", 500, {
      correlationId,
    });
  }

  const { data: recomputed, error: recomputeError } = await supabase.rpc(
    "recompute_all_profile_verifications",
  );

  if (recomputeError) {
    const correlationId = safeAdminErrorLog(
      "admin_verification_settings_recompute_failed",
      recomputeError,
      { operation: "verification_settings_recompute" },
    );
    return adminErrorResponse("Verification settings saved, but recompute failed.", 500, {
      correlationId,
    });
  }

  await logAdminAction(supabase, {
    admin_id: admin.id,
    action_type: "verification_settings_updated",
    target_resource_id: "verification_settings",
    target_resource_type: "verification_settings",
    payload: {
      previous,
      next: settings,
      recompute: recomputed?.[0] ?? null,
    },
  });

  return NextResponse.json({
    success: true,
    settings,
    recompute: recomputed?.[0] ?? null,
  });
}

function parseVerificationSettings(body: VerificationSettingsBody):
  | {
      value: {
        min_rating_count: number;
        min_rating_avg: number;
        loss_rating_avg: number;
      };
    }
  | { error: string } {
  const minRatingCount = Number(body.min_rating_count);
  const minRatingAvg = Number(body.min_rating_avg);
  const lossRatingAvg = Number(body.loss_rating_avg);

  if (!Number.isInteger(minRatingCount) || minRatingCount < 1) {
    return { error: "Minimum ratings must be an integer of at least 1." };
  }
  if (!isRatingThreshold(minRatingAvg)) {
    return { error: "Minimum average must be between 1 and 5." };
  }
  if (!isRatingThreshold(lossRatingAvg)) {
    return { error: "Loss average must be between 1 and 5." };
  }
  if (lossRatingAvg > minRatingAvg) {
    return {
      error: "Loss average must be less than or equal to minimum average.",
    };
  }

  return {
    value: {
      min_rating_count: minRatingCount,
      min_rating_avg: roundRatingThreshold(minRatingAvg),
      loss_rating_avg: roundRatingThreshold(lossRatingAvg),
    },
  };
}

function isRatingThreshold(value: number): boolean {
  return Number.isFinite(value) && value >= 1 && value <= 5;
}

function roundRatingThreshold(value: number): number {
  return Math.round(value * 100) / 100;
}
