import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PlatformRequestDetailClient } from "./PlatformRequestDetailClient";

export const metadata = {
  title: "Platform request — Bantle admin",
  robots: { index: false, follow: false },
};

export default async function AdminPlatformRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-4xl mx-auto">
      <Link
        href="/admin/platform-requests"
        className="inline-flex items-center gap-1 text-sm text-ink-muted hover:text-teal-900 transition-colors mb-6"
      >
        <ChevronLeft size={14} />
        Back to platform requests
      </Link>
      <Suspense
        fallback={
          <div className="text-ink-muted">Loading platform request&hellip;</div>
        }
      >
        <PlatformRequestDetailClient requestId={id} />
      </Suspense>
    </div>
  );
}
