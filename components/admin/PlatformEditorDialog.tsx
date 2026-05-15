"use client";

import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Platform } from "./PlatformRow";

export type EditorMode = "create" | "edit";

interface PlatformEditorDialogProps {
  open: boolean;
  mode: EditorMode;
  platform: Platform | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const CATEGORIES = ["music", "video", "cloud", "work"] as const;
const SLUG_RE = /^[a-z0-9_]+$/;
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

interface FormState {
  id: string;
  label: string;
  category: string;
  default_monthly_price: string;
  brand_color: string;
  brand_initials: string;
  display_order: string;
}

const EMPTY_FORM: FormState = {
  id: "",
  label: "",
  category: "music",
  default_monthly_price: "",
  brand_color: "#1ED760",
  brand_initials: "",
  display_order: "0",
};

// "Spotify Family" -> "spotify_family"
function suggestSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

interface FieldErrors {
  id?: string;
  label?: string;
  category?: string;
  default_monthly_price?: string;
  brand_color?: string;
  brand_initials?: string;
  display_order?: string;
}

function validate(form: FormState, mode: EditorMode): FieldErrors {
  const errs: FieldErrors = {};
  if (mode === "create") {
    if (!form.id || !SLUG_RE.test(form.id) || form.id.length < 2 || form.id.length > 40) {
      errs.id =
        "Slug must be 2-40 chars, lowercase letters / digits / underscores only";
    }
  }
  if (!form.label.trim() || form.label.length > 60) {
    errs.label = "Label is required (max 60 chars)";
  }
  if (!CATEGORIES.includes(form.category as (typeof CATEGORIES)[number])) {
    errs.category = "Pick a category";
  }
  const price = Number(form.default_monthly_price);
  if (!Number.isInteger(price) || price < 1 || price > 100000) {
    errs.default_monthly_price = "Integer 1-100000";
  }
  if (!HEX_RE.test(form.brand_color)) {
    errs.brand_color = "Hex like #1ED760";
  }
  const initials = form.brand_initials.trim();
  if (!initials || initials.length < 1 || initials.length > 3) {
    errs.brand_initials = "1-3 characters";
  }
  const order = Number(form.display_order);
  if (!Number.isInteger(order)) {
    errs.display_order = "Integer";
  }
  return errs;
}

export function PlatformEditorDialog({
  open,
  mode,
  platform,
  onClose,
  onSuccess,
  onError,
}: PlatformEditorDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  // Track whether the slug has been manually touched. If it hasn't,
  // typing in the label auto-suggests a slug. Once touched, label
  // edits stop overriding the slug.
  const slugTouchedRef = useRef(false);

  // Initialize / reset form when the dialog opens with a new mode/target.
  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && platform) {
      setForm({
        id: platform.id,
        label: platform.label,
        category: platform.category,
        default_monthly_price: String(platform.default_monthly_price),
        brand_color: platform.brand_color,
        brand_initials: platform.brand_initials,
        display_order: String(platform.display_order ?? 0),
      });
      slugTouchedRef.current = true; // immutable in edit mode anyway
    } else {
      setForm(EMPTY_FORM);
      slugTouchedRef.current = false;
    }
    setErrors({});
  }, [open, mode, platform]);

  const handleLabelChange = (next: string) => {
    setForm((prev) => {
      const update: Partial<FormState> = { label: next };
      // Auto-suggest slug only in create mode when slug hasn't been
      // manually touched.
      if (mode === "create" && !slugTouchedRef.current) {
        update.id = suggestSlug(next);
      }
      // Also auto-fill brand_initials from the first 2 chars of the
      // label if it's empty — small UX nudge, admin can override.
      if (!prev.brand_initials) {
        const guess = next
          .replace(/[^A-Za-z]/g, "")
          .slice(0, 2)
          .toUpperCase();
        if (guess) update.brand_initials = guess;
      }
      return { ...prev, ...update };
    });
  };

  const handleSlugChange = (next: string) => {
    slugTouchedRef.current = true;
    setForm((prev) => ({
      ...prev,
      id: next.toLowerCase().replace(/[^a-z0-9_]/g, ""),
    }));
  };

  const handleSubmit = async () => {
    const fieldErrs = validate(form, mode);
    if (Object.keys(fieldErrs).length > 0) {
      setErrors(fieldErrs);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const payload = {
      label: form.label.trim(),
      category: form.category,
      default_monthly_price: Number(form.default_monthly_price),
      brand_color: form.brand_color.trim(),
      brand_initials: form.brand_initials.trim().toUpperCase(),
      display_order: Number(form.display_order),
      ...(mode === "create" ? { id: form.id } : {}),
    };

    try {
      const url =
        mode === "create"
          ? "/admin/api/platforms"
          : `/admin/api/platforms/${platform!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}` }))) as {
          error?: string;
        };
        // 409 from POST = slug taken. Surface inline on the slug field.
        if (response.status === 409 && mode === "create") {
          setErrors({ id: data.error ?? "Slug already exists" });
          setSubmitting(false);
          return;
        }
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }

      onSuccess(
        mode === "create"
          ? "Platform created."
          : "Platform updated.",
      );
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Action failed.";
      onError(message);
      setSubmitting(false);
    }
  };

  const previewBg = HEX_RE.test(form.brand_color)
    ? form.brand_color
    : "#999999";

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        if (!o && !submitting) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-[60] bg-teal-900/40",
            "transition-opacity duration-200",
            "data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
          )}
        />
        <Dialog.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-[70]",
            "translate-x-[-50%] translate-y-[-50%]",
            "w-[calc(100%-2rem)] max-w-lg",
            "max-h-[90vh] overflow-y-auto",
            "bg-cream-card border border-line rounded-card",
            "p-6 shadow-xl",
            "transition-opacity duration-150",
            "data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
          )}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-1 pt-1">
              <Dialog.Title className="font-serif italic text-xl text-teal-900 leading-tight">
                {mode === "create" ? "New platform" : `Edit ${form.label || "platform"}`}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-ink-muted mt-2">
                {mode === "create"
                  ? "Adds a new platform to the catalog. Mobile picker reads from the catalog on next session."
                  : "Updates this platform. Slug is immutable to avoid orphaning listings."}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close"
              disabled={submitting}
              className="text-ink-muted hover:text-ink transition-colors"
            >
              <X size={18} />
            </Dialog.Close>
          </div>

          {/* Live preview */}
          <div className="flex items-center gap-3 p-3 rounded-card border border-line bg-cream mb-5">
            <div
              className="w-10 h-10 rounded-card flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: previewBg }}
            >
              {form.brand_initials || "??"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">
                {form.label || "Platform name"}
              </p>
              <p className="text-xs text-ink-muted">
                {form.category} ·{" "}
                {form.default_monthly_price
                  ? `₹${form.default_monthly_price}/mo`
                  : "—"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Field label="Label" error={errors.label}>
              <input
                type="text"
                value={form.label}
                onChange={(e) => handleLabelChange(e.target.value)}
                disabled={submitting}
                placeholder="e.g. Spotify Family"
                maxLength={60}
                className={inputClass}
              />
            </Field>

            <Field
              label="Slug"
              error={errors.id}
              hint={
                mode === "edit"
                  ? "Slug is immutable to avoid orphaning listings."
                  : "Lowercase letters, digits, and underscores. Auto-suggested from the label."
              }
            >
              <input
                type="text"
                value={form.id}
                onChange={(e) => handleSlugChange(e.target.value)}
                disabled={submitting || mode === "edit"}
                placeholder="spotify_family"
                maxLength={40}
                className={cn(inputClass, "font-mono")}
              />
            </Field>

            <Field label="Category" error={errors.category}>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                disabled={submitting}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Default monthly price (₹)"
              error={errors.default_monthly_price}
            >
              <input
                type="number"
                value={form.default_monthly_price}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    default_monthly_price: e.target.value,
                  }))
                }
                disabled={submitting}
                placeholder="40"
                min={1}
                max={100000}
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Brand color (hex)" error={errors.brand_color}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.brand_color}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, brand_color: e.target.value }))
                    }
                    disabled={submitting}
                    placeholder="#1ED760"
                    maxLength={7}
                    className={cn(inputClass, "font-mono flex-1")}
                  />
                  <span
                    className="w-9 h-9 rounded-card border border-line shrink-0"
                    style={{ backgroundColor: previewBg }}
                    aria-hidden
                  />
                </div>
              </Field>

              <Field label="Brand initials" error={errors.brand_initials}>
                <input
                  type="text"
                  value={form.brand_initials}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      brand_initials: e.target.value.toUpperCase().slice(0, 3),
                    }))
                  }
                  disabled={submitting}
                  placeholder="SF"
                  maxLength={3}
                  className={cn(inputClass, "uppercase")}
                />
              </Field>
            </div>

            <Field
              label="Display order"
              error={errors.display_order}
              hint="Lower numbers appear first in the picker."
            >
              <input
                type="number"
                value={form.display_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, display_order: e.target.value }))
                }
                disabled={submitting}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-button",
                "border border-line bg-white",
                "text-sm font-medium text-ink",
                "hover:bg-cream transition-colors",
                "disabled:opacity-50",
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-button",
                "bg-teal-900 text-cream",
                "text-sm font-medium",
                "hover:bg-teal-800 transition-colors",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              )}
            >
              {submitting
                ? "Working…"
                : mode === "create"
                  ? "Create platform"
                  : "Save changes"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const inputClass =
  "w-full px-3 py-2 text-sm border border-line rounded-button bg-cream text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-teal-900 disabled:opacity-60 disabled:cursor-not-allowed";

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-teal-900 mb-1">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-700 mt-1">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-muted mt-1">{hint}</p>
      ) : null}
    </div>
  );
}
