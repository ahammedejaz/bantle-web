import { Suspense } from "react";
import { PlatformsListClient } from "./PlatformsListClient";

export const metadata = {
  title: "Platforms — Bantle admin",
  robots: { index: false, follow: false },
};

export default function AdminPlatformsPage() {
  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-5xl mx-auto">
      <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
        Platforms
      </p>
      <h1 className="font-serif italic text-3xl md:text-4xl text-teal-900 leading-[1.1] mb-2">
        Platforms catalog
      </h1>
      <p className="text-sm text-ink-muted mb-8 max-w-xl">
        The list of services users can list. New platforms appear in the
        mobile picker on each user&apos;s next session. Deactivating a
        platform hides it from the picker; existing listings keep working.
      </p>
      <Suspense
        fallback={<div className="text-ink-muted">Loading&hellip;</div>}
      >
        <PlatformsListClient />
      </Suspense>
    </div>
  );
}
