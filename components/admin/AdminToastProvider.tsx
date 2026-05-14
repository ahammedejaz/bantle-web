"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AdminToast, type ToastVariant } from "./AdminToast";

interface ToastState {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface AdminToastContextValue {
  show: (message: string, variant: ToastVariant) => void;
}

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const show = useCallback((message: string, variant: ToastVariant) => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  const dismiss = useCallback(() => setToast(null), []);

  return (
    <AdminToastContext.Provider value={{ show }}>
      {children}
      <AdminToast
        message={toast?.message ?? null}
        variant={toast?.variant ?? "success"}
        onDismiss={dismiss}
      />
    </AdminToastContext.Provider>
  );
}

export function useAdminToast() {
  const ctx = useContext(AdminToastContext);
  if (!ctx) {
    throw new Error(
      "useAdminToast must be used within AdminToastProvider",
    );
  }
  return ctx;
}
