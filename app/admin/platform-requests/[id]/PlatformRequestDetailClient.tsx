"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdminToast } from "@/components/admin/AdminToastProvider";
import { cn } from "@/lib/utils";
import {
  fmtDate,
  getRequestStatusDisplay,
  suggestInitials,
  suggestSlug,
  type PlatformRequestStatus,
} from "../platformRequestStatus";

const SLUG_RE = /^[a-z0-9][a-z0-9_-]*$/;
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

interface PlatformCategory {
  id: string;
  label: string;
  is_active: boolean | null;
}

interface PlatformRequestDetail {
  id: string;
  user_id: string;
  requested_name: string;
  normalized_name: string;
  suggested_category: string | null;
  user_note: string | null;
  status: PlatformRequestStatus;
  approved_platform_id: string | null;
  requested_at: string;
  reviewed_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  user_visible_rejection_message: string | null;
  admin_internal_note: string | null;
  user: {
    id: string;
    display_name: string | null;
    is_verified: boolean | null;
    created_at: string | null;
  } | null;
  reviewer: { id: string; display_name: string | null } | null;
}

interface PlatformForm {
  platform_id: string;
  label: string;
  category: string;
  default_monthly_price: string;
  brand_color: string;
  brand_initials: string;
  display_order: string;
}

interface FieldErrors {
  platform_id?: string;
  label?: string;
  category?: string;
  default_monthly_price?: string;
  brand_color?: string;
  brand_initials?: string;
  display_order?: string;
}

