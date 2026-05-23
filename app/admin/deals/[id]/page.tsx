import { Suspense } from "react";
import { DealDetailClient } from "./DealDetailClient";

export const metadata = {
  title: "Deal detail — Bantle admin",
  robots: { index: false, follow: false },
};

export default function AdminDealDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-5xl mx-auto">
      <Suspense
        fallback={<div className="text-ink-muted">Loading deal&hellip;</div>}
      >
        <DealDetailClient dealId={params.id} />
      </Suspense>
    </div>
  );
}
