"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useAdminToast } from "@/components/admin/AdminToastProvider";
import { cn } from "@/lib/utils";

type ReviewStatus = "pending" | "approved" | "rejected" | "cancelled";

interface IdentityVerificationDetail {
  id: string;
  user_id: string;
  status: ReviewStatus;
  instruction_code: string | null;
  instruction_code_expires_at: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  user_visible_rejection_message: string | null;
  admin_internal_note: string | null;
  image_retention_until: string | null;
  image_deleted_at: string | null;
  created_at: string;
  updated_at: string;
  signed_url: string | null;
  signed_url_expires_in_seconds: number | null;
  image_unavailable_reason: string | null;
  signed_url_ttl_seconds: number;
  user: {
    id: string;
    display_name: string | null;
    rating_avg: number | null;
    rating_count: number | null;
    identity_verification_status: string;
    is_verified: boolean | null;
    created_at: string | null;
  } | null;
  reviewer: {
    id: string;
    display_name: string | null;
  } | null;
}

export function IdentityVerificationDetailClient({
  verificationId,
}: {
  verificationId: string;
}) {
  const router = useRouter();
  const toast = useAdminToast();
  const [verification, setVerification] =
    useState<IdentityVerificationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [submitting, setSubmitting] = useState<"approve" | "reject" | null>(
    null,
  );

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/admin/api/identity-verifications/${verificationId}`,
      );
      if (!response.ok) {
        const data = (await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}` }))) as {
          error?: string;
        };
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }
      const data = (await response.json()) as {
        verification: IdentityVerificationDetail;
      };
      setVerification(data.verification);
      setAdminNote(data.verification.admin_internal_note ?? "");
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Identity request could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [verificationId]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  const approve = async () => {
    if (submitting) return;
    setSubmitting("approve");
    try {
      await postReviewAction("approve", {
        admin_internal_note: adminNote,
      });
      toast.show("Identity verification approved.", "success");
      router.push("/admin/identity-verifications");
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
      toast.show("Identity verification rejected.", "success");
      router.push("/admin/identity-verifications");
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
  ) => {
    const response = await fetch(
      `/admin/api/identity-verifications/${verificationId}/${action}`,
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
  };

  if (loading && !verification) {
    return <div className="text-ink-muted">Loading identity request&hellip;</div>;
  }
  if (error || !verification) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-card p-4 text-red-900 text-sm">
        {error ?? "Identity request not found."}
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(verification.status);
  const pending = verification.status === "pending";

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
          #{verification.id.slice(0, 8)}
        </span>
        <span className="text-xs text-ink-muted">
          Submitted {fmtDate(verification.submitted_at)}
        </span>
      </div>

      <h1 className="font-serif italic text-3xl md:text-4xl text-teal-900 leading-[1.1]">
        {verification.user?.display_name ?? "Unknown user"}
      </h1>
      <p className="text-sm text-ink-muted mt-2">
        Identity status:{" "}
        {humanize(verification.user?.identity_verification_status)}
        {verification.user?.is_verified ? " · public badge on" : ""}
      </p>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <InfoBlock
          label="Rating"
          value={
            verification.user?.rating_count
              ? `${(verification.user.rating_avg ?? 0).toFixed(1)} from ${
                  verification.user.rating_count
                }`
              : "No ratings"
          }
        />
        <InfoBlock
          label="Instruction code"
          value={verification.instruction_code ?? "—"}
        />
        <InfoBlock
          label="Reviewed"
          value={verification.reviewed_at ? fmtDate(verification.reviewed_at) : "—"}
          sub={verification.reviewer?.display_name ?? undefined}
        />
      </section>

      <section className="mt-6 bg-cream-card border border-line rounded-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-teal-600">
              Selfie image
            </p>
            <p className="text-xs text-ink-muted mt-1">
              Signed image link expires after{" "}
              {verification.signed_url_expires_in_seconds ??
                verification.signed_url_ttl_seconds}{" "}
              seconds. Refresh to renew.
            </p>
            <p className="text-xs text-ink-muted mt-1">
              Private verification asset — review here only. Do not download,
              screenshot, or share it. Selfies are never shown on public
              profiles.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchDetail()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-button border border-line bg-white text-sm text-ink hover:bg-cream transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {verification.signed_url ? (
          <a
            href={verification.signed_url}
            target="_blank"
            rel="noreferrer"
            className="block max-w-md bg-cream rounded-card overflow-hidden border border-line"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={verification.signed_url}
              alt="Identity verification selfie"
              className="w-full max-h-[560px] object-contain bg-black"
            />
          </a>
        ) : (
          <div className="max-w-md min-h-64 bg-cream border border-line rounded-card flex items-center justify-center p-6 text-center">
            <p className="text-sm text-ink-muted">
              Image unavailable
              {verification.image_unavailable_reason
                ? ` (${humanize(verification.image_unavailable_reason)})`
                : ""}
              . Refresh the page to retry.
            </p>
          </div>
        )}
      </section>

      {verification.user_visible_rejection_message ? (
        <section className="mt-6 bg-red-50 border border-red-200 rounded-card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-red-900 mb-2">
            User-visible rejection message
          </p>
          <p className="text-sm text-red-900">
            {verification.user_visible_rejection_message}
          </p>
        </section>
      ) : null}

      <section className="mt-8 pt-8 border-t border-line">
        <h2 className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-3">
          Review action
        </h2>
        {pending ? (
          <div className="space-y-4">
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
                {submitting === "approve" ? "Approving…" : "Approve identity"}
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
                    className="w-full px-3 py-2 text-sm border border-line rounded-button bg-white text-ink focus:outline-none focus:ring-2 focus:ring-teal-900"
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
                  {submitting === "reject" ? "Rejecting…" : "Reject identity"}
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
              Reviewed {fmtDate(verification.reviewed_at)}.
              {verification.image_retention_until
                ? ` Image retention until ${fmtDate(
                    verification.image_retention_until,
                  )}.`
                : ""}
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

function getStatusDisplay(status: ReviewStatus) {
  if (status === "approved") {
    return {
      label: "Approved",
      className: "bg-teal-50 text-teal-900 border-teal-200",
    };
  }
  if (status === "rejected") {
    return {
      label: "Rejected",
      className: "bg-red-50 text-red-900 border-red-200",
    };
  }
  if (status === "cancelled") {
    return {
      label: "Cancelled",
      className: "bg-gray-50 text-gray-700 border-gray-200",
    };
  }
  return {
    label: "Pending",
    className: "bg-amber-50 text-amber-900 border-amber-200",
  };
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function humanize(value: string | null | undefined): string {
  if (!value) return "unknown";
  return value.replace(/_/g, " ");
}
