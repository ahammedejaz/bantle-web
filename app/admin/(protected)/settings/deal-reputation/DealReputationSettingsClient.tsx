"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Save } from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToastProvider";
import { cn } from "@/lib/utils";

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

type ApiResponse = {
  settings: DealReputationSettings;
  preview: DealReputationPreview;
};

type SettingsForm = {
  deal_reputation_badge_enabled: boolean;
  deal_reputation_min_unique_raters: string;
  deal_reputation_earn_average: string;
  deal_reputation_remove_average: string;
};

type FieldErrors = Partial<Record<keyof SettingsForm, string>>;

const DEFAULT_FORM: SettingsForm = {
  deal_reputation_badge_enabled: false,
  deal_reputation_min_unique_raters: "20",
  deal_reputation_earn_average: "3.90",
  deal_reputation_remove_average: "3.20",
};

const API_PATH = "/admin/api/settings/deal-reputation";

export function DealReputationSettingsClient() {
  const toast = useAdminToast();
  const [settings, setSettings] = useState<DealReputationSettings | null>(null);
  const [preview, setPreview] = useState<DealReputationPreview | null>(null);
  const [form, setForm] = useState<SettingsForm>(DEFAULT_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchSettings = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);
      setLoadError(null);

      try {
        const response = await fetch(API_PATH, { cache: "no-store" });
        if (!response.ok) throw new Error(await responseError(response));
        const data = (await response.json()) as ApiResponse;
        setSettings(data.settings);
        setPreview(data.preview);
        setForm(settingsToForm(data.settings));
        setFieldErrors({});
        if (mode === "refresh") {
          toast.show("Deal reputation preview refreshed.", "success");
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Deal reputation settings could not be loaded.";
        setLoadError(message);
        toast.show(message, "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  const validation = validateForm(form);
  const hasValidationErrors = Object.keys(validation.errors).length > 0;
  const thresholdEqualityWarning =
    !hasValidationErrors &&
    validation.payload?.deal_reputation_earn_average ===
      validation.payload?.deal_reputation_remove_average;

  const handleSave = async () => {
    const next = validateForm(form);
    setFieldErrors(next.errors);
    if (!next.payload) {
      toast.show("Fix the highlighted settings before saving.", "error");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(API_PATH, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next.payload),
      });
      if (!response.ok) throw new Error(await responseError(response));
      const data = (await response.json()) as ApiResponse;
      setSettings(data.settings);
      setPreview(data.preview);
      setForm(settingsToForm(data.settings));
      setFieldErrors({});
      toast.show("Deal reputation settings saved.", "success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Deal reputation settings could not be saved.";
      toast.show(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const setField = <K extends keyof SettingsForm>(
    key: K,
    value: SettingsForm[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
      <section className="border border-line rounded-card bg-cream-card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              Settings
            </h2>
            <p className="text-sm text-ink-muted mt-1">
              Defaults are disabled, 20 unique raters, 3.90 award, and 3.20
              removal.
            </p>
          </div>
          <StatusBadge enabled={form.deal_reputation_badge_enabled} />
        </div>

        {loadError ? (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-card p-4 text-red-900 text-sm">
            {loadError}
          </div>
        ) : null}

        <div className="space-y-5">
          <label className="flex items-start gap-3 rounded-card border border-line bg-cream p-4">
            <input
              type="checkbox"
              checked={form.deal_reputation_badge_enabled}
              onChange={(event) =>
                setField(
                  "deal_reputation_badge_enabled",
                  event.target.checked,
                )
              }
              disabled={loading || saving}
              className="mt-1 h-4 w-4 rounded border-line text-teal-900 focus:ring-teal-900"
            />
            <span>
              <span className="block text-sm font-medium text-ink">
                Enable Deal reputation badge
              </span>
              <span className="block text-xs text-ink-muted mt-1">
                When disabled, resolver output keeps the public badge off.
              </span>
            </span>
          </label>

          <NumberField
            label="Minimum unique raters"
            value={form.deal_reputation_min_unique_raters}
            min={1}
            step={1}
            disabled={loading || saving}
            error={fieldErrors.deal_reputation_min_unique_raters}
            helper="Eligibility uses distinct raters, not raw rating rows."
            onChange={(value) =>
              setField("deal_reputation_min_unique_raters", value)
            }
          />

          <div className="grid gap-4 md:grid-cols-2">
            <NumberField
              label="Earn average"
              value={form.deal_reputation_earn_average}
              min={1}
              max={5}
              step={0.01}
              disabled={loading || saving}
              error={fieldErrors.deal_reputation_earn_average}
              helper="Badge can be awarded when an unbadged user meets this average."
              onChange={(value) =>
                setField("deal_reputation_earn_average", value)
              }
            />
            <NumberField
              label="Removal average"
              value={form.deal_reputation_remove_average}
              min={1}
              max={5}
              step={0.01}
              disabled={loading || saving}
              error={fieldErrors.deal_reputation_remove_average}
              helper="Existing badges stay on until the average falls below this threshold."
              onChange={(value) =>
                setField("deal_reputation_remove_average", value)
              }
            />
          </div>

          {thresholdEqualityWarning ? (
            <div className="rounded-card border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Removal average equals earn average. This is allowed by the
              database, but a lower removal average avoids badge flicker.
            </div>
          ) : null}

          <div className="rounded-card border border-line bg-cream p-4 text-sm text-ink-muted">
            Saving updates settings and refreshes the count-only preview. It
            does not run a live recompute, add rating triggers, expose
            thresholds publicly, or change Identity, Business, Partner, hosting,
            or verified badge behavior.
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || saving}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-button",
                "bg-teal-900 text-cream text-sm font-medium",
                "hover:bg-teal-800 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              <Save size={15} />
              {saving ? "Saving..." : "Save settings"}
            </button>
            <button
              type="button"
              onClick={() => void fetchSettings("refresh")}
              disabled={loading || saving || refreshing}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-button",
                "border border-line text-sm font-medium text-ink",
                "hover:bg-cream transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : undefined}
              />
              Refresh preview
            </button>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <PreviewPanel preview={preview} loading={loading} />
        <PolicyPanel settings={settings} />
      </aside>
    </div>
  );
}

function PreviewPanel({
  preview,
  loading,
}: {
  preview: DealReputationPreview | null;
  loading: boolean;
}) {
  const rows = [
    ["Profiles considered", preview?.profiles_considered ?? 0],
    ["Would award", preview?.would_award ?? 0],
    ["Would remove", preview?.would_remove ?? 0],
    ["Would keep", preview?.would_keep ?? 0],
    ["Would stay off", preview?.would_stay_off ?? 0],
    ["Changed count", preview?.changed_count ?? 0],
  ] as const;

  return (
    <section className="border border-line rounded-card bg-cream-card p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">Preview impact</h2>
          <p className="text-xs text-ink-muted mt-1">
            Count-only preview. No affected users are exposed.
          </p>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-button border border-teal-200 bg-teal-50 text-xs font-medium text-teal-900">
          p_apply=false
        </span>
      </div>

      {loading && !preview ? (
        <div className="text-sm text-ink-muted">Loading preview&hellip;</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-card border border-line bg-cream p-3">
              <p className="text-xs text-ink-muted">{label}</p>
              <p className="mt-1 text-2xl font-semibold text-teal-900">
                {value}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PolicyPanel({
  settings,
}: {
  settings: DealReputationSettings | null;
}) {
  return (
    <section className="border border-line rounded-card bg-cream-card p-5">
      <h2 className="text-lg font-semibold text-ink">Current policy</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <PolicyRow
          label="Completed deals only"
          value="Yes"
        />
        <PolicyRow
          label="Unique-rater minimum"
          value={`${settings?.deal_reputation_min_unique_raters ?? 20}`}
        />
        <PolicyRow
          label="Award average"
          value={formatAverage(settings?.deal_reputation_earn_average ?? 3.9)}
        />
        <PolicyRow
          label="Removal average"
          value={formatAverage(settings?.deal_reputation_remove_average ?? 3.2)}
        />
      </dl>
      <p className="mt-4 text-xs text-ink-muted">
        Thresholds are admin-only. The mobile app only sees the public badge
        boolean after server-side resolution.
      </p>
    </section>
  );
}

function PolicyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  disabled,
  error,
  helper,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  max?: number;
  step: number;
  disabled: boolean;
  error?: string;
  helper: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink mb-1">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "w-full px-3 py-2 rounded-button border bg-cream-card text-ink",
          "focus:outline-none focus:ring-2 focus:ring-teal-900",
          disabled ? "opacity-60 cursor-not-allowed" : "",
          error ? "border-red-300" : "border-line",
        )}
      />
      {error ? (
        <span className="block mt-1 text-xs text-red-700">{error}</span>
      ) : (
        <span className="block mt-1 text-xs text-ink-muted">{helper}</span>
      )}
    </label>
  );
}

function StatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-button border text-xs font-medium",
        enabled
          ? "bg-teal-50 text-teal-900 border-teal-200"
          : "bg-gray-50 text-gray-700 border-gray-200",
      )}
    >
      {enabled ? "Enabled" : "Disabled"}
    </span>
  );
}

function settingsToForm(settings: DealReputationSettings): SettingsForm {
  return {
    deal_reputation_badge_enabled:
      settings.deal_reputation_badge_enabled,
    deal_reputation_min_unique_raters: String(
      settings.deal_reputation_min_unique_raters,
    ),
    deal_reputation_earn_average: formatAverage(
      settings.deal_reputation_earn_average,
    ),
    deal_reputation_remove_average: formatAverage(
      settings.deal_reputation_remove_average,
    ),
  };
}

function validateForm(form: SettingsForm): {
  errors: FieldErrors;
  payload: {
    deal_reputation_badge_enabled: boolean;
    deal_reputation_min_unique_raters: number;
    deal_reputation_earn_average: number;
    deal_reputation_remove_average: number;
  } | null;
} {
  const errors: FieldErrors = {};
  const minUniqueRaters = parseInteger(
    form.deal_reputation_min_unique_raters,
  );
  if (minUniqueRaters === null || minUniqueRaters < 1) {
    errors.deal_reputation_min_unique_raters =
      "Minimum unique raters must be at least 1.";
  }

  const earnAverage = parseAverage(form.deal_reputation_earn_average);
  if (earnAverage === null) {
    errors.deal_reputation_earn_average =
      "Earn average must be between 1.00 and 5.00 with at most two decimals.";
  }

  const removeAverage = parseAverage(form.deal_reputation_remove_average);
  if (removeAverage === null) {
    errors.deal_reputation_remove_average =
      "Removal average must be between 1.00 and 5.00 with at most two decimals.";
  }

  if (
    earnAverage !== null &&
    removeAverage !== null &&
    removeAverage > earnAverage
  ) {
    errors.deal_reputation_remove_average =
      "Removal average must be less than or equal to earn average.";
  }

  if (
    Object.keys(errors).length > 0 ||
    minUniqueRaters === null ||
    earnAverage === null ||
    removeAverage === null
  ) {
    return { errors, payload: null };
  }

  return {
    errors,
    payload: {
      deal_reputation_badge_enabled:
        form.deal_reputation_badge_enabled,
      deal_reputation_min_unique_raters: minUniqueRaters,
      deal_reputation_earn_average: earnAverage,
      deal_reputation_remove_average: removeAverage,
    },
  };
}

function parseInteger(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function parseAverage(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5) return null;
  return Math.round(parsed * 100) / 100;
}

function formatAverage(value: number): string {
  return value.toFixed(2);
}

async function responseError(response: Response): Promise<string> {
  const data = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  return data?.error ?? `HTTP ${response.status}`;
}
