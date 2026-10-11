import { Suspense } from "react";
import { ReportsListClient } from "./ReportsListClient";

export const metadata = {
  title: "Reports — Bantle admin",
  robots: { index: false, follow: false },
};

export default function AdminReportsPage() {
  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-5xl mx-auto">
      <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
        Reports
      </p>
      <h1 className="font-serif italic text-3xl md:text-4xl text-teal-900 leading-[1.1] mb-2">
        Reports queue
      </h1>
      <p className="text-sm text-ink-muted mb-8">
        Review user-filed reports. Resolve, dismiss, warn, or ban from this view.
      </p>
      <Suspense
        fallback={<div className="text-ink-muted">Loading reports&hellip;</div>}
      >
        <ReportsListClient />
      </Suspense>
    </div>
  );
}
