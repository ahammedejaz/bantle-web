import { Suspense } from "react";
import { BroadcastsClient } from "./BroadcastsClient";

export const metadata = {
  title: "Broadcasts — Bantle admin",
  robots: { index: false, follow: false },
};

export default function AdminBroadcastsPage() {
  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-5xl mx-auto">
      <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
        Broadcasts
      </p>
      <h1 className="font-serif italic text-3xl md:text-4xl text-teal-900 leading-[1.1] mb-2">
        Incident broadcasts
      </h1>
      <p className="text-sm text-ink-muted mb-8 max-w-2xl">
        Send incident notices to eligible Bantle users. Marketing and
        re-engagement pushes are not allowed.
      </p>
      <Suspense
        fallback={<div className="text-ink-muted">Loading broadcasts&hellip;</div>}
      >
        <BroadcastsClient />
      </Suspense>
    </div>
  );
}
