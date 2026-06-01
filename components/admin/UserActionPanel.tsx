"use client";

import { useState } from "react";
import { useAdminToast } from "./AdminToastProvider";
import { UserActionModal, type UserAction } from "./UserActionModal";
import { getUserStatus } from "./userStatus";
import { cn } from "@/lib/utils";

type VerificationOverride = "verified" | "unverified" | null;
type VerificationAction =
  | "manual_verify"
  | "manual_unverify"
  | "clear_override";

interface UserActionPanelProps {
  user: {
    id: string;
    is_admin: boolean;
    is_verified: boolean | null;
    rating_avg: number | null;
    rating_count: number | null;
    verification_override: VerificationOverride;
    verified_manually_at: string | null;
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
  const [verificationAction, setVerificationAction] =
    useState<VerificationAction | null>(null);
  const status = getUserStatus(user);
  const verificationStatus = getVerificationStatus(user);
  const ratingText =
    user.rating_count && user.rating_count > 0
      ? `${(user.rating_avg ?? 0).toFixed(1)} from ${user.rating_count} rating${
          user.rating_count === 1 ? "" : "s"
        }`
      : "No ratings yet";

  const handleSuccess = (message: string) => {
    toast.show(message, "success");
    setActiveAction(null);
    onActionComplete();
  };
  const handleError = (message: string) => {
    toast.show(message, "error");
  };

  const handleVerificationAction = async (action: VerificationAction) => {
    if (verificationAction || user.is_admin) return;
    setVerificationAction(action);
    try {
      const response = await fetch(`/admin/api/users/${user.id}/verification`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) {
        const data = (await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}` }))) as {
          error?: string;
        };
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }
      toast.show(verificationSuccessMessage(action), "success");
      onActionComplete();
    } catch (e) {
      toast.show(
        e instanceof Error ? e.message : "Verification update failed.",
        "error",
      );
    } finally {
      setVerificationAction(null);
    }
  };

  return (
    <>
      <section className="mt-6 pt-6 border-t border-line">
        <h2 className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-3">
          Verification
        </h2>
        <div className="px-4 py-3 rounded-card border border-line bg-cream-card">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-medium text-ink">
                {verificationStatus.label}
              </p>
              <p className="text-xs text-ink-muted mt-1">
                {verificationStatus.detail}
              </p>
              <p className="text-xs text-ink-muted mt-1">
                Current rating: {ratingText}
              </p>
              {user.verified_manually_at ? (
                <p className="text-xs text-ink-muted mt-1">
                  Last manual change: {formatDate(user.verified_manually_at)}
                </p>
              ) : null}
            </div>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-button border",
                verificationStatus.className,
              )}
            >
              {verificationStatus.badge}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <button
              type="button"
              onClick={() => void handleVerificationAction("manual_verify")}
              disabled={
                user.is_admin ||
                verificationAction !== null ||
                user.verification_override === "verified"
              }
              className="px-4 py-3 rounded-button bg-teal-900 hover:bg-teal-800 text-sm font-medium text-cream transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verificationAction === "manual_verify"
                ? "Working…"
                : "Verify user"}
            </button>
            <button
              type="button"
              onClick={() => void handleVerificationAction("manual_unverify")}
              disabled={
                user.is_admin ||
                verificationAction !== null ||
                user.verification_override === "unverified"
              }
              className="px-4 py-3 rounded-button bg-amber-50 border border-amber-200 hover:bg-amber-100 text-sm font-medium text-amber-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verificationAction === "manual_unverify"
                ? "Working…"
                : "Unverify user"}
            </button>
            <button
              type="button"
              onClick={() => void handleVerificationAction("clear_override")}
              disabled={
                user.is_admin ||
                verificationAction !== null ||
                user.verification_override === null
              }
              className="px-4 py-3 rounded-button border border-line bg-white hover:bg-cream text-sm font-medium text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verificationAction === "clear_override"
                ? "Working…"
                : "Use rating rules"}
            </button>
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

function getVerificationStatus(user: {
  is_verified: boolean | null;
  verification_override: VerificationOverride;
}) {
  if (user.verification_override === "verified") {
    return {
      label: "Manually verified",
      detail: "Admin override keeps the trust badge on regardless of rating count.",
      badge: "Manual",
      className: "bg-teal-50 text-teal-900 border-teal-200",
    };
  }
  if (user.verification_override === "unverified") {
    return {
      label: "Manually unverified",
      detail:
        "Admin override keeps the trust badge off regardless of rating count.",
      badge: "Manual",
      className: "bg-amber-50 text-amber-900 border-amber-200",
    };
  }
  if (user.is_verified) {
    return {
      label: "Auto verified by ratings",
      detail: "No manual override is set; current ratings meet the threshold.",
      badge: "Auto",
      className: "bg-teal-50 text-teal-900 border-teal-200",
    };
  }
  return {
    label: "Not verified",
    detail: "No manual override is set and current ratings do not meet the threshold.",
    badge: "Rules",
    className: "bg-gray-50 text-gray-700 border-gray-200",
  };
}

function verificationSuccessMessage(action: VerificationAction): string {
  if (action === "manual_verify") return "User manually verified.";
  if (action === "manual_unverify") return "User manually unverified.";
  return "Manual override cleared; rating rules now apply.";
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
