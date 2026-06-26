"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Admin session security (defense-in-depth, client side).
// Automatically signs an inactive admin out, and also enforces an absolute
// session lifetime. This protects an unattended admin browser tab. It does NOT
// replace server-side gating: middleware + the admin layout still verify an
// authenticated session and profiles.is_admin on every request. It also does
// NOT replace project-level Supabase Auth inactivity/timebox settings (see the
// session-timeout report) — both layers are recommended.
//
// Sign-out reuses the proven server route POST /admin/api/logout (same-origin
// validated, clears the auth cookie reliably) then redirects to /admin/login,
// exactly like the manual logout dialog. No tokens, session data, or user IDs
// are logged.

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity
const WARNING_MS = 60 * 1000; // warn 1 minute before sign-out
const ABSOLUTE_SESSION_MS = 12 * 60 * 60 * 1000; // 12 hour absolute cap
const CHECK_INTERVAL_MS = 5 * 1000; // how often to evaluate
const ACTIVITY_THROTTLE_MS = 1000; // min gap between activity writes
const SESSION_START_KEY = "bantle_admin_session_start";

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
] as const;

export function AdminIdleTimeout() {
  const lastActivityRef = useRef<number>(Date.now());
  const lastWriteRef = useRef<number>(0);
  const signingOutRef = useRef<boolean>(false);
  const [warningSecondsLeft, setWarningSecondsLeft] = useState<number | null>(
    null,
  );

  const signOut = useCallback(async () => {
    if (signingOutRef.current) return;
    signingOutRef.current = true;
    try {
      window.localStorage.removeItem(SESSION_START_KEY);
    } catch {
      // ignore storage access errors
    }
    try {
      await fetch("/admin/api/logout", { method: "POST" });
    } catch {
      // even if the request fails, force the user back to login
    }
    window.location.href = "/admin/login";
  }, []);

  const registerActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastWriteRef.current < ACTIVITY_THROTTLE_MS) return;
    lastWriteRef.current = now;
    lastActivityRef.current = now;
    setWarningSecondsLeft((prev) => (prev === null ? prev : null));
  }, []);

  const stayActive = useCallback(() => {
    lastActivityRef.current = Date.now();
    lastWriteRef.current = Date.now();
    setWarningSecondsLeft(null);
  }, []);

  useEffect(() => {
    // Establish (or read) the absolute session start for this browser.
    let sessionStart = Date.now();
    try {
      const stored = window.localStorage.getItem(SESSION_START_KEY);
      if (stored && !Number.isNaN(Number(stored))) {
        sessionStart = Number(stored);
      } else {
        window.localStorage.setItem(SESSION_START_KEY, String(sessionStart));
      }
    } catch {
      // storage unavailable: fall back to in-memory start
    }

    const evaluate = () => {
      if (signingOutRef.current) return;
      const now = Date.now();

      if (now - sessionStart >= ABSOLUTE_SESSION_MS) {
        void signOut();
        return;
      }

      const idleFor = now - lastActivityRef.current;
      if (idleFor >= IDLE_TIMEOUT_MS) {
        void signOut();
        return;
      }

      const msUntilSignOut = IDLE_TIMEOUT_MS - idleFor;
      if (msUntilSignOut <= WARNING_MS) {
        setWarningSecondsLeft(Math.ceil(msUntilSignOut / 1000));
      } else {
        setWarningSecondsLeft((prev) => (prev === null ? prev : null));
      }
    };

    const onVisibilityOrFocus = () => {
      // Returning to a tab that sat idle past the threshold signs out now.
      if (document.visibilityState === "visible") evaluate();
    };

    for (const evt of ACTIVITY_EVENTS) {
      window.addEventListener(evt, registerActivity, { passive: true });
    }
    document.addEventListener("visibilitychange", onVisibilityOrFocus);
    window.addEventListener("focus", onVisibilityOrFocus);

    const interval = window.setInterval(evaluate, CHECK_INTERVAL_MS);

    return () => {
      for (const evt of ACTIVITY_EVENTS) {
        window.removeEventListener(evt, registerActivity);
      }
      document.removeEventListener("visibilitychange", onVisibilityOrFocus);
      window.removeEventListener("focus", onVisibilityOrFocus);
      window.clearInterval(interval);
    };
  }, [registerActivity, signOut]);

  if (warningSecondsLeft === null) return null;

  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      aria-label="Session about to expire"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-[0_24px_60px_-20px_rgba(0,60,52,0.35)] sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-ink">
        You&apos;ll be signed out in{" "}
        <span className="font-semibold text-teal-900">
          {warningSecondsLeft}s
        </span>{" "}
        due to inactivity.
      </p>
      <button
        type="button"
        onClick={stayActive}
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-teal-700 px-4 text-sm font-medium text-cream transition-colors hover:bg-teal-800"
      >
        Stay signed in
      </button>
    </div>
  );
}
