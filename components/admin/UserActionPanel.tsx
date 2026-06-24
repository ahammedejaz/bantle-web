"use client";

import { useState } from "react";
import { useAdminToast } from "./AdminToastProvider";
import { UserActionModal, type UserAction } from "./UserActionModal";
import { getUserStatus } from "./userStatus";
import { cn } from "@/lib/utils";
import {
  isManualVerificationActive,
  type ManualVerificationStatus,
} from "@/lib/manual-verification";

type ManualVerificationAction = "manual_approve" | "manual_revoke";
type ManualVerificationCategory =
  | "individual_exception"
  | "company"
  | "vendor"
  | "partner"
  | "other";
const MANUAL_CATEGORIES: readonly {
  value: ManualVerificationCategory;
  label: string;
}[] = [
  { value: "individual_exception", label: "Individual exception" },
  { value: "company", label: "Company" },
  { value: "vendor", label: "Vendor" },
  { value: "partner", label: "Partner" },
  { value: "other", label: "Other" },
];

interface UserActionPanelProps {
  user: {
    id: string;
    is_admin: boolean;
    is_verified: boolean | null;
    identity_verification_status: string;
    manual_verification_status: ManualVerificationStatus;
    manual_verification_category: ManualVerificationCategory | null;
    manual_verified_at: string | null;
    manual_verification_revoked_at: string | null;
    manual_verification_expires_at: string | null;
    banned_until: string | null;
    permanently_banned: boolean;
    deleted_at: string | null;
  };
  onActionComplete: () => void;
}

