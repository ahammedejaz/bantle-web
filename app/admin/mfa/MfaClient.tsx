"use client";

import { useEffect, useState } from "react";
import { createAdminBrowserSupabase } from "@/lib/admin-supabase-browser";

type Factor = { id: string; friendly_name?: string };
export function MfaClient() {
  const [client] = useState(createAdminBrowserSupabase);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [factorId, setFactorId] = useState("");
  const [setup, setSetup] = useState<{ qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    client.auth.mfa.listFactors().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setError("Couldn't load your authenticator. Reload to try again.");
      else {
        setFactors(data.totp);
        setFactorId(data.totp[0]?.id ?? "");
        setReady(true);
      }
      setBusy(false);
    }).catch(() => { if (mounted) { setError("Couldn't load your authenticator. Reload to try again."); setBusy(false); } });
    return () => { mounted = false; };
  }, [client]);

  async function enroll() {
    if (busy || !ready) return;
    setBusy(true); setError("");
    try {
      // Only discard abandoned, unverified enrollments. Never remove a working factor.
      const { data, error } = await client.auth.mfa.listFactors();
      if (error) throw error;
      if (data.totp.length) {
        setFactors(data.totp); setFactorId(data.totp[0].id); return;
      }
      for (const factor of data.all.filter((f) => f.status === "unverified" && f.factor_type === "totp")) {
        const { error } = await client.auth.mfa.unenroll({ factorId: factor.id });
        if (error) throw error;
      }
      const result = await client.auth.mfa.enroll({ factorType: "totp", friendlyName: "Bantle admin", issuer: "Bantle" });
      if (result.error) throw result.error;
      setFactorId(result.data.id);
      setSetup({ qr: result.data.totp.qr_code, secret: result.data.totp.secret });
    } catch { setError("Couldn't set up the authenticator. Please try again."); }
    finally { setBusy(false); }
  }

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    if (busy || !factorId || !/^\d{6}$/.test(code)) return;
    setBusy(true); setError("");
    try {
      const { error } = await client.auth.mfa.challengeAndVerify({ factorId, code });
      if (error) throw error;
      setSetup(null); setCode("");
      // Full navigation drops any AAL1 router cache and sends the upgraded cookie.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- discard cached AAL1 RSC payloads
      window.location.assign("/admin");
    } catch { setError("That code couldn't be verified. Check your authenticator and try a fresh code."); setCode(""); }
    finally { setBusy(false); }
  }

  async function signOut() {
    setBusy(true);
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) { setError("Couldn't sign out. Try again."); setBusy(false); return; }
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- discard authenticated router cache
    window.location.assign("/admin/login");
  }

  return <main className="mx-auto max-w-md px-4 py-16">
    <h1 className="text-2xl font-medium text-teal-900">Secure your admin session</h1>
    <p className="mt-4 text-sm">Admin access requires a code from an authenticator app each time you sign in.</p>
    {busy && !ready && <p className="mt-4" role="status">Loading authenticator…</p>}
    {ready && !factorId && <button className="mt-6 rounded-card bg-teal-900 px-4 py-3 text-cream" disabled={busy} onClick={enroll}>Set up authenticator</button>}
    {setup && <section className="mt-6 space-y-3">
      <p>Scan this QR code with your authenticator. Store its backup securely; do not share it.</p>
      {/* The QR is a private, local data URI returned by Supabase; never send it to an image optimizer. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={setup.qr} alt="Authenticator setup QR code" width={240} height={240} />
      <details><summary>Enter setup key manually</summary><code className="break-all">{setup.secret}</code></details>
    </section>}
    {factorId && <form onSubmit={verify} className="mt-6 space-y-4">
      {factors.length > 1 && <label className="block">Authenticator<select className="block w-full p-2" value={factorId} onChange={(e) => setFactorId(e.target.value)}>{factors.map((f, i) => <option key={f.id} value={f.id}>{f.friendly_name ?? `Authenticator ${i + 1}`}</option>)}</select></label>}
      <label className="block" htmlFor="mfa-code">Six-digit code</label>
      <input id="mfa-code" className="w-full rounded-card border p-3" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} disabled={busy} required />
      <button className="rounded-card bg-teal-900 px-4 py-3 text-cream" type="submit" disabled={busy || code.length !== 6}>{busy ? "Verifying…" : "Verify and continue"}</button>
    </form>}
    {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
    <p className="mt-8 text-sm">Lost your authenticator? Use another enrolled authenticator, or contact the project owner for identity-checked recovery. Password reset alone does not remove this protection.</p>
    <button className="mt-6 text-sm underline" disabled={busy} onClick={signOut}>Sign out</button>
  </main>;
}
