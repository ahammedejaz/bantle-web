"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogoutConfirmDialog({
  open,
  onOpenChange,
}: LogoutConfirmDialogProps) {
  const [signingOut, setSigningOut] = useState(false);

  const handleConfirm = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/admin/api/logout", { method: "POST" });
      // Hard navigation so middleware re-evaluates with no session
      // and routes us cleanly to /admin/login. router.push wouldn't
      // re-run middleware in the same browser turn.
      window.location.href = "/admin/login";
    } catch (e) {
      console.error("[logout] failed:", e);
      setSigningOut(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
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
            "w-[calc(100%-2rem)] max-w-sm",
            "bg-cream-card border border-line rounded-card",
            "p-6 shadow-xl",
            "transition-opacity duration-150",
            "data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
          )}
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
              <LogOut size={18} className="text-teal-900" />
            </div>
            <div className="flex-1 pt-1">
              <Dialog.Title className="font-serif italic text-xl text-teal-900 leading-tight">
                Sign out?
              </Dialog.Title>
              <Dialog.Description className="text-sm text-ink-muted mt-2">
                You&apos;ll need to sign in again to access the admin panel.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close"
              className="text-ink-muted hover:text-ink transition-colors"
            >
              <X size={18} />
            </Dialog.Close>
          </div>
          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={signingOut}
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
              onClick={handleConfirm}
              disabled={signingOut}
              className={cn(
                "flex-1 px-4 py-2.5 rounded-button",
                "bg-teal-900 text-cream",
                "text-sm font-medium",
                "hover:bg-teal-800 transition-colors",
                "disabled:opacity-60",
              )}
            >
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
