import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Reading shell for every long-form page. One measure, one surface, one
 * rhythm, so the policies feel like part of the product rather than a pasted
 * document. The measure sits at roughly 70ch, which is where long-form reading
 * is comfortable.
 */
export function ProseShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="bg-canvas">
      <div className="container-x py-14 md:py-20">
        <article
          className={cn(
            "panel prose-bantle mx-auto max-w-[46rem] p-6 sm:p-9 md:p-12",
            className
          )}
        >
          {children}
        </article>
      </div>
    </div>
  );
}
