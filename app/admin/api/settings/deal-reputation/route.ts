// GET/PATCH /admin/api/settings/deal-reputation
// Admin-only Deal reputation badge settings plus count-only preview.

import { type NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/admin-actions";
import {
  adminErrorResponse,
  safeAdminErrorLog,
} from "@/lib/admin-safe-errors";

const SETTINGS_SELECT =
  "deal_reputation_badge_enabled, deal_reputation_min_unique_raters, deal_reputation_earn_average, deal_reputation_remove_average, updated_at";

type DealReputationSettings = {
  deal_reputation_badge_enabled: boolean;
  deal_reputation_min_unique_raters: number;
  deal_reputation_earn_average: number;
  deal_reputation_remove_average: number;
  updated_at?: string | null;
};

type DealReputationPreview = {
  profiles_considered: number;
  would_award: number;
  would_remove: number;
  would_keep: number;
  would_stay_off: number;
  changed_count: number;
};

type ParseResult<T> = { value: T } | { error: string };

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { supabase } = auth;

  const loaded = await loadSettingsAndPreview(supabase, "get");
  if ("error" in loaded) return loaded.error;

  return NextResponse.json(loaded.value);
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  const { admin, supabase } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseSettingsBody(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const before = await loadSettings(supabase, "patch_before");
  if ("error" in before) return before.error;

  const { data: updated, error: updateError } = await supabase
    .from("trust_system_settings")
    .update({
      ...parsed.value,
      updated_by: admin.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true)
    .select(SETTINGS_SELECT)
    .maybeSingle();

  if (updateError) {
    if (updateError.code === "23514") {
      return NextResponse.json(
        { error: "Invalid Deal reputation settings." },
        { status: 400 },
      );
    }
    const correlationId = safeAdminErrorLog(
      "admin_deal_reputation_settings_update_failed",
      updateError,
      { operation: "deal_reputation_settings_update" },
    );
    return adminErrorResponse("Deal reputation settings could not be saved.", 500, {
      correlationId,
    });
  }

  if (!updated) {
    const correlationId = safeAdminErrorLog(
      "admin_deal_reputation_settings_update_missing_row",
      null,
      { operation: "deal_reputation_settings_update", missing_row: true },
    );
    return adminErrorResponse("Deal reputation settings could not be saved.", 500, {
      correlationId,
    });
  }

  const preview = await loadPreview(supabase, "patch_preview");
  if ("error" in preview) return preview.error;

  const settings = normalizeSettings(updated);
  await logAdminAction(supabase, {
    admin_id: admin.id,
    action_type: "deal_reputation_settings_updated",
    target_resource_id: "deal_reputation",
    target_resource_type: "trust_system_settings",
    reason: "Deal reputation settings updated",
    payload: {
      previous_settings: stripAuditSettings(before.value),
      next_settings: stripAuditSettings(settings),
      preview: preview.value,
      preview_apply: false,
      apply_recompute_run: false,
    },
  });

  return NextResponse.json({ settings, preview: preview.value });
}

async function loadSettingsAndPreview(
  supabase: SupabaseClient,
  operation: string,
): Promise<
  | { value: { settings: DealReputationSettings; preview: DealReputationPreview } }
  | { error: NextResponse }
> {
  const settings = await loadSettings(supabase, `${operation}_settings`);
  if ("error" in settings) return settings;

  const preview = await loadPreview(supabase, `${operation}_preview`);
  if ("error" in preview) return preview;

  return { value: { settings: settings.value, preview: preview.value } };
}

async function loadSettings(
  supabase: SupabaseClient,
  operation: string,
): Promise<{ value: DealReputationSettings } | { error: NextResponse }> {
  const { data, error } = await supabase
    .from("trust_system_settings")
    .select(SETTINGS_SELECT)
    .eq("id", true)
    .maybeSingle();

  if (error || !data) {
    const correlationId = safeAdminErrorLog(
      "admin_deal_reputation_settings_load_failed",
      error,
      { operation },
    );
    return {
      error: adminErrorResponse(
        "Deal reputation settings could not be loaded.",
        500,
        { correlationId },
      ),
    };
  }

  return { value: normalizeSettings(data) };
}

async function loadPreview(
  supabase: SupabaseClient,
  operation: string,
): Promise<{ value: DealReputationPreview } | { error: NextResponse }> {
  const { data, error } = await supabase.rpc(
    "refresh_all_deal_reputation_badges",
    { p_apply: false },
  );

  if (error) {
    const correlationId = safeAdminErrorLog(
      "admin_deal_reputation_preview_failed",
      error,
      { operation, preview_apply: false },
    );
    return {
      error: adminErrorResponse(
        "Deal reputation preview could not be loaded.",
        500,
        { correlationId },
      ),
    };
  }

  const first = Array.isArray(data) ? data[0] : null;
  return { value: normalizePreview(first) };
}

function parseSettingsBody(body: unknown): ParseResult<{
  deal_reputation_badge_enabled: boolean;
  deal_reputation_min_unique_raters: number;
  deal_reputation_earn_average: number;
  deal_reputation_remove_average: number;
}> {
  if (!isRecord(body)) return { error: "Invalid request body." };

  const enabled = parseBoolean(
    body.deal_reputation_badge_enabled,
    "deal_reputation_badge_enabled",
  );
  if ("error" in enabled) return enabled;

  const minUniqueRaters = parseMinUniqueRaters(
    body.deal_reputation_min_unique_raters,
  );
  if ("error" in minUniqueRaters) return minUniqueRaters;

  const earnAverage = parseRatingAverage(
    body.deal_reputation_earn_average,
    "deal_reputation_earn_average",
  );
  if ("error" in earnAverage) return earnAverage;

  const removeAverage = parseRatingAverage(
    body.deal_reputation_remove_average,
    "deal_reputation_remove_average",
  );
  if ("error" in removeAverage) return removeAverage;

  if (removeAverage.value > earnAverage.value) {
    return {
      error:
        "deal_reputation_remove_average must be less than or equal to deal_reputation_earn_average.",
    };
  }

  return {
    value: {
      deal_reputation_badge_enabled: enabled.value,
      deal_reputation_min_unique_raters: minUniqueRaters.value,
      deal_reputation_earn_average: earnAverage.value,
      deal_reputation_remove_average: removeAverage.value,
    },
  };
}

function parseBoolean(value: unknown, field: string): ParseResult<boolean> {
  if (typeof value !== "boolean") {
    return { error: `${field} must be a boolean.` };
  }
  return { value };
}

function parseMinUniqueRaters(value: unknown): ParseResult<number> {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    return {
      error: "deal_reputation_min_unique_raters must be an integer.",
    };
  }
  if (value < 1) {
    return {
      error: "deal_reputation_min_unique_raters must be at least 1.",
    };
  }
  return { value };
}

function parseRatingAverage(
  value: unknown,
  field: string,
): ParseResult<number> {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return { error: `${field} must be a number.` };
  }

  const cents = Math.round(value * 100);
  if (Math.abs(value * 100 - cents) > 1e-9) {
    return { error: `${field} must use at most two decimal places.` };
  }

  const normalized = cents / 100;
  if (normalized < 1 || normalized > 5) {
    return { error: `${field} must be between 1.00 and 5.00.` };
  }
  return { value: normalized };
}

