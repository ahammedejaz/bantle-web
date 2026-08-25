import { Suspense } from "react";
import { PlatformRequestsClient } from "./PlatformRequestsClient";

export const metadata = {
  title: "Platform requests — Bantle admin",
  robots: { index: false, follow: false },
};

export default function AdminPlatformRequestsPage() {
  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-5xl mx-auto">
      <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
        Catalogue review
      </p>
      <h1 className="font-serif italic text-3xl md:text-4xl text-teal-900 leading-[1.1] mb-2">
        Platform requests
      </h1>
      <p className="text-sm text-ink-muted mb-8">
        Members ask for platforms missing from the catalogue while posting a
        listing. Approving one creates or reactivates the platform and notifies
        everyone waiting on that name.
      </p>
      <Suspense
        fallback={
          <div className="text-ink-muted">Loading platform requests&hellip;</div>
        }
      >
        <PlatformRequestsClient />
      </Suspense>
    </div>
  );
}