export function PlatformRequestDetailClient({
  requestId,
}: {
  requestId: string;
}) {
  const router = useRouter();
  const toast = useAdminToast();
  const [detail, setDetail] = useState<PlatformRequestDetail | null>(null);
  const [categories, setCategories] = useState<PlatformCategory[]>([]);
  const [siblingCount, setSiblingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<PlatformForm | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [adminNote, setAdminNote] = useState("");
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [submitting, setSubmitting] = useState<"approve" | "reject" | null>(
    null,
  );

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/admin/api/platform-requests/${requestId}`);
      if (!response.ok) {
        const data = (await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}` }))) as {
          error?: string;
        };
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }
      const data = (await response.json()) as {
        request: PlatformRequestDetail;
        sibling_pending_count: number;
        categories: PlatformCategory[];
      };
      setDetail(data.request);
      setCategories(data.categories);
      setSiblingCount(data.sibling_pending_count);
      setAdminNote(data.request.admin_internal_note ?? "");
      // Seed the catalogue form from what the member typed. The admin can
      // correct every field before approving.
      const firstActive = data.categories.find((c) => c.is_active)?.id ?? "";
      setForm({
        platform_id: suggestSlug(data.request.requested_name),
        label: data.request.requested_name,
        category: data.request.suggested_category ?? firstActive,
        default_monthly_price: "",
        brand_color: "#0F766E",
        brand_initials: suggestInitials(data.request.requested_name),
        display_order: "0",
      });
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Platform request could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  const validate = (values: PlatformForm): FieldErrors => {
    const next: FieldErrors = {};
    if (
      !values.platform_id ||
      !SLUG_RE.test(values.platform_id) ||
      values.platform_id.length < 2 ||
      values.platform_id.length > 40
    ) {
      next.platform_id =
        "Slug must be 2-40 chars: lowercase letters, digits, _ or -";
    }
    if (!values.label.trim() || values.label.trim().length > 60) {
      next.label = "Label is required (max 60 chars)";
    }
    if (!categories.some((c) => c.id === values.category && c.is_active)) {
      next.category = "Pick an active category";
    }
    const price = Number(values.default_monthly_price);
    if (!Number.isInteger(price) || price < 1 || price > 100000) {
      next.default_monthly_price = "Integer 1-100000";
    }
    if (!HEX_RE.test(values.brand_color)) {
      next.brand_color = "Hex like #1ED760";
    }
    const initials = values.brand_initials.trim();
    if (initials.length < 1 || initials.length > 3) {
      next.brand_initials = "1-3 characters";
    }
    if (!Number.isInteger(Number(values.display_order))) {
      next.display_order = "Integer";
    }
    return next;
  };

  const approve = async () => {
    if (submitting || !form) return;
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting("approve");
    try {
      const result = await postReviewAction("approve", {
        platform_id: form.platform_id,
        label: form.label.trim(),
        category: form.category,
        default_monthly_price: Number(form.default_monthly_price),
        brand_color: form.brand_color.toUpperCase(),
        brand_initials: form.brand_initials.trim().toUpperCase(),
        display_order: Number(form.display_order),
        admin_internal_note: adminNote,
      });
      const siblings = Number(
        (result?.result as Record<string, unknown> | undefined)
          ?.siblings_approved ?? 0,
      );
      toast.show(
        siblings > 0
          ? `Platform approved. ${siblings} other request${
              siblings === 1 ? "" : "s"
            } for the same name resolved too.`
          : "Platform approved and added to the catalogue.",
        "success",
      );
      router.push("/admin/platform-requests");
      router.refresh();
    } catch (err) {
      toast.show(
        err instanceof Error ? err.message : "Approval failed.",
        "error",
      );
      void fetchDetail();
    } finally {
      setSubmitting(null);
    }
  };

  const reject = async () => {
    if (submitting) return;
    setSubmitting("reject");
    try {
      await postReviewAction("reject", {
        user_visible_rejection_message: rejectionMessage,
        admin_internal_note: adminNote,
      });
      toast.show("Platform request rejected.", "success");
      router.push("/admin/platform-requests");
      router.refresh();
    } catch (err) {
      toast.show(
        err instanceof Error ? err.message : "Rejection failed.",
        "error",
      );
      void fetchDetail();
    } finally {
      setSubmitting(null);
    }
  };

  const postReviewAction = async (
    action: "approve" | "reject",
    body: Record<string, unknown>,
  ): Promise<{ result?: unknown } | null> => {
    const response = await fetch(
      `/admin/api/platform-requests/${requestId}/${action}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    if (!response.ok) {
      const data = (await response
        .json()
        .catch(() => ({ error: `HTTP ${response.status}` }))) as {
        error?: string;
      };
      throw new Error(data.error ?? `HTTP ${response.status}`);
    }
    return (await response.json().catch(() => null)) as {
      result?: unknown;
    } | null;
  };

  if (loading && !detail) {
    return <div className="text-ink-muted">Loading platform request&hellip;</div>;
  }
  if (error || !detail) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-card p-4 text-red-900 text-sm">
        {error ?? "Platform request not found."}
      </div>
    );
  }

  const statusDisplay = getRequestStatusDisplay(detail.status);
  const pending = detail.status === "pending";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-button border",
            statusDisplay.className,
          )}
        >
          {statusDisplay.label}
        </span>
        <span className="text-xs text-ink-muted font-mono">
          #{detail.id.slice(0, 8)}
        </span>
      </div>
      <h1 className="font-serif italic text-3xl md:text-4xl text-teal-900 leading-[1.1] mb-6 break-words">
        {detail.requested_name}
      </h1>

      <div className="grid gap-3 sm:grid-cols-2">
        <InfoBlock
          label="Requested by"
          value={detail.user?.display_name ?? "Unknown user"}
          sub={detail.user?.is_verified ? "Verified member" : "Not verified"}
        />
        <InfoBlock
          label="Requested"
          value={fmtDate(detail.requested_at)}
          sub={
            detail.reviewed_at
              ? `Reviewed ${fmtDate(detail.reviewed_at)}${
                  detail.reviewer?.display_name
                    ? ` by ${detail.reviewer.display_name}`
                    : ""
                }`
              : undefined
          }
        />
        <InfoBlock
          label="Suggested category"
          value={detail.suggested_category ?? "None given"}
        />
        <InfoBlock label="Match key" value={detail.normalized_name} />
      </div>

      {detail.user_note ? (
        <section className="mt-6 bg-cream-card border border-line rounded-card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-2">
            Member note
          </p>
          <p className="text-sm text-ink whitespace-pre-wrap break-words">
            {detail.user_note}
          </p>
        </section>
      ) : null}

      {pending && siblingCount > 0 ? (
        <div className="mt-6 rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {siblingCount} other pending request
          {siblingCount === 1 ? "" : "s"} match this name. Approving here
          resolves and notifies {siblingCount === 1 ? "that member" : "them"}{" "}
          too.
        </div>
      ) : null}

      {detail.user_visible_rejection_message ? (
        <section className="mt-6 bg-red-50 border border-red-200 rounded-card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-red-900 mb-2">
            User-visible rejection message
          </p>
          <p className="text-sm text-red-900">
            {detail.user_visible_rejection_message}
          </p>
        </section>
      ) : null}

      {detail.approved_platform_id ? (
        <section className="mt-6 bg-teal-50 border border-teal-200 rounded-card p-4 text-sm text-teal-900">
          Added to the catalogue as{" "}
          <Link
            href="/admin/platforms"
            className="font-mono underline underline-offset-2"
          >
            {detail.approved_platform_id}
          </Link>
          .
        </section>
      ) : null}

      <section className="mt-8 pt-8 border-t border-line">
        <h2 className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-3">
          Review action
        </h2>
        {pending && form ? (
          <div className="space-y-6">
            <div className="rounded-card border border-line bg-cream-card p-4">
              <p className="text-sm font-medium text-teal-900 mb-1">
                Catalogue entry
              </p>
              <p className="text-xs text-ink-muted mb-4">
                These become the live platform row. Check the name matches the
                real service and that a shareable family or household plan
                actually exists.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Slug" error={errors.platform_id} hint="Permanent id">
                  <input
                    value={form.platform_id}
                    onChange={(event) =>
                      setForm({ ...form, platform_id: event.target.value })
                    }
                    className={cn(inputClass, "font-mono")}
                    placeholder="disney_hotstar"
                  />
                </Field>
                <Field label="Label" error={errors.label}>
                  <input
                    value={form.label}
                    onChange={(event) =>
                      setForm({ ...form, label: event.target.value })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Category" error={errors.category}>
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="">Select a category</option>
                    {categories
                      .filter((category) => category.is_active)
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                  </select>
                </Field>
                <Field
                  label="Default monthly price"
                  error={errors.default_monthly_price}
                  hint="Rupees, shown as the listing default"
                >
                  <input
                    value={form.default_monthly_price}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        default_monthly_price: event.target.value,
                      })
                    }
                    inputMode="numeric"
                    className={inputClass}
                    placeholder="199"
                  />
                </Field>
                <Field label="Brand colour" error={errors.brand_color}>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={
                        HEX_RE.test(form.brand_color)
                          ? form.brand_color
                          : "#0F766E"
                      }
                      onChange={(event) =>
                        setForm({ ...form, brand_color: event.target.value })
                      }
                      className="h-9 w-12 shrink-0 rounded-button border border-line bg-cream"
                      aria-label="Brand colour picker"
                    />
                    <input
                      value={form.brand_color}
                      onChange={(event) =>
                        setForm({ ...form, brand_color: event.target.value })
                      }
                      className={cn(inputClass, "font-mono")}
                    />
                  </div>
                </Field>
                <Field label="Brand initials" error={errors.brand_initials}>
                  <input
                    value={form.brand_initials}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        brand_initials: event.target.value.toUpperCase(),
                      })
                    }
                    maxLength={3}
                    className={inputClass}
                  />
                </Field>
                <Field label="Display order" error={errors.display_order}>
                  <input
                    value={form.display_order}
                    onChange={(event) =>
                      setForm({ ...form, display_order: event.target.value })
                    }
                    inputMode="numeric"
                    className={inputClass}
                  />
                </Field>
                <div>
                  <span className="block text-sm font-medium text-teal-900 mb-1">
                    Preview
                  </span>
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex h-11 w-11 items-center justify-center rounded-button text-sm font-medium text-white"
                      style={{
                        backgroundColor: HEX_RE.test(form.brand_color)
                          ? form.brand_color
                          : "#0F766E",
                      }}
                    >
                      {form.brand_initials || "?"}
                    </span>
                    <span className="text-sm text-ink break-words">
                      {form.label || "Platform"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <label className="block">
              <span className="block text-xs uppercase tracking-[0.12em] text-teal-700 mb-1">
                Admin internal note
              </span>
              <textarea
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-line rounded-button bg-white text-ink focus:outline-none focus:ring-2 focus:ring-teal-900"
              />
              <span className="block text-xs text-ink-muted mt-1">
                Internal only — never shown to the user.
              </span>
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => void approve()}
                disabled={submitting !== null}
                className="px-4 py-3 rounded-button bg-teal-900 hover:bg-teal-800 text-sm font-medium text-cream transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting === "approve"
                  ? "Approving…"
                  : "Approve and add platform"}
              </button>
              <div className="rounded-card border border-line bg-white p-3">
                <label className="block">
                  <span className="block text-xs uppercase tracking-[0.12em] text-teal-700 mb-1">
                    User-visible rejection message
                  </span>
                  <textarea
                    value={rejectionMessage}
                    onChange={(event) =>
                      setRejectionMessage(event.target.value)
                    }
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 text-sm border border-line rounded-button bg-white text-ink focus:outline-none focus:ring-2 focus:ring-teal-900"
                    placeholder="We could not verify this service offers a shareable plan."
                  />
                  <span className="block text-xs text-ink-muted mt-1">
                    Shown to the user — keep it clear and respectful.
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => void reject()}
                  disabled={submitting !== null || !rejectionMessage.trim()}
                  className="mt-3 w-full px-4 py-3 rounded-button bg-red-50 border border-red-200 hover:bg-red-100 text-sm font-medium text-red-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting === "reject" ? "Rejecting…" : "Reject request"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 rounded-card border border-line bg-cream-card">
            <p className="text-sm font-medium text-ink">
              This request has already been reviewed.
            </p>
            <p className="text-xs text-ink-muted mt-1">
              Reviewed {fmtDate(detail.reviewed_at)}.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function InfoBlock({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="p-3 rounded-card border border-line bg-cream-card min-w-0">
      <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-1">
        {label}
      </p>
      <p className="text-sm font-medium text-ink break-words">{value}</p>
      {sub ? <p className="text-xs text-ink-muted mt-1">{sub}</p> : null}
    </div>
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
