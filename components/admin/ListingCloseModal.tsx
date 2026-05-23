"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ListingCloseResponse {
  listing: {
    id: string;
    status: string | null;
    closed_reason: string | null;
    closed_by: string | null;
    closed_at: string | null;
  };
  already_closed: boolean;
  notification_summary: {
    recipient_count: number;
    notification_inserted_count: number;
    notification_failed_count: number;
    push_success_count: number;
    push_failure_count: number;
    push_skipped_count: number;
    warnings: string[];
  };
  deal_counts?: {
    pending: number;
    active: number;
  };
}

interface ListingCloseModalProps {
  open: boolean;
  listingId: string;
  listingTitle: string;
  activeDealCount: number;
  pendingDealCount: number;
  onOpenChange: (open: boolean) => void;
  onClosed: (response: ListingCloseResponse) => void;
  onError: (message: string) => void;
}

export function ListingCloseModal({
  open,
  listingId,
  listingTitle,
  activeDealCount,
  pendingDealCount,
  onOpenChange,
  onClosed,
  onError,
}: ListingCloseModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setReason("");
      setSubmitting(false);
    }
  }, [open]);

  const trimmedReason = reason.trim();
  const dealCount = activeDealCount + pendingDealCount;
  const valid = trimmedReason.length >= 3 && trimmedReason.length <= 500;

  const handleSubmit = async () => {
    if (!valid) {
      onError("Reason must be 3-500 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/admin/api/listings/${listingId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: trimmedReason }),
      });

      const data = (await response
        .json()
        .catch(() => ({ error: `HTTP ${response.status}` }))) as
        | ListingCloseResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in data && data.error ? data.error : `HTTP ${response.status}`,
        );
      }

      onClosed(data as ListingCloseResponse);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Close failed.";
      onError(message);
      setSubmitting(false);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!submitting) onOpenChange(nextOpen);
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
            "w-[calc(100%-2rem)] max-w-lg",
            "bg-cream-card border border-line rounded-card",
            "p-6 shadow-xl",
            "transition-opacity duration-150",
            "data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
          )}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-1 pt-1">
              <Dialog.Title className="font-serif italic text-xl text-teal-900 leading-tight">
                Force-close listing?
              </Dialog.Title>
              <Dialog.Description className="text-sm text-ink-muted mt-2">
                This sets the listing status to closed and removes it from
                discovery. Existing deals and chats are not changed.
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

          <div className="rounded-card border border-line bg-cream p-3 mb-4">
            <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-1">
              Listing
            </p>
            <p className="text-sm font-medium text-ink">{listingTitle}</p>
          </div>

          {dealCount > 0 ? (
            <div className="flex gap-2 rounded-card border border-amber-200 bg-amber-50 p-3 mb-4 text-amber-900">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <p className="text-sm">
                This listing has active or pending deals. They will continue
                unchanged.
              </p>
            </div>
          ) : null}

          <div>
            <label
              htmlFor="listing-close-reason"
              className="block text-sm font-medium text-teal-900 mb-2"
            >
              Close reason
            </label>
            <textarea
              id="listing-close-reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              placeholder="Required. This is sent to the host and recorded in the audit log."
              className="w-full px-3 py-2 text-sm border border-line rounded-button bg-cream text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-teal-900 disabled:opacity-60"
            />
            <p className="mt-1 text-xs text-ink-muted">
              {trimmedReason.length}/500 characters
            </p>
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
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
              disabled={submitting || !valid}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-button",
                "text-sm font-medium",
                "bg-red-700 text-cream hover:bg-red-800",
                "transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
              )}
            >
              {submitting ? "Closing..." : "Close listing"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
