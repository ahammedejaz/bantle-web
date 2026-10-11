import { Suspense } from "react";
import { DealsClient } from "./DealsClient";

export const metadata = {
  title: "Deals — Bantle admin",
  robots: { index: false, follow: false },
};

export default function AdminDealsPage() {
  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-5xl mx-auto">
      <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
        Deals
      </p>
      <h1 className="font-serif italic text-3xl md:text-4xl text-teal-900 leading-[1.1] mb-2">
        Deals management
      </h1>
      <p className="text-sm text-ink-muted mb-8 max-w-2xl">
        Search deals by participant, listing, platform, or UUID. Force-terminate
        pending or active deals without changing listings, ratings, or unrelated
        deals.
      </p>
      <Suspense
        fallback={<div className="text-ink-muted">Loading deals&hellip;</div>}
      >
        <DealsClient />
      </Suspense>
    </div>
  );
}
