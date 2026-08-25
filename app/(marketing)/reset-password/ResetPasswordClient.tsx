"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PageHeader } from "@/components/PageHeader";
import { createBrowserSupabase } from "@/lib/supabase";
import { CONTACT_EMAIL } from "@/lib/constants";

// Phase 11 — web-based password reset form.
//
// Flow:
//   1. Page mounts, reads auth tokens from URL (query string AND
//      hash fragment — Supabase delivers via either depending on
//      flow type).
//   2. Strips tokens from visible URL via history.replaceState.
//   3. Establishes a recovery session via setSession (hash format)
//      or verifyOtp (query token format).
//   4. Renders form. User enters new password + confirm.
//   5. Calls supabase.auth.updateUser({ password }).
//   6. On success: signOut with global scope (invalidates all
//      sessions), shows success message.
//   7. User returns to mobile app to sign in.
//
// Security: tokens never appear in logs, error messages, or UI
// text. Password values cleared from state after submit. Generic
// error copy regardless of failure reason (no information leakage).
//
// The Supabase client is created once in useEffect and stashed in a
// ref so the same instance is reused for updateUser. With
// persistSession: false the client doesn't share auth state across
// instances, so a fresh createBrowserSupabase() in handleSubmit
// wouldn't see the recovery session established on mount.

type Phase = "validating" | "ready" | "submitting" | "success" | "error";

