"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type UserAction =
  | "ban_temp"
  | "ban_perm"
  | "restore_ban"
  | "restore_self_delete";

interface ActionMeta {
  title: string;
  body: string;
  confirmLabel: string;
  destructive: boolean;
  requiresReason: boolean;
  successMessage: string;
  endpoint: (userId: string) => string;
  buildBody: (reason: string) => Record<string, string>;
}

const ACTION_CONFIG: Record<UserAction, ActionMeta> = {
  ban_temp: {
    title: "Ban this user for 7 days?",
    body: "Sets a 7-day suspension. They'll see a blocked screen in the app until the ban expires. The reason is sent in the moderation push and shown on the banned screen.",
    confirmLabel: "Ban 7 days",
    destructive: true,
    requiresReason: true,
    successMessage: "User suspended for 7 days.",
    endpoint: (id) => `/admin/api/users/${id}/ban`,
    buildBody: (reason) => ({ type: "temp", reason }),
  },
  ban_perm: {
    title: "Permanently ban this user?",
    body: "Sets profiles.permanently_banned = true. The user is gated to the perma-ban screen with no restore path. The decision is intended to be final.",
    confirmLabel: "Permanent ban",
    destructive: true,
    requiresReason: true,
    successMessage: "User permanently banned.",
    endpoint: (id) => `/admin/api/users/${id}/ban`,
    buildBody: (reason) => ({ type: "permanent", reason }),
  },
  restore_ban: {
    title: "Restore from ban?",
    body: "Clears banned_until, banned_reason, banned_by, and permanently_banned. The user can sign back in immediately on next app launch. The reason is recorded only in the admin audit log.",
    confirmLabel: "Restore",
    destructive: false,
    requiresReason: false,
    successMessage: "User restored from ban.",
    endpoint: (id) => `/admin/api/users/${id}/restore`,
    buildBody: (reason) => ({ type: "ban", reason }),
  },
  restore_self_delete: {
    title: "Restore from self-deletion?",
    body: "Clears deleted_at. The user's account is no longer scheduled for hard deletion. Their listings stay in whatever state the self-delete trigger left them.",
    confirmLabel: "Restore",
    destructive: false,
    requiresReason: false,
    successMessage: "User restored from self-deletion.",
    endpoint: (id) => `/admin/api/users/${id}/restore`,
    buildBody: (reason) => ({ type: "self_delete", reason }),
  },
};

interface UserActionModalProps {
  userId: string;
  action: UserAction | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function UserActionModal({
  userId,
  action,
  onClose,
  onSuccess,
  onError,
}: UserActionModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (action) {
      setReason("");
      setSubmitting(false);
    }
  }, [action]);

  const config = action ? ACTION_CONFIG[action] : null;
  const open = Boolean(action);

  const handleSubmit = async () => {
    if (!action || !config) return;
    if (config.requiresReason && !reason.trim()) {
      onError("Reason is required for this action.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(config.endpoint(userId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config.buildBody(reason.trim())),
      });
      if (!response.ok) {
        const data = (await response
          .json()
          .catch(() => ({ error: `HTTP ${response.status}` }))) as {
          error?: string;
        };
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }
      onSuccess(config.successMessage);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Action failed.";
      onError(message);
      setSubmitting(false);
    }
  };

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
            "fixed inset-0 z-[60]",
            "bg-teal-900/40",
            "transition-opacity duration-200",
            "data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
          )}
        />
        <Dialog.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-[70]",
            "translate-x-[-50%] translate-y-[-50%]",
            "w-[calc(100%-2rem)] max-w-md",
            "bg-cream-card border border-line rounded-card",
            "p-6 shadow-xl",
            "transition-opacity duration-150",
            "data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
          )}
        >
          {config ? (
            <>
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-1 pt-1">
                  <Dialog.Title className="font-serif italic text-xl text-teal-900 leading-tight">
                    {config.title}
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-ink-muted mt-2">
                    {config.body}
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

              <div>
                <label
                  htmlFor="user-action-reason"
                  className="block text-sm font-medium text-teal-900 mb-2"
                >
                  Reason{config.requiresReason ? "" : " (optional)"}
                </label>
                <textarea
                  id="user-action-reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={submitting}
                  placeholder={
                    config.requiresReason
                      ? "Required — sent in the push and shown on the banned screen"
                      : "Optional context for the audit log"
                  }
                  className="w-full px-3 py-2 text-sm border border-line rounded-button bg-cream text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-teal-900 disabled:opacity-60"
                />
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
                    "text-sm font-medium",
                    "transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
                    config.destructive
                      ? "bg-red-700 text-cream hover:bg-red-800"
                      : "bg-teal-900 text-cream hover:bg-teal-800",
                  )}
                >
                  {submitting ? "Working…" : config.confirmLabel}
                </button>
              </div>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