export function UserActionPanel({
  user,
  onActionComplete,
}: UserActionPanelProps) {
  const toast = useAdminToast();
  const [activeAction, setActiveAction] = useState<UserAction | null>(null);
  const [manualAction, setManualAction] =
    useState<ManualVerificationAction | null>(null);
  const [approveCategory, setApproveCategory] =
    useState<ManualVerificationCategory>("individual_exception");
  const [approveReason, setApproveReason] = useState("");
  const [approveNote, setApproveNote] = useState("");
  const [revokeReason, setRevokeReason] = useState("");
  const [revokeNote, setRevokeNote] = useState("");
  const status = getUserStatus(user);
  const manualReview = getManualReviewStatus(user);
  const manualApprovalActive = isManualVerificationActive(user);
  const canRevokeManualReview = manualApprovalActive;

  const handleSuccess = (message: string) => {
    toast.show(message, "success");
    setActiveAction(null);
    onActionComplete();
  };
  const handleError = (message: string) => {
    toast.show(message, "error");
  };

  const handleManualReviewAction = async (
    action: ManualVerificationAction,
  ) => {
    if (manualAction || user.is_admin) return;
    if (action === "manual_approve" && manualApprovalActive) {
      toast.show("Manual approval is already active.", "error");
      return;
    }
    if (action === "manual_revoke" && !manualApprovalActive) {
      toast.show("No active manual approval exists to revoke.", "error");
      return;
    }
    const reason =
      action === "manual_approve" ? approveReason.trim() : revokeReason.trim();
    if (!reason) {
      toast.show("Reason is required.", "error");
      return;
    }

    setManualAction(action);
    try {
      const response = await fetch(`/admin/api/users/${user.id}/verification`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          action === "manual_approve"
            ? {
                action,
                category: approveCategory,
                reason,
                internal_note: approveNote,
              }
            : {
                action,
                reason,
                internal_note: revokeNote,
              },
        ),
      });
      if (!response.ok) {
        const data = (await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}` }))) as {
          error?: string;
        };
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }
      toast.show(manualReviewSuccessMessage(action), "success");
      if (action === "manual_approve") {
        setApproveReason("");
        setApproveNote("");
      } else {
        setRevokeReason("");
        setRevokeNote("");
      }
      onActionComplete();
    } catch (e) {
      toast.show(
        e instanceof Error ? e.message : "Manual review update failed.",
        "error",
      );
    } finally {
      setManualAction(null);
    }
  };

  return (
    <>
      <section className="mt-6 pt-6 border-t border-line">
        <h2 className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-3">
          Verification review
        </h2>
        <div className="px-4 py-3 rounded-card border border-line bg-cream-card">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-medium text-ink">
                Public badge: {user.is_verified ? "On" : "Off"}
              </p>
              <p className="text-xs text-ink-muted mt-1">
                Selfie verification:{" "}
                {humanizeIdentityStatus(user.identity_verification_status)}
              </p>
              <p className="text-xs text-ink-muted mt-1">
                Manual review: {manualReview.label}
              </p>
              {manualReview.detail ? (
                <p className="text-xs text-ink-muted mt-1">
                  {manualReview.detail}
                </p>
              ) : null}
            </div>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-button border",
                user.is_verified
                  ? "bg-teal-50 text-teal-900 border-teal-200"
                  : "bg-gray-50 text-gray-700 border-gray-200",
              )}
            >
              Public badge {user.is_verified ? "on" : "off"}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.14em] text-teal-600">
                Approve manual review
              </p>
              <label className="block">
                <span className="text-xs text-ink-muted">Category</span>
                <select
                  value={approveCategory}
                  onChange={(event) =>
                    setApproveCategory(
                      event.target.value as ManualVerificationCategory,
                    )
                  }
                  disabled={
                    user.is_admin ||
                    manualAction !== null ||
                    manualApprovalActive
                  }
                  className="mt-1 w-full rounded-button border border-line bg-cream px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-900 disabled:opacity-50"
                >
                  {MANUAL_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-ink-muted">Reason</span>
                <textarea
                  value={approveReason}
                  onChange={(event) => setApproveReason(event.target.value)}
                  maxLength={1000}
                  rows={3}
                  disabled={
                    user.is_admin ||
                    manualAction !== null ||
                    manualApprovalActive
                  }
                  className="mt-1 w-full rounded-button border border-line bg-cream px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-900 disabled:opacity-50"
                />
              </label>
              <label className="block">
                <span className="text-xs text-ink-muted">
                  Internal note optional
                </span>
                <textarea
                  value={approveNote}
                  onChange={(event) => setApproveNote(event.target.value)}
                  maxLength={2000}
                  rows={2}
                  disabled={
                    user.is_admin ||
                    manualAction !== null ||
                    manualApprovalActive
                  }
                  className="mt-1 w-full rounded-button border border-line bg-cream px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-900 disabled:opacity-50"
                />
              </label>
              <button
                type="button"
                onClick={() => void handleManualReviewAction("manual_approve")}
                disabled={
                  user.is_admin ||
                  manualAction !== null ||
                  manualApprovalActive ||
                  approveReason.trim().length === 0
                }
                className="w-full px-4 py-3 rounded-button bg-teal-900 hover:bg-teal-800 text-sm font-medium text-cream transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {manualAction === "manual_approve"
                  ? "Working..."
                  : "Approve manual review"}
              </button>
              {manualApprovalActive ? (
                <p className="text-xs text-ink-muted">
                  Manual approval is active. Revoke it before approving again.
                </p>
              ) : null}
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.14em] text-teal-600">
                Revoke manual review
              </p>
              <label className="block">
                <span className="text-xs text-ink-muted">Reason</span>
                <textarea
                  value={revokeReason}
                  onChange={(event) => setRevokeReason(event.target.value)}
                  maxLength={1000}
                  rows={3}
                  disabled={
                    user.is_admin ||
                    manualAction !== null ||
                    !canRevokeManualReview
                  }
                  className="mt-1 w-full rounded-button border border-line bg-cream px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-900 disabled:opacity-50"
                />
              </label>
              <label className="block">
                <span className="text-xs text-ink-muted">
                  Internal note optional
                </span>
                <textarea
                  value={revokeNote}
                  onChange={(event) => setRevokeNote(event.target.value)}
                  maxLength={2000}
                  rows={2}
                  disabled={
                    user.is_admin ||
                    manualAction !== null ||
                    !canRevokeManualReview
                  }
                  className="mt-1 w-full rounded-button border border-line bg-cream px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-900 disabled:opacity-50"
                />
              </label>
              <button
                type="button"
                onClick={() => void handleManualReviewAction("manual_revoke")}
                disabled={
                  user.is_admin ||
                  manualAction !== null ||
                  !canRevokeManualReview ||
                  revokeReason.trim().length === 0
                }
                className="w-full px-4 py-3 rounded-button bg-amber-50 border border-amber-200 hover:bg-amber-100 text-sm font-medium text-amber-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {manualAction === "manual_revoke"
                  ? "Working..."
                  : "Revoke manual review"}
              </button>
              {!canRevokeManualReview ? (
                <p className="text-xs text-ink-muted">
                  No active manual approval to revoke.
                </p>
              ) : null}
            </div>
          </div>

          {user.is_admin ? (
            <p className="text-xs text-ink-muted mt-3">
              Admin accounts are exempt from manual verification actions.
            </p>
          ) : null}
        </div>
      </section>

      <section className="mt-6 pt-6 border-t border-line">
        <h2 className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-3">
          Actions
        </h2>

        {user.is_admin ? (
          <div className="px-4 py-3 rounded-card border border-line bg-cream-card">
            <p className="text-sm text-ink">Cannot action other admins.</p>
            <p className="text-xs text-ink-muted mt-1">
              Admin accounts are exempt from ban / restore actions to prevent
              self-ban or cross-admin moderation.
            </p>
          </div>
        ) : null}

        {!user.is_admin && status === "active" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setActiveAction("ban_temp")}
              className="px-4 py-3 rounded-button bg-amber-50 border border-amber-200 hover:bg-amber-100 text-sm font-medium text-amber-900 transition-colors"
            >
              Ban 7 days
            </button>
            <button
              type="button"
              onClick={() => setActiveAction("ban_perm")}
              className={cn(
                "px-4 py-3 rounded-button",
                "bg-red-900 hover:bg-red-800 text-sm font-medium text-cream transition-colors",
              )}
            >
              Ban permanently
            </button>
          </div>
        ) : null}

        {!user.is_admin && (status === "temp_banned" || status === "perm_banned") ? (
          <div>
            <button
              type="button"
              onClick={() => setActiveAction("restore_ban")}
              className="px-4 py-3 rounded-button bg-teal-50 border border-teal-200 hover:bg-teal-100 text-sm font-medium text-teal-900 transition-colors"
            >
              Restore from ban
            </button>
            <p className="text-xs text-ink-muted mt-3">
              {status === "perm_banned"
                ? "Clears permanently_banned. User can sign back in on next app launch."
                : "Clears banned_until and related fields. User can sign back in on next app launch."}
            </p>
          </div>
        ) : null}

        {!user.is_admin && status === "self_deleted" ? (
          <div>
            <button
              type="button"
              onClick={() => setActiveAction("restore_self_delete")}
              className="px-4 py-3 rounded-button bg-teal-50 border border-teal-200 hover:bg-teal-100 text-sm font-medium text-teal-900 transition-colors"
            >
              Restore from self-deletion
            </button>
            <p className="text-xs text-ink-muted mt-3">
              Clears deleted_at. The user&apos;s account is no longer scheduled for hard deletion.
            </p>
          </div>
        ) : null}
      </section>

      <UserActionModal
        userId={user.id}
        action={activeAction}
        onClose={() => setActiveAction(null)}
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </>
  );
}

function getManualReviewStatus(user: {
  manual_verification_status: ManualVerificationStatus;
  manual_verification_category: ManualVerificationCategory | null;
  manual_verified_at: string | null;
  manual_verification_revoked_at: string | null;
  manual_verification_expires_at: string | null;
}) {
  const manualApprovalActive = isManualVerificationActive(user);
  if (user.manual_verification_status === "approved" && manualApprovalActive) {
    const category = user.manual_verification_category
      ? manualCategoryLabel(user.manual_verification_category)
      : "Uncategorized";
    const approvedAt = user.manual_verified_at
      ? `Approved ${formatDate(user.manual_verified_at)}`
      : null;
    const expiresAt = user.manual_verification_expires_at
      ? `Expires ${formatDate(user.manual_verification_expires_at)}`
      : null;
    return {
      label: `Approved (${category})`,
      detail: [approvedAt, expiresAt].filter(Boolean).join(" · "),
    };
  }
  if (user.manual_verification_status === "approved") {
    return {
      label: "Expired (inactive)",
      detail: user.manual_verification_expires_at
        ? `Expired ${formatDate(user.manual_verification_expires_at)}`
        : null,
    };
  }
  if (user.manual_verification_status === "revoked") {
    return {
      label: "Revoked",
      detail: user.manual_verification_revoked_at
        ? `Revoked ${formatDate(user.manual_verification_revoked_at)}`
        : null,
    };
  }
  if (user.manual_verification_status === "expired") {
    return {
      label: "Expired",
      detail: user.manual_verification_expires_at
        ? `Expired ${formatDate(user.manual_verification_expires_at)}`
        : null,
    };
  }
  return { label: "None", detail: null };
}

function manualReviewSuccessMessage(action: ManualVerificationAction): string {
  if (action === "manual_approve") return "Manual review approved.";
  return "Manual review revoked.";
}

function humanizeIdentityStatus(status: string): string {
  switch (status) {
    case "approved":
      return "Approved";
    case "pending":
      return "Pending";
    case "rejected":
      return "Rejected";
    case "reverification_required":
      return "Reverification required";
    case "unverified":
      return "Unverified";
    default:
      return status
        .split("_")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
  }
}

function manualCategoryLabel(category: ManualVerificationCategory): string {
  return (
    MANUAL_CATEGORIES.find((item) => item.value === category)?.label ??
    category
  );
}

function formatDate(iso: string): string {
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
