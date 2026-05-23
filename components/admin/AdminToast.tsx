"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "warning";

interface AdminToastProps {
  message: string | null;
  variant: ToastVariant;
  onDismiss: () => void;
}

export function AdminToast({ message, variant, onDismiss }: AdminToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const dwell = variant === "success" ? 2500 : 4000;
    const timer = setTimeout(() => {
      setVisible(false);
      // Allow exit animation before clearing parent state.
      setTimeout(onDismiss, 200);
    }, dwell);
    return () => clearTimeout(timer);
  }, [message, variant, onDismiss]);

  if (!message) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "transition-all duration-200 ease-out",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0",
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-button shadow-lg",
          "border max-w-md",
          variant === "success"
            ? "bg-teal-50 border-teal-200 text-teal-900"
            : variant === "warning"
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-red-50 border-red-200 text-red-900",
        )}
      >
        {variant === "success" ? (
          <CheckCircle size={18} className="shrink-0" />
        ) : variant === "warning" ? (
          <AlertTriangle size={18} className="shrink-0" />
        ) : (
          <XCircle size={18} className="shrink-0" />
        )}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}
