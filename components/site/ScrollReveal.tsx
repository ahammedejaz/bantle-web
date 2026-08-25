"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// One observer for the whole marketing tree.
//
// Sections stay Server Components: they only add `data-reveal` (and optionally
// `--reveal-delay`) to an element, and this component reveals it once it scrolls
// into view. The hidden state itself lives in globals.css behind both `.js` and
// `prefers-reduced-motion: no-preference`, so no-JS clients, crawlers that do
// not execute scripts, and reduced-motion users all get the final, visible
// layout with no animation at all.

declare global {
  interface Window {
    __bantleReveal?: boolean;
  }
}

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    // Tells the inline failsafe in the root layout that reveal is running.
    window.__bantleReveal = true;

    const targets = document.querySelectorAll<HTMLElement>(
      "[data-reveal]:not(.is-visible)"
    );
    if (targets.length === 0) return;

    if (typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
