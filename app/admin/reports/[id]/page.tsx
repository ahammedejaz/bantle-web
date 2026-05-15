import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ReportDetailClient } from "./ReportDetailClient";

export const metadata = {
  title: "Report — Bantle admin",
  robots: { index: false, follow: false },
};

export default function AdminReportDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-4xl mx-auto">
      <Link
        href="/admin/reports"
        className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-900 mb-4"
      >
        <ChevronLeft size={14} />
        Back to reports
      </Link>
      <Suspense
        fallback={<div className="text-ink-muted">Loading report&hellip;</div>}
      >
        <ReportDetailClient reportId={params.id} />
      </Suspense>
    </div>
  );
}