function normalizeSettings(row: Record<string, unknown>): DealReputationSettings {
  return {
    deal_reputation_badge_enabled:
      row.deal_reputation_badge_enabled === true,
    deal_reputation_min_unique_raters: asNumber(
      row.deal_reputation_min_unique_raters,
      20,
    ),
    deal_reputation_earn_average: asNumber(
      row.deal_reputation_earn_average,
      3.9,
    ),
    deal_reputation_remove_average: asNumber(
      row.deal_reputation_remove_average,
      3.2,
    ),
    updated_at:
      typeof row.updated_at === "string" ? row.updated_at : null,
  };
}

function stripAuditSettings(settings: DealReputationSettings) {
  return {
    deal_reputation_badge_enabled:
      settings.deal_reputation_badge_enabled,
    deal_reputation_min_unique_raters:
      settings.deal_reputation_min_unique_raters,
    deal_reputation_earn_average:
      settings.deal_reputation_earn_average,
    deal_reputation_remove_average:
      settings.deal_reputation_remove_average,
  };
}

function normalizePreview(row: unknown): DealReputationPreview {
  const record = isRecord(row) ? row : {};
  return {
    profiles_considered: asNumber(record.profiles_considered, 0),
    would_award: asNumber(record.would_award, 0),
    would_remove: asNumber(record.would_remove, 0),
    would_keep: asNumber(record.would_keep, 0),
    would_stay_off: asNumber(record.would_stay_off, 0),
    changed_count: asNumber(record.changed_count, 0),
  };
}

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
