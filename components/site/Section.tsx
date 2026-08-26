import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "canvas" | "raised";

const toneClasses: Record<Tone, string> = {
  canvas: "bg-canvas",
  raised: "bg-canvas-2",
};

/**
 * A full-bleed band. On a near-black page the bands are separated by elevation
 * and light rather than by colour, so the tone only shifts the ground a step.
 */
export function Section({
  id,
  tone = "canvas",
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
    <section id={id} className={cn("relative", toneClasses[tone], className)}>
      <div className={cn("container-x py-20 md:py-28", innerClassName)}>
        {children}
      </div>
    </section>
  );
}

/**
 * Section headline plus optional supporting paragraph, stacked.
 *
 * There is no kicker prop, and there should not be one. A small tracked-out
 * label above every heading is the single most recognisable generated-page
 * tell; the headline carries its own weight.
 */
export function SectionHeading({
  title,
  lead,
  align = "start",
  className,
}: {
  title: ReactNode;
  lead?: ReactNode;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl",
        className
      )}
    >
      <h2 className="text-balance font-display text-[32px] font-semibold leading-[1.05] tracking-display text-heading sm:text-[38px] md:text-[46px]">
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            "mt-5 max-w-[62ch] text-pretty text-[17px] leading-[1.65] text-fg-muted",
            align === "center" && "mx-auto"
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
