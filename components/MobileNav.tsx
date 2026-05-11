"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { NAV_LINKS, LEGAL_LINKS } from "@/lib/constants";
import { ComingSoonBadges } from "@/components/ComingSoonBadges";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-button text-ink hover:bg-cream-card transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetTitle className="mb-6 font-serif italic text-2xl">
          Bantle
        </SheetTitle>
        <nav aria-label="Mobile" className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-[17px] py-3 border-b border-line text-ink hover:text-teal-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.14em] text-ink-muted mb-3">
            Legal
          </p>
          <div className="flex flex-col gap-2">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-ink-muted hover:text-teal-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-auto pt-8">
          <ComingSoonBadges variant="compact" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
