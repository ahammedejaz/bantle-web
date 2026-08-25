"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StoreBadges } from "@/components/StoreBadges";
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
      <div className="bg-paper"><div className="container-x py-14 md:py-20" /></div>
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
      <div className="bg-paper"><article className="container-x max-w-2xl py-14 md:py-20">
        <section className="rounded-panel bg-surface p-6 shadow-soft ring-1 ring-edge md:p-8">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
            Next step
          </p>
          <h2 className="mb-3 font-display text-[24px] font-semibold tracking-tight text-heading md:text-[28px]">
            Open the Bantle app
          </h2>
          <p className="mb-6 text-[15px] leading-[1.7] text-fg-muted">
            Tap below to open Bantle on this device. If you opened this link on
            a different device, switch to your phone and open the app there —
            your verification carries across.
          </p>
          <a
            href="bantle://"
            className="press inline-flex h-12 items-center rounded-full bg-canvas px-6 font-display text-[15px] font-semibold text-canvas-fg transition-colors duration-200 ease-out hover:bg-canvas-2"
          >
            Open Bantle
          </a>
        </section>

        <section className="mt-12">
          <h2 className="mb-3 font-display text-[24px] font-semibold tracking-tight text-heading md:text-[28px]">
            Don&apos;t have the app yet?
          </h2>
          <p className="mb-6 text-[15px] leading-[1.7] text-fg-muted">
            Bantle is available on Google Play and the App Store. If you
            signed up but haven&apos;t installed the app yet, download it to
            continue.
          </p>
          <StoreBadges />
        </section>

        <section className="mt-12">
          <h2 className="mb-3 font-display text-[24px] font-semibold tracking-tight text-heading md:text-[28px]">
            Something not working?
          </h2>
          <p className="text-[15px] leading-[1.7] text-fg-muted">
            If the &ldquo;Open Bantle&rdquo; button doesn&apos;t do anything,
            the app may not be installed on this device. Try opening this link
            on your phone instead, or write to{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-accent underline underline-offset-[3px] transition-colors hover:text-accent-strong"
            >
              {CONTACT_EMAIL}
            </a>{" "}
            and we&apos;ll help you finish setting up.
          </p>
        </section>
      </article></div>
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
      <div className="bg-paper"><article className="container-x max-w-2xl py-14 md:py-20">
        <section className="rounded-panel bg-surface p-6 shadow-soft ring-1 ring-edge md:p-8">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
            Next step
          </p>
          <h2 className="mb-3 font-display text-[24px] font-semibold tracking-tight text-heading md:text-[28px]">
            Request a new link in Bantle
          </h2>
          <p className="mb-6 text-[15px] leading-[1.7] text-fg-muted">
            Open the Bantle app and request a fresh verification email. If you
            still need help, write to{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-accent underline underline-offset-[3px] transition-colors hover:text-accent-strong"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
          <a
            href="bantle://"
            className="press inline-flex h-12 items-center rounded-full bg-canvas px-6 font-display text-[15px] font-semibold text-canvas-fg transition-colors duration-200 ease-out hover:bg-canvas-2"
          >
            Open Bantle
          </a>
        </section>
      </article></div>
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
      <div className="bg-paper"><article className="container-x max-w-2xl py-14 md:py-20">
        <section className="rounded-panel bg-surface p-6 shadow-soft ring-1 ring-edge md:p-8">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
            Next step
          </p>
          <h2 className="mb-3 font-display text-[24px] font-semibold tracking-tight text-heading md:text-[28px]">
            Open the Bantle app
          </h2>
          <p className="mb-6 text-[15px] leading-[1.7] text-fg-muted">
            Continue on your phone to complete or refresh email verification.
          </p>
          <a
            href="bantle://"
            className="press inline-flex h-12 items-center rounded-full bg-canvas px-6 font-display text-[15px] font-semibold text-canvas-fg transition-colors duration-200 ease-out hover:bg-canvas-2"
          >
            Open Bantle
          </a>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 font-display text-[24px] font-semibold tracking-tight text-heading md:text-[28px]">
            Get the app
          </h2>
          <StoreBadges />
        </section>

        <section className="mt-12">
          <p className="text-[15px] leading-[1.7] text-fg-muted">
            Already verified? Open the Bantle app on your phone to continue.{" "}
            <a
              href="bantle://"
              className="font-medium text-accent underline underline-offset-[3px] transition-colors hover:text-accent-strong"
            >
              Open Bantle
            </a>
          </p>
        </section>
      </article></div>
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
