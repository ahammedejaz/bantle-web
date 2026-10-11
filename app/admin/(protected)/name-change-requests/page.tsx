import { Suspense } from "react";
import { NameChangeRequestsClient } from "./NameChangeRequestsClient";

export const metadata = {
  title: "Name changes — Bantle admin",
  robots: { index: false, follow: false },
};

export default function AdminNameChangeRequestsPage() {
  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-5xl mx-auto">
      <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
        Trust review
      </p>
      <h1 className="font-serif italic text-3xl md:text-4xl text-teal-900 leading-[1.1] mb-2">
        Name changes
      </h1>
      <p className="text-sm text-ink-muted mb-8">
        Review pending display-name change requests. Approved changes update the
        profile name and require identity re-verification.
      </p>
      <Suspense
        fallback={
          <div className="text-ink-muted">Loading name changes&hellip;</div>
        }
      >
        <NameChangeRequestsClient />
      </Suspense>
    </div>
  );
}
