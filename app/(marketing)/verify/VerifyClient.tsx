"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ComingSoonBadges } from "@/components/ComingSoonBadges";
import { CONTACT_EMAIL } from "@/lib/constants";
import { createBrowserSupabase } from "@/lib/supabase";

type VerifyPhase = "checking" | "success" | "neutral" | "error";
type VerificationType =
  | "signup"
  | "email"
  | "email_change"
  | "invite"
  | "magiclink";

const INVALID_LINK_COPY =
  "This verification link is invalid or expired. Open Bantle and request a new verification email.";

export function VerifyClient() {
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<VerifyPhase>("checking");

  useEffect(() => {
    let cancelled = false;

    async function verifyEmailLink() {
      const tokenHash = searchParams.get("token_hash");
      const legacyToken = searchParams.get("token");
      const queryType = searchParams.get("type");
      const code = searchParams.get("code");

      let accessToken = searchParams.get("access_token");
      let refreshToken = searchParams.get("refresh_token");

      if (typeof window !== "undefined" && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        accessToken = accessToken ?? hashParams.get("access_token");
        refreshToken = refreshToken ?? hashParams.get("refresh_token");
      }

      stripAuthParamsFromUrl();

      const verificationType = getSupportedVerificationType(queryType);
      const hasVerificationMaterial = Boolean(
        tokenHash || legacyToken || code || accessToken || refreshToken,
      );

      if (!hasVerificationMaterial) {
        if (!cancelled) setPhase("neutral");
        return;
      }

      try {
        const supabase = createBrowserSupabase();
        let verified = false;

        if (tokenHash && verificationType) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: verificationType,
          });
          verified = !error;
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          verified = !error;
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          verified = !error;
        }

        if (!cancelled) {
          setPhase(verified ? "success" : "error");
        }
      } catch {
        if (!cancelled) {
          setPhase("error");
        }
      }
    }

    void verifyEmailLink();

    return () => {
      cancelled = true;
    };
    // Run once with the original URL params before this component strips them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "checking") return <CheckingState />;
  if (phase === "success") return <VerifiedState />;
  if (phase === "error") return <ErrorState />;

  return <NeutralState />;
}

function CheckingState() {
  return (
    <>
      <PageHeader
        eyebrow="Checking"
        title="Checking your verification link."
        intro="This only takes a moment."
      />
      <article className="container-x py-12 md:py-16 max-w-2xl" />
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
            Bantle is preparing early access across Android and iOS. If you
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

function ErrorState() {
  return (
    <>
      <PageHeader
        eyebrow="Verification link"
        title="We could not verify this link."
        intro={INVALID_LINK_COPY}
      />
      <article className="container-x py-12 md:py-16 max-w-2xl">
        <section className="bg-cream-card border border-line rounded-card p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-3">
            Next step
          </p>
          <h2 className="font-serif italic text-2xl md:text-3xl text-teal-900 mb-3">
            Request a new link in Bantle
          </h2>
          <p className="text-[15px] leading-7 text-ink-muted mb-6">
            Open the Bantle app and request a fresh verification email. If you
            still need help, write to{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-teal-600 underline underline-offset-2 hover:text-teal-900"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
          <a
            href="bantle://"
            className="inline-block bg-teal-900 text-cream font-medium text-base px-6 py-3 rounded-card hover:bg-teal-700 transition-colors"
          >
            Open Bantle
          </a>
        </section>
      </article>
    </>
  );
}

function NeutralState() {
  return (
    <>
      <PageHeader
        eyebrow="Email verification"
        title="Open Bantle to finish verification."
        intro="If you arrived here from a Bantle verification email, open the app to continue. If the link is invalid or expired, request a new verification email in the app."
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
            Continue on your phone to complete or refresh email verification.
          </p>
          <a
            href="bantle://"
            className="inline-block bg-teal-900 text-cream font-medium text-base px-6 py-3 rounded-card hover:bg-teal-700 transition-colors"
          >
            Open Bantle
          </a>
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

function getSupportedVerificationType(type: string | null): VerificationType | null {
  switch (type) {
    case "signup":
    case "email":
    case "email_change":
    case "invite":
    case "magiclink":
      return type;
    default:
      return null;
  }
}

function stripAuthParamsFromUrl() {
  if (typeof window === "undefined") return;

  try {
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);
  } catch {
    // Keep rendering even if an old browser refuses to clean the URL.
  }
}
