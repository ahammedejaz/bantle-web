import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ResetPasswordClient } from "./ResetPasswordClient";

// Phase 11 — web-based password reset page.
//
// Reached via the link in Supabase's password recovery email. The
// link includes auth tokens that grant a temporary session scoped
// to password updates. After the user sets a new password, all
// other sessions for this account are invalidated.
//
// Security posture (OWASP-aligned):
//   - robots: noindex,nofollow — page must never appear in search
//   - referrer: 'no-referrer' — prevents tokens leaking via Referer
//   - Cache-Control via the route config — prevents caching
//   - All token handling is in-memory only, never logged
//   - Tokens stripped from URL after consumption

export const metadata = {
  title: "Reset password",
  description: "Set a new password for your Bantle account.",
  robots: {
    index: false,
    follow: false,
  },
  referrer: "no-referrer" as const,
};

// Force this page to be dynamic and never cached.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordClient />
    </Suspense>
  );
}

function ResetPasswordFallback() {
  return (
    <>
      <PageHeader
        eyebrow="Loading"
        title="Just a moment."
        intro="Validating your reset link."
      />
      <div className="bg-canvas"><div className="container-x py-14 md:py-20" /></div>
    </>
  );
}
