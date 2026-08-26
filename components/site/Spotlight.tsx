"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Pointer-following highlight for a group of raised surfaces.
 *
 * One listener on the group, not one per card. The gradient is written
 * directly onto a dedicated empty layer inside each card rather than onto a
 * CSS custom property on the card itself: changing a variable on an element
 * invalidates style for its whole subtree, and these cards have deep content.
 *
 * Skipped on coarse pointers, where there is no cursor to follow.
 */
export function Spotlight({
  children,
  className,
  radius = 340,
}: {
  children: ReactNode;
  className?: string;
  radius?: number;
}) {
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    if (typeof window.matchMedia !== "function") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let active: HTMLElement | null = null;

    const clear = () => {
      if (!active) return;
      active.style.opacity = "0";
      active = null;
    };

    const onMove = (event: PointerEvent) => {
      const card = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-spotlight-card]"
      );
      if (!card) {
        clear();
        return;
      }

      const layer = card.querySelector<HTMLElement>("[data-spotlight]");
      if (!layer) return;

      if (active && active !== layer) active.style.opacity = "0";
      active = layer;

      const bounds = card.getBoundingClientRect();
      const x = Math.round(event.clientX - bounds.left);
      const y = Math.round(event.clientY - bounds.top);
      layer.style.background = `radial-gradient(${radius}px circle at ${x}px ${y}px, rgb(var(--accent) / 0.14), transparent 70%)`;
      layer.style.opacity = "1";
    };

    group.addEventListener("pointermove", onMove);
    group.addEventListener("pointerleave", clear);

    return () => {
      group.removeEventListener("pointermove", onMove);
      group.removeEventListener("pointerleave", clear);
    };
  }, [radius]);

  return (
    <div ref={groupRef} className={className}>
      {children}
    </div>
  );
}

/** The empty layer the group writes into. Purely decorative. */
export function SpotlightLayer() {
  return (
    <span
      data-spotlight
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 ease-out"
    />
  );
}
