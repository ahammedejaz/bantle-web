import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "canvas" | "raised";
type Light = "left" | "right";

const toneClasses: Record<Tone, string> = {
  canvas: "bg-canvas",
  raised: "bg-canvas-2",
};

// Where a band's light sits. Always off-canvas and always enormous, so what
// lands inside the band is the falloff rather than a visible disc.
const lightClasses: Record<Light, string> = {
  left: "-left-[30rem] top-[-6rem] h-[46rem] w-[46rem] opacity-[0.32]",
  right: "-right-[30rem] bottom-[-10rem] h-[46rem] w-[46rem] opacity-[0.32]",
};

/**
 * A full-bleed band. On a near-black page the bands are separated by elevation
 * and light rather than by colour, so the tone only shifts the ground a step.
 *
 * `light` adds a single soft source at one edge. It exists because a band of
 * flat near-black behind a short column of text reads as unfinished rather
 * than as spacious: the falloff gives the empty half of an asymmetric layout
 * something to be.
 */
export function Section({
  id,
  tone = "canvas",
  light,
  className,
  innerClassName,
  children,
}: {
  id?: string;
  tone?: Tone;
  light?: Light;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative",
        light && "grain isolate overflow-hidden",
        toneClasses[tone],
        className
      )}
    >
      {light ? (
        <div
          aria-hidden="true"
          className={cn("glow pointer-events-none absolute", lightClasses[light])}
          style={{ "--glow-blur": "140px" } as React.CSSProperties}
        />
      ) : null}
      <div className={cn("container-x relative z-10 py-20 md:py-28", innerClassName)}>
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
