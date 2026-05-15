"use client";

import { useState } from "react";
import { useAdminToast } from "./AdminToastProvider";
import { UserActionModal, type UserAction } from "./UserActionModal";
import { getUserStatus } from "./userStatus";
import { cn } from "@/lib/utils";

interface UserActionPanelProps {
  user: {
    id: string;
    is_admin: boolean;
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
  const status = getUserStatus(user);

  const handleSuccess = (message: string) => {
    toast.show(message, "success");
    setActiveAction(null);
    onActionComplete();
  };
  const handleError = (message: string) => {
    toast.show(message, "error");
  };

  // Admin targets — show notice, no buttons. This covers both
  // self-action (the only current admin viewing themselves) and the
  // future case of one admin viewing another admin.
  if (user.is_admin) {
    return (
      <section className="mt-6 pt-6 border-t border-line">
        <h2 className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-3">
          Actions
        </h2>
        <div className="px-4 py-3 rounded-card border border-line bg-cream-card">
          <p className="text-sm text-ink">Cannot action other admins.</p>
          <p className="text-xs text-ink-muted mt-1">
            Admin accounts are exempt from ban / restore actions to prevent
            self-ban or cross-admin moderation.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="mt-6 pt-6 border-t border-line">
        <h2 className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-3">
          Actions
        </h2>

        {status === "active" ? (
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

        {status === "temp_banned" || status === "perm_banned" ? (
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

        {status === "self_deleted" ? (
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
