import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { IdentityVerificationDetailClient } from "./IdentityVerificationDetailClient";

export const metadata = {
  title: "Identity verification detail — Bantle admin",
  robots: { index: false, follow: false },
};

export default async function AdminIdentityVerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-4xl mx-auto">
      <Link
        href="/admin/identity-verifications"
        className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-900 mb-4"
      >
        <ChevronLeft size={14} />
        Back to identity verification
      </Link>
      <Suspense
        fallback={
          <div className="text-ink-muted">Loading identity request&hellip;</div>
        }
      >
        <IdentityVerificationDetailClient verificationId={id} />
      </Suspense>
    </div>
  );
}
