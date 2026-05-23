import { Suspense } from "react";
import { ListingsClient } from "./ListingsClient";

export const metadata = {
  title: "Listings — Bantle admin",
  robots: { index: false, follow: false },
};

export default function AdminListingsPage() {
  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-5xl mx-auto">
      <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
        Listings
      </p>
      <h1 className="font-serif italic text-3xl md:text-4xl text-teal-900 leading-[1.1] mb-2">
        Listings management
      </h1>
      <p className="text-sm text-ink-muted mb-8 max-w-2xl">
        Search listings by host, title, platform, or UUID. Force-close abusive
        or stale listings without changing existing deals or chats.
      </p>
      <Suspense
        fallback={<div className="text-ink-muted">Loading listings&hellip;</div>}
      >
        <ListingsClient />
      </Suspense>
    </div>
  );
}
