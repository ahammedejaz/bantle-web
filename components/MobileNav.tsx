"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { NAV_LINKS, LEGAL_LINKS } from "@/lib/constants";
import { StoreBadges } from "@/components/StoreBadges";
import { BrandMark } from "@/components/BrandMark";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="press inline-flex h-10 w-10 items-center justify-center rounded-full text-heading transition-colors hover:bg-white/[0.06] md:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col overflow-y-auto">
        <SheetTitle className="mb-8">
          <BrandMark />
        </SheetTitle>

        <nav aria-label="Mobile" className="flex flex-col">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex items-center justify-between border-b border-edge py-3.5 font-display text-[19px] font-medium tracking-tight transition-colors",
                  isActive ? "text-accent" : "text-heading"
                )}
              >
                {link.label}
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-fg-muted/60 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                  strokeWidth={1.75}
                />
              </Link>
            );
          })}
        </nav>

        <div className="mt-8">
          <p className="mb-3 text-[12.5px] font-medium text-fg-muted">
            Legal
          </p>
          <div className="flex flex-col gap-2.5">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-[14px] text-fg-muted transition-colors hover:text-heading"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-10">
          <StoreBadges size="sm" className="sm:flex-col" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
