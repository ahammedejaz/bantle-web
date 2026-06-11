"use client";

import { useEffect, useState } from "react";
import { useAdminToast } from "./AdminToastProvider";

interface VerificationSettings {
  min_rating_count: number;
  min_rating_avg: number;
  loss_rating_avg: number;
  updated_at: string;
  updated_by: string | null;
}

interface VerificationSettingsResponse {
  settings: VerificationSettings;
  recompute?: {
    total_profiles: number;
    changed_profiles: number;
    verified_profiles: number;
    non_manual_zero_rating_verified: number;
  } | null;
}

interface VerificationSettingsPanelProps {
  onSaved?: () => void | Promise<void>;
}

export function VerificationSettingsPanel({
  onSaved,
}: VerificationSettingsPanelProps) {
  const { show } = useAdminToast();
  const [settings, setSettings] = useState<VerificationSettings | null>(null);
  const [draft, setDraft] = useState({
    min_rating_count: "10",
    min_rating_avg: "3.9",
    loss_rating_avg: "3.8",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      try {
        const response = await fetch("/admin/api/settings/verification");
        if (!response.ok) {
          const data = (await response
            .json()
            .catch(() => ({ error: `HTTP ${response.status}` }))) as {
            error?: string;
          };
          throw new Error(data.error ?? `HTTP ${response.status}`);
        }

        const data = (await response.json()) as VerificationSettingsResponse;
        if (cancelled) return;
        setSettings(data.settings);
        setDraft({
          min_rating_count: String(data.settings.min_rating_count),
          min_rating_avg: String(data.settings.min_rating_avg),
          loss_rating_avg: String(data.settings.loss_rating_avg),
        });
      } catch (e) {
        if (!cancelled) {
          show(
            e instanceof Error
              ? e.message
              : "Legacy trust-badge settings could not be loaded.",
            "error",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadSettings();
    return () => {
      cancelled = true;
    };
  }, [show]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setSummary(null);
    try {
      const response = await fetch("/admin/api/settings/verification", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          min_rating_count: Number(draft.min_rating_count),
          min_rating_avg: Number(draft.min_rating_avg),
          loss_rating_avg: Number(draft.loss_rating_avg),
        }),
      });

      if (!response.ok) {
        const data = (await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}` }))) as {
          error?: string;
        };
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }

      const data = (await response.json()) as VerificationSettingsResponse;
      setSettings(data.settings);
      setDraft({
        min_rating_count: String(data.settings.min_rating_count),
        min_rating_avg: String(data.settings.min_rating_avg),
        loss_rating_avg: String(data.settings.loss_rating_avg),
      });
      if (data.recompute) {
        setSummary(
          `Recomputed ${data.recompute.total_profiles} profiles; ${data.recompute.changed_profiles} changed.`,
        );
      }
      show("Legacy trust-badge settings saved.", "success");
      await onSaved?.();
    } catch (e) {
      show(e instanceof Error ? e.message : "Save failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-6 pt-6 border-t border-line">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h2 className="text-xs uppercase tracking-[0.14em] text-teal-600">
            Legacy trust-badge settings
          </h2>
          <p className="text-xs text-ink-muted mt-1 max-w-xl">
            Rating thresholds and manual overrides control the legacy public
            badge only. This is separate from selfie identity verification.
          </p>
        </div>
        {settings ? (
          <p className="text-[11px] text-ink-muted whitespace-nowrap">
            Updated {formatDate(settings.updated_at)}
          </p>
        ) : null}
      </div>

      <div className="rounded-card border border-line bg-cream-card p-4">
        {loading ? (
          <p className="text-sm text-ink-muted">Loading settings&hellip;</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <NumberField
                id="verification-min-count"
                label="Minimum ratings"
                min="1"
                step="1"
                value={draft.min_rating_count}
                disabled={saving}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    min_rating_count: value,
                  }))
                }
              />
              <NumberField
                id="verification-min-avg"
                label="Minimum average"
                min="1"
                max="5"
                step="0.1"
                value={draft.min_rating_avg}
                disabled={saving}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    min_rating_avg: value,
                  }))
                }
              />
              <NumberField
                id="verification-loss-avg"
                label="Loss average"
                min="1"
                max="5"
                step="0.1"
                value={draft.loss_rating_avg}
                disabled={saving}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    loss_rating_avg: value,
                  }))
                }
              />
            </div>

            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2.5 rounded-button bg-teal-900 text-cream hover:bg-teal-800 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving…" : "Save thresholds"}
              </button>
              {summary ? (
                <p className="text-xs text-ink-muted">{summary}</p>
              ) : null}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function NumberField({
  id,
  label,
  min,
  max,
  step,
  value,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  min: string;
  max?: string;
  step: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="block text-xs uppercase tracking-[0.12em] text-teal-700 mb-1">
        {label}
      </span>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-3 py-2 text-sm border border-line rounded-button bg-white text-ink focus:outline-none focus:ring-2 focus:ring-teal-900 disabled:opacity-60"
      />
    </label>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