export function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const supabaseRef = useRef<SupabaseClient | null>(null);

  const [phase, setPhase] = useState<Phase>("validating");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | undefined>(
    undefined,
  );
  const [confirmError, setConfirmError] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    let cancelled = false;

    async function establishSession() {
      const supabase = createBrowserSupabase();
      supabaseRef.current = supabase;

      const queryToken = searchParams.get("token");
      const queryType = searchParams.get("type");

      let hashAccessToken: string | null = null;
      let hashRefreshToken: string | null = null;
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        hashAccessToken = params.get("access_token");
        hashRefreshToken = params.get("refresh_token");
      }

      // Strip auth params from visible URL BEFORE any further logic
      // so even if establishment fails, tokens don't sit in the URL
      // bar (and can't leak via screenshots, screen-sharing, or
      // browser history).
      if (typeof window !== "undefined") {
        try {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, "", cleanUrl);
        } catch {
          // history.replaceState shouldn't fail, but if it does
          // (very old browser), continue anyway. Worst case the
          // URL bar shows the token until the user navigates away.
        }
      }

      let establishedOk = false;

      if (hashAccessToken && hashRefreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: hashAccessToken,
          refresh_token: hashRefreshToken,
        });
        if (!error) {
          establishedOk = true;
        }
      } else if (queryToken && queryType === "recovery") {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: queryToken,
          type: "recovery",
        });
        if (!error) {
          establishedOk = true;
        }
      }

      if (cancelled) return;

      setPhase(establishedOk ? "ready" : "error");
    }

    void establishSession();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validate(): boolean {
    let ok = true;

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      ok = false;
    } else if (!/[A-Z]/.test(password)) {
      setPasswordError("Password must include an uppercase letter.");
      ok = false;
    } else if (!/[a-z]/.test(password)) {
      setPasswordError("Password must include a lowercase letter.");
      ok = false;
    } else if (!/[0-9]/.test(password)) {
      setPasswordError("Password must include a number.");
      ok = false;
    } else {
      setPasswordError(undefined);
    }

    if (confirmPassword !== password) {
      setConfirmError("Passwords don't match.");
      ok = false;
    } else {
      setConfirmError(undefined);
    }

    return ok;
  }

  async function handleSubmit() {
    if (phase !== "ready") return;
    if (!validate()) return;

    const supabase = supabaseRef.current;
    if (!supabase) {
      setPhase("error");
      return;
    }

    setPhase("submitting");

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        const msg = error.message?.toLowerCase() ?? "";
        // Token-related errors → generic error state (OWASP no-info-leak).
        // The user's recovery session is no longer valid in these cases,
        // so they need a new reset link.
        if (
          msg.includes("token") ||
          msg.includes("expired") ||
          msg.includes("invalid") ||
          msg.includes("not found") ||
          msg.includes("jwt")
        ) {
          setPhase("error");
          return;
        }
        // Anything else is a password policy issue (reuse, weakness,
        // length, etc). Show inline so the user can try a different
        // password without requesting a new link. The user is already
        // authenticated via the recovery session at this point, so
        // showing the Supabase message doesn't leak token state info.
        setPasswordError(
          error.message || "Couldn't update password. Try a different one.",
        );
        setPhase("ready");
        return;
      }

      setPassword("");
      setConfirmPassword("");

      await supabase.auth.signOut({ scope: "global" });

      setPhase("success");
    } catch {
      setPhase("error");
    }
  }

  if (phase === "validating") {
    return (
      <>
        <PageHeader
          eyebrow="Loading"
          title="Validating your reset link."
          intro="Just a moment."
        />
        <div className="bg-paper"><div className="container-x py-14 md:py-20" /></div>
      </>
    );
  }

  if (phase === "error") {
    return (
      <>
        <PageHeader
          eyebrow="Reset link"
          title="Couldn't reset your password."
          intro="Your reset link may have expired or already been used. Request a new one from the Bantle app to continue."
        />
        <div className="bg-paper"><article className="container-x max-w-2xl py-14 md:py-20">
          <section className="rounded-panel bg-surface p-6 shadow-soft ring-1 ring-edge md:p-8">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
              Next step
            </p>
            <h2 className="mb-3 font-display text-[24px] font-semibold tracking-tight text-heading md:text-[28px]">
              Request a new reset link
            </h2>
            <p className="text-[15px] leading-[1.7] text-fg-muted">
              Open the Bantle app on your phone, tap{" "}
              <span className="font-medium">Forgot password?</span> on
              the sign-in screen, and enter your email to receive a
              fresh link.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="mb-3 font-display text-[24px] font-semibold tracking-tight text-heading md:text-[28px]">
              Need help?
            </h2>
            <p className="text-[15px] leading-[1.7] text-fg-muted">
              If you keep running into trouble, write to{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-medium text-accent underline underline-offset-[3px] transition-colors hover:text-accent-strong"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              and we&apos;ll help you sort it out.
            </p>
          </section>
        </article></div>
      </>
    );
  }

  if (phase === "success") {
    return (
      <>
        <PageHeader
          eyebrow="Password updated"
          title="Your password has been changed."
          intro="Open the Bantle app on your phone and sign in with your new password."
        />
        <div className="bg-paper"><article className="container-x max-w-2xl py-14 md:py-20">
          <section className="rounded-panel bg-surface p-6 shadow-soft ring-1 ring-edge md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 size={24} className="text-accent" />
              <h2 className="font-display text-[24px] font-semibold tracking-tight text-heading md:text-[28px]">
                You&apos;re all set
              </h2>
            </div>
            <p className="mb-6 text-[15px] leading-[1.7] text-fg-muted">
              For your security, all other sessions on your account
              have been signed out. Open the Bantle app and sign in
              with your new password to continue.
            </p>
            <p className="text-[14px] leading-[1.7] text-fg-muted">
              Open the Bantle app on your phone and sign in with your new
              password to continue.
            </p>
          </section>
        </article></div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Reset password"
        title="Set a new password for Bantle."
        intro="Choose a password you haven't used before. After you reset it, sign in fresh on the Bantle app to continue."
      />
      <div className="bg-paper"><article className="container-x max-w-2xl py-14 md:py-20">
        <section className="rounded-panel bg-surface p-6 shadow-soft ring-1 ring-edge md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Lock size={20} className="text-accent" />
            <h2 className="font-display text-[24px] font-semibold tracking-tight text-heading md:text-[28px]">
              New password
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-[13.5px] font-medium text-fg"
              >
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="At least 8 characters, mixed case + number"
                className="w-full rounded-[14px] border border-edge-2 bg-paper px-4 py-3 text-[15px] text-fg transition-colors placeholder:text-fg-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/35"
              />
              {passwordError ? (
                <p className="mt-2 text-[13.5px] font-medium text-negative">
                  {passwordError}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-[13.5px] font-medium text-fg"
              >
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                className="w-full rounded-[14px] border border-edge-2 bg-paper px-4 py-3 text-[15px] text-fg transition-colors placeholder:text-fg-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/35"
              />
              {confirmError ? (
                <p className="mt-2 text-[13.5px] font-medium text-negative">
                  {confirmError}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={phase === "submitting"}
              className="press inline-flex h-12 w-full items-center justify-center rounded-full bg-canvas px-6 font-display text-[15px] font-semibold text-canvas-fg transition-colors duration-200 ease-out hover:bg-canvas-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {phase === "submitting" ? "Setting password..." : "Set new password"}
            </button>
          </div>
        </section>

        <section className="mt-8 flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-fg-muted" />
          <p className="text-[12px] text-fg-muted">
            Your password is encrypted and never shared.
          </p>
        </section>
      </article></div>
    </>
  );
}
