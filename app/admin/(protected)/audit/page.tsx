import { Suspense } from "react";
import { AuditClient } from "./AuditClient";

export const metadata = {
  title: "Audit log — Bantle admin",
  robots: { index: false, follow: false },
};

export default function AdminAuditPage() {
  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-5xl mx-auto">
      <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
        Audit
      </p>
      <h1 className="font-serif italic text-3xl md:text-4xl text-teal-900 leading-[1.1] mb-2">
        Audit log
      </h1>
      <p className="text-sm text-ink-muted mb-8 max-w-2xl">
        Review read-only admin actions across reports, users, platforms,
        listings, and deals.
      </p>
      <Suspense
        fallback={<div className="text-ink-muted">Loading audit log&hellip;</div>}
      >
        <AuditClient />
      </Suspense>
    </div>
  );
}
