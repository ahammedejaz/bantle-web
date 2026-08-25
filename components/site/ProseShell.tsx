import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Reading shell for every long-form page (policies, guidelines, walk-throughs).
 * A single measure, a single surface, a single rhythm, so the legal pages feel
 * like part of the product rather than a pasted document.
 */
export function ProseShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="bg-paper">
      <div className="container-x py-14 md:py-20">
        <article
          className={cn(
            "prose-bantle mx-auto max-w-[46rem] rounded-panel bg-surface p-6 shadow-soft ring-1 ring-edge sm:p-9 md:p-12",
            className
          )}
        >
          {children}
        </article>
      </div>
    </div>
  );
}
