"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ComingSoonBadges } from "@/components/ComingSoonBadges";
import { CONTACT_EMAIL } from "@/lib/constants";

export function VerifyClient() {
  const searchParams = useSearchParams();

  const hasAuthParams = Boolean(
    searchParams.get("token_hash") ||
      searchParams.get("token") ||
      searchParams.get("access_token") ||
      searchParams.get("type") ||
      searchParams.get("code")
  );

  // Phase 11 — recovery state. When the URL carries type=recovery
  // (from the forgot-password reset email), render a dedicated state
  // that explicitly directs the user into the mobile app via a
  // bantle://reset-password deep link. No auto-redirect — deep links
  // are unreliable from some in-app browsers on certain Android
  // versions, so explicit user tap is more robust.
  const type = searchParams.get("type");
  const isRecovery = type === "recovery";

  const [hashType, setHashType] = useState<string | null>(null);
  const [hasHashTokens, setHasHashTokens] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      setHashType(hashParams.get("type"));
      setHasHashTokens(
        Boolean(
          hashParams.get("access_token") ||
            hashParams.get("token") ||
            hashParams.get("type")
        )
      );
    }
  }, []);

  const isVerified = hasAuthParams || hasHashTokens;
  const isRecoveryFromHash = hashType === "recovery";

  if (isRecovery || isRecoveryFromHash) {
    // Preserve every auth param so the mobile app can complete the
    // token exchange. Supabase sometimes delivers params via the
    // hash (#access_token=…) instead of the query string; pass both
    // through unchanged.
    const search = searchParams.toString();
    const hash =
      typeof window !== "undefined" && window.location.hash
        ? window.location.hash.substring(1)
        : "";
    const combined = [search, hash].filter(Boolean).join("&");
    const deepLinkUrl = `bantle://reset-password${
      combined ? `?${combined}` : ""
    }`;
    return <RecoveryState deepLinkUrl={deepLinkUrl} />;
  }

  return isVerified ? <VerifiedState /> : <NeutralState />;
}

function RecoveryState({ deepLinkUrl }: { deepLinkUrl: string }) {
  return (
    <>
      <PageHeader
        eyebrow="Reset password"
        title="Open Bantle to set a new password."
        intro="Your reset link is valid. Tap below to open the Bantle app where you can set your new password."
      />
      <article className="container-x py-12 md:py-16 max-w-2xl">
        <section className="bg-cream-card border border-line rounded-card p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-3">
            Next step
          </p>
          <h2 className="font-serif italic text-2xl md:text-3xl text-teal-900 mb-3">
            Open the Bantle app
          </h2>
          <p className="text-[15px] leading-7 text-ink-muted mb-6">
            Tap below to open Bantle on this device. You&apos;ll set
            your new password inside the app. The link is valid for
            one hour from when you requested it.
          </p>
          <a
            href={deepLinkUrl}
            className="inline-block bg-teal-900 text-cream font-medium text-base px-6 py-3 rounded-card hover:bg-teal-700 transition-colors"
          >
            Open Bantle
          </a>
        </section>

        <section className="mt-12">
          <h2 className="font-serif italic text-2xl md:text-3xl text-teal-900 mb-3">
            Don&apos;t have the app on this device?
          </h2>
          <p className="text-[15px] leading-7 text-ink-muted">
            If you opened this link on a different device than where
            Bantle is installed, switch to your phone and open the
            email there. The link will work as long as it&apos;s
            within the hour.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-serif italic text-2xl md:text-3xl text-teal-900 mb-3">
            Something not working?
          </h2>
          <p className="text-[15px] leading-7 text-ink-muted">
            If the &ldquo;Open Bantle&rdquo; button doesn&apos;t do
            anything, the app may not be installed on this device.
            If you&apos;re sure Bantle is installed and the link
            still doesn&apos;t work, write to{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-teal-600 underline underline-offset-2 hover:text-teal-900"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            and we&apos;ll help you reset your password.
          </p>
        </section>
      </article>
    </>
  );
}

function VerifiedState() {
  return (
    <>
      <PageHeader
        eyebrow="Email verified"
        title="Welcome to Bantle. Your email is confirmed."
        intro="You're all set. Open the Bantle app on your phone to finish setting up your account."
      />
      <article className="container-x py-12 md:py-16 max-w-2xl">
        <section className="bg-cream-card border border-line rounded-card p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-3">
            Next step
          </p>
          <h2 className="font-serif italic text-2xl md:text-3xl text-teal-900 mb-3">
            Open the Bantle app
          </h2>
          <p className="text-[15px] leading-7 text-ink-muted mb-6">
            Tap below to open Bantle on this device. If you opened this link on
            a different device, switch to your phone and open the app there —
            your verification carries across.
          </p>
          <a
            href="bantle://"
            className="inline-block bg-teal-900 text-cream font-medium text-base px-6 py-3 rounded-card hover:bg-teal-700 transition-colors"
          >
            Open Bantle
          </a>
        </section>

        <section className="mt-12">
          <h2 className="font-serif italic text-2xl md:text-3xl text-teal-900 mb-3">
            Don&apos;t have the app yet?
          </h2>
          <p className="text-[15px] leading-7 text-ink-muted mb-6">
            Bantle is launching first on Android, with iOS to follow. If you
            signed up but haven&apos;t installed the app yet, watch for the
            launch announcement.
          </p>
          <ComingSoonBadges />
        </section>

        <section className="mt-12">
          <h2 className="font-serif italic text-2xl md:text-3xl text-teal-900 mb-3">
            Something not working?
          </h2>
          <p className="text-[15px] leading-7 text-ink-muted">
            If the &ldquo;Open Bantle&rdquo; button doesn&apos;t do anything,
            the app may not be installed on this device. Try opening this link
            on your phone instead, or write to{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-teal-600 underline underline-offset-2 hover:text-teal-900"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            and we&apos;ll help you finish setting up.
          </p>
        </section>
      </article>
    </>
  );
}

function NeutralState() {
  return (
    <>
      <PageHeader
        eyebrow="Welcome"
        title="This page is for verifying your Bantle email."
        intro="If you arrived here from a Bantle verification email, you can open the app to continue. If you're new to Bantle, learn more below."
      />
      <article className="container-x py-12 md:py-16 max-w-2xl">
        <section className="bg-cream-card border border-line rounded-card p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-3">
            What is Bantle?
          </p>
          <h2 className="font-serif italic text-2xl md:text-3xl text-teal-900 mb-3">
            Share subscription costs with people you trust.
          </h2>
          <p className="text-[15px] leading-7 text-ink-muted mb-4">
            Bantle helps Indians find trusted partners to split family
            subscription plans for Spotify, YouTube Premium, Apple One,
            Microsoft 365 and more. Discovery and chat only — payments stay
            between you, via UPI.
          </p>
          <Link
            href="/"
            className="text-teal-600 underline underline-offset-2 hover:text-teal-900"
          >
            Learn more →
          </Link>
        </section>

        <section className="mt-12">
          <h2 className="font-serif italic text-2xl md:text-3xl text-teal-900 mb-4">
            Get the app
          </h2>
          <ComingSoonBadges />
        </section>

        <section className="mt-12">
          <p className="text-[15px] leading-7 text-ink-muted">
            Already verified? Open the Bantle app on your phone to continue.{" "}
            <a
              href="bantle://"
              className="text-teal-600 underline underline-offset-2 hover:text-teal-900"
            >
              Open Bantle
            </a>
          </p>
        </section>
      </article>
    </>
  );
}
