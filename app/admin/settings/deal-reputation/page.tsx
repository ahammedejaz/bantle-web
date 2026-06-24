import { Suspense } from "react";
import { DealReputationSettingsClient } from "./DealReputationSettingsClient";

export const metadata = {
  title: "Deal reputation settings - Bantle admin",
  robots: { index: false, follow: false },
};

export default function DealReputationSettingsPage() {
  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-5xl mx-auto">
      <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
        Trust settings
      </p>
      <h1 className="font-serif italic text-3xl md:text-4xl text-teal-900 leading-[1.1] mb-2">
        Deal reputation badge
      </h1>
      <p className="text-sm text-ink-muted mb-8 max-w-2xl">
        Configure the checklist badge awarded from completed-deal ratings only.
        These settings do not control Identity, Business, Partner, hosting, or
        the compatibility verified badge.
      </p>
      <Suspense
        fallback={
          <div className="text-ink-muted">Loading Deal reputation settings&hellip;</div>
        }
      >
        <DealReputationSettingsClient />
      </Suspense>
    </div>
  );
}
