import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "paper" | "sub" | "surface" | "canvas";

const toneClasses: Record<Tone, string> = {
  paper: "bg-paper text-fg",
  sub: "bg-paper-sub text-fg",
  surface: "bg-surface text-fg",
  canvas: "bg-canvas text-canvas-fg",
};

/**
 * A full-bleed band. Tone changes the surface; the inner container and vertical
 * rhythm stay constant so every band on the site lines up.
 */
export function Section({
  id,
  tone = "paper",
  className,
  innerClassName,
  children,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("relative", toneClasses[tone], className)}
    >
      <div className={cn("container-x py-20 md:py-28", innerClassName)}>
        {children}
      </div>
    </section>
  );
}

/**
 * The small uppercase label above a section headline. Deliberately rationed:
 * the homepage uses three across eight sections, and never two in a row.
 */
export function Kicker({
  children,
  tone = "light",
  className,
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "mb-5 inline-flex items-center gap-2 rounded-full border py-1.5 pl-2.5 pr-3.5 font-mono text-[10px] uppercase tracking-[0.18em]",
        tone === "light"
          ? "border-edge bg-surface text-accent"
          : "border-canvas-edge/15 bg-canvas-edge/[0.06] text-mint",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          tone === "light" ? "bg-accent" : "bg-mint"
        )}
      />
      {children}
    </p>
  );
}

/** Section headline plus optional supporting paragraph, stacked vertically. */
export function SectionHeading({
  kicker,
  title,
  lead,
  align = "start",
  tone = "light",
  className,
}: {
  kicker?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "start" | "center";
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      data-reveal
      className={cn(
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl",
        className
      )}
    >
      {kicker ? <Kicker tone={tone}>{kicker}</Kicker> : null}
      <h2
        className={cn(
          "text-balance font-display text-[32px] font-semibold leading-[1.06] tracking-display sm:text-[38px] md:text-[46px]",
          tone === "light" ? "text-heading" : "text-canvas-fg"
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            "mt-5 text-pretty text-[17px] leading-[1.65]",
            align === "center" && "mx-auto",
            tone === "light" ? "text-fg-muted" : "text-canvas-fg-muted"
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
