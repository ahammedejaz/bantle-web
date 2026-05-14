"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { AdminNav } from "./AdminNav";

interface AdminMobileHeaderProps {
  adminName: string;
  adminEmail: string;
}

export function AdminMobileHeader({
  adminName,
  adminEmail,
}: AdminMobileHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="md:hidden sticky top-0 z-30 bg-cream-card border-b border-line">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-xs uppercase tracking-[0.14em] text-teal-600 font-medium">
          Bantle admin
        </p>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              aria-label="Open admin menu"
              className={cn(
                "w-9 h-9 flex items-center justify-center",
                "rounded-button border border-line bg-white",
                "text-ink hover:bg-cream transition-colors",
              )}
            >
              <Menu size={18} />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay
              className={cn(
                "fixed inset-0 z-40",
                "bg-teal-900/40",
                "transition-opacity duration-200",
                "data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
              )}
            />
            <Dialog.Content
              className={cn(
                "fixed top-0 left-0 z-50",
                "h-full w-72 max-w-[85vw]",
                "bg-cream-card shadow-xl",
                "transition-transform duration-300 ease-out",
                "data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0",
              )}
              aria-describedby={undefined}
            >
              <Dialog.Title className="sr-only">Admin navigation</Dialog.Title>
              <AdminNav
                adminName={adminName}
                adminEmail={adminEmail}
                onItemClick={() => setOpen(false)}
              />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
}
