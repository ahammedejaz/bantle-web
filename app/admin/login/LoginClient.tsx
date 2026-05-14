"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { createAdminBrowserSupabase } from "@/lib/admin-supabase-browser";

// Sign-in form for the admin panel. Mirrors the
// reset-password client pattern: server-component page.tsx for
// metadata + Suspense, client component here for state and
// supabase calls.
//
// Security:
//   - Generic error copy regardless of failure reason. We do not
//     distinguish "wrong password" from "not an admin" from "no
//     such user" — the admin panel does not exist as far as
//     non-admins are concerned.
//   - On success, middleware re-checks admin status on the next
//     navigation. We use router.push("/admin") and let middleware
//     do the final say.

type Phase = "ready" | "submitting" | "error";

export function LoginClient() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phase, setPhase] = useState<Phase>("ready");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (phase === "submitting") return;

    if (!email || !password) {
      setErrorMessage("Enter your email and password.");
      return;
    }

    setPhase("submitting");
    setErrorMessage(null);

    try {
      const supabase = createAdminBrowserSupabase();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setPhase("error");
        setErrorMessage("Invalid email or password.");
        return;
      }

      // Middleware will verify admin status on the next request.
      // If the signed-in user is not an admin, middleware bounces
      // them to /. Either way we don't leak which check failed.
      router.push("/admin");
      router.refresh();
    } catch {
      setPhase("error");
      setErrorMessage("Couldn't sign in right now. Try again.");
    }
  }

  const submitting = phase === "submitting";

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-3">
            Bantle admin
          </p>
          <h1 className="font-serif italic text-3xl md:text-4xl text-teal-900 leading-[1.1]">
            Sign in
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-cream-card border border-line rounded-card p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Lock size={18} className="text-teal-900" />
            <h2 className="font-medium text-base text-teal-900">
              Admin credentials
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium text-teal-900 mb-2"
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                autoComplete="email"
                disabled={submitting}
                placeholder="you@bantle.in"
                className="w-full px-4 py-3 border border-line rounded-card bg-cream text-teal-900 placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-teal-900 disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-teal-900 mb-2"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                autoComplete="current-password"
                disabled={submitting}
                className="w-full px-4 py-3 border border-line rounded-card bg-cream text-teal-900 placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-teal-900 disabled:opacity-60"
              />
            </div>

            {errorMessage ? (
              <p className="text-sm text-red-700" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-900 text-cream font-medium text-base px-6 py-3 rounded-card hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
