import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  /** Status label. Used by the transactional verify / reset screens. */
  eyebrow?: string;
  /** Current page name, rendered as the trailing breadcrumb. */
  crumb?: string;
  title: string;
  intro?: string;
}

// Every page opens on the same deep-green band, so the header, this block and
// the footer read as one frame around the light body.
export function PageHeader({ eyebrow, crumb, title, intro }: PageHeaderProps) {
  return (
    <section className="grain relative isolate overflow-hidden bg-canvas text-canvas-fg">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-40 h-[28rem] w-[28rem] rounded-full bg-mint/[0.14] blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-mint/25 to-transparent"
      />

      <div className="container-x relative z-10 pb-16 pt-12 md:pb-20 md:pt-16">
        {crumb ? (
          <nav aria-label="Breadcrumb" className="mb-7">
            <ol className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-canvas-fg-muted">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-canvas-fg"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="flex items-center">
                <ChevronRight className="h-3 w-3 opacity-50" strokeWidth={2} />
              </li>
              <li className="text-mint">{crumb}</li>
            </ol>
          </nav>
        ) : null}

        {eyebrow ? (
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-canvas-edge/15 bg-canvas-edge/[0.06] py-1.5 pl-2.5 pr-3.5 font-mono text-[10px] uppercase tracking-[0.18em] text-mint">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-mint" />
            {eyebrow}
          </p>
        ) : null}

        <h1 className="bantle-rise max-w-3xl text-balance font-display text-[36px] font-semibold leading-[1.05] tracking-display text-canvas-fg sm:text-[44px] md:text-[54px]">
          {title}
        </h1>
        {intro ? (
          <p
            className="bantle-rise mt-6 max-w-2xl text-pretty text-[17px] leading-[1.65] text-canvas-fg-muted md:text-[18px]"
            style={{ "--rise-delay": "90ms" } as React.CSSProperties}
          >
            {intro}
          </p>
        ) : null}
      </div>
    </section>
  );
}
