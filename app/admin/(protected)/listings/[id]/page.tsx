import { Suspense } from "react";
import { ListingDetailClient } from "./ListingDetailClient";

export const metadata = {
  title: "Listing detail — Bantle admin",
  robots: { index: false, follow: false },
};

export default async function AdminListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-5xl mx-auto">
      <Suspense
        fallback={<div className="text-ink-muted">Loading listing&hellip;</div>}
      >
        <ListingDetailClient listingId={id} />
      </Suspense>
    </div>
  );
}
