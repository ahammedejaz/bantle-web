import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { VerifyClient } from "./VerifyClient";

export const metadata = {
  title: "Email verification",
  description:
    "Confirm your Bantle email and open the app to continue.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyFallback />}>
      <VerifyClient />
    </Suspense>
  );
}

function VerifyFallback() {
  return (
    <>
      <PageHeader
        eyebrow="Loading"
        title="Just a moment."
        intro="Checking your verification status."
      />
      <article className="container-x py-12 md:py-16 max-w-2xl" />
    </>
  );
}
