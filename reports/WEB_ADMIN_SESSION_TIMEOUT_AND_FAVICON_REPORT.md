# Bantle Web/Admin — Session Timeout & Plain Favicon Report

**Document status:** Implementation report (favicon asset + admin client-side session hardening)
**Date:** 2026-06-27
**Owner:** Bantle founder / implementation agent (Claude Opus 4.8)
**Web repo:** `/Users/syedejazahammed/Documents/GitHub/bantle-web`
**Web branch:** `feature/trust-verification-admin-queues`
**Mobile repo (reference only, not modified):** `/Users/syedejazahammed/Documents/GitHub/bantle`

---

## 1. Summary

Two fixes: (A) the browser tab favicon is now the plain Bantle mark (transparent,
no dark app-icon background); (B) authenticated admin sessions now auto sign-out
after inactivity and after an absolute lifetime, via a client-side
`AdminIdleTimeout` component mounted only inside the authenticated admin layout.
The idle timeout is defense-in-depth: the existing server-side gating
(middleware + admin layout `getUser()` + `profiles.is_admin` via service role)
is unchanged, and project-level Supabase Auth session settings are recommended
as the enforceable layer (founder dashboard action).

No DB schema, migrations, RLS, Supabase/Edge functions, or mobile changes. No
service-role moved client-side. No dependencies added. Marketing UI unchanged
except the favicon asset. `tsc`, `eslint`, `next build`, `git diff --check` pass.

---

## 2. Branch

```text
feature/trust-verification-admin-queues
```

---

## 3. Founder issues

```text
1. Tab favicon showed the Bantle icon WITH a dark background; founder wants the
   plain mark only.
2. Admin sessions stay valid for days; an unattended admin browser remains logged
   in — should expire/sign out on inactivity.
```

---

## 4. Favicon / tab icon RCA + fix

```text
RCA: app/icon.png was the dark rounded app-icon (bantle-icon.png) — it has an
opaque dark-teal squircle background, which is what showed in the tab.

Fix: replaced app/icon.png with a square, fully transparent version of the plain
mint mark (cropped/centered from the brand mark; 214x214, corner alpha = 0, glyph
present). No background/chip. app/apple-icon.png is intentionally kept as the
app-style icon (apple-touch icons render poorly when transparent; founder allowed
app-style there). metadata.icons was already removed in a prior pass, so the Next
file convention drives the tags.

Verified prerendered head:
  <link rel="icon" href="/icon.png?..." sizes="214x214" type="image/png">
No old text-"B" SVG remains (removed previously). Note: browsers cache favicons
aggressively — a hard refresh / cache clear is needed to see the change.
```

---

## 5. Admin auth / session recon

```text
- middleware.ts gates /admin (admin status) — left unchanged.
- app/admin/layout.tsx (server component) re-verifies: createServerClient +
  auth.getUser(); if no user -> renders bare layout (login shows through); then
  fetches profiles.is_admin via service role (server-only) and redirect("/") if
  not admin. This server guard is the authoritative check.
- Logout: components/admin/LogoutConfirmDialog.tsx -> POST /admin/api/logout
  (validates same-origin, createRouteSupabase, supabase.auth.signOut(), clears
  cookie) -> window.location.href = "/admin/login".
- Browser client exists at lib/admin-supabase-browser.ts (anon key).
- Service-role client is server-only (lib/admin-supabase-server.ts); not exposed.
- Admin pages: server components with client sub-components; session in cookies
  (Supabase SSR) with auto-refresh.
```

---

## 6. Admin idle-timeout implementation

```text
New: components/admin/AdminIdleTimeout.tsx ('use client'), mounted ONLY in the
authenticated branch of app/admin/layout.tsx (after the `if (!user) return`),
so it never runs on /admin/login or on marketing pages.

Behavior:
- Tracks real activity: mousemove, mousedown, keydown, scroll, touchstart
  (passive listeners; writes throttled to <=1/sec via a ref, no re-renders).
- Idle timeout: 30 minutes -> automatic sign-out.
- Warning: a compact, theme-consistent banner appears 60s before sign-out with a
  live countdown and a "Stay signed in" button that resets the timer.
- Absolute session lifetime: 12 hours (start timestamp persisted in localStorage
  under bantle_admin_session_start; cleared on sign-out) -> sign-out when exceeded.
- visibilitychange + window focus: immediately re-evaluates, so returning to a
  tab that sat idle past the threshold signs out at once.
- Sign-out reuses the proven path: POST /admin/api/logout then redirect to
  /admin/login (guarded against double-invocation; localStorage start cleared).
- Listeners + interval cleaned up on unmount.
- Privacy: no user IDs, tokens, or session data are logged.

Constants (committed production values):
  IDLE_TIMEOUT_MS=30m, WARNING_MS=60s, ABSOLUTE_SESSION_MS=12h, CHECK every 5s.
(No shortened test value committed.)
```

---

## 7. Server-side admin guard verification

```text
Unchanged and still enforced:
- middleware.ts continues to gate /admin.
- app/admin/layout.tsx still calls auth.getUser() and checks profiles.is_admin
  (service role, server-only) with a defensive redirect("/") for non-admins.
- Admin API route handlers retain their own auth/admin checks and same-origin
  mutation validation (e.g., /admin/api/logout).
- Service-role usage remains server-only; not moved into any client component.
The idle timeout is additive defense-in-depth and does not replace or weaken any
server-side authorization.
```

---

## 8. Supabase dashboard session-timeout recommendation (founder action)

```text
Client-side idle timeout protects an unattended browser tab, but it cannot be the
only control (it can be bypassed by disabling JS or replaying a stolen cookie).
For enforceable, server-side session expiry, configure project-level Supabase Auth:

  Supabase Dashboard -> Authentication -> Sessions (labels may vary by version):
    - Inactivity timeout (time-out idle sessions): 30 minutes (or founder value)
    - Time-box user sessions (absolute max session length): 8-12 hours

These are project-level Auth settings, NOT DB migrations/RLS, and CANNOT be
changed from application code here — they require the founder to set them in the
dashboard. (Note: session timebox/inactivity may be a paid-plan feature depending
on the project's tier; confirm in the current dashboard.) This was NOT changed by
this task; it remains a pending founder dashboard action.

Defense-in-depth summary:
  Layer 1: middleware + layout is_admin server checks (in place).
  Layer 2: client AdminIdleTimeout idle + absolute sign-out (this change).
  Layer 3: Supabase Auth inactivity/timebox settings (founder dashboard, pending).
```

---

## 9. What did not change

```text
- DB schema, migrations, RLS, Supabase/Edge functions. Mobile repo.
- middleware.ts, admin API route semantics, admin authorization, service-role
  server-only usage. Admin action behavior.
- Marketing UI/copy (only app/icon.png asset changed). app/apple-icon.png
  (kept app-style). Dependencies (none added). tailwind/theme/globals.
```

---

## 10. Validation results

```text
npx tsc --noEmit  -> PASS
npm run lint      -> PASS (eslint ., 0 errors/warnings)
npm run build     -> PASS (Compiled successfully; /icon.png route emitted)
git diff --check  -> clean

Checks:
- Rendered head: <link rel="icon" href="/icon.png" sizes="214x214"> (plain mark;
  cornerAlpha 0 = transparent, centerAlpha 255 = glyph present).
- AdminIdleTimeout imported + rendered only in the authenticated layout branch
  (line after `if (!user) return ...`); not on /admin/login or marketing.
- Server guard (getUser + is_admin + service role + redirect) intact.
- No changes under supabase/migrations, middleware.ts, /functions/, *.sql, or
  /api semantics.

Local idle test: not run with a committed shortened value (would require editing
production constants). Logic is straightforward and unit-reviewable; founder can
verify by temporarily lowering IDLE_TIMEOUT_MS locally (do not commit).

Mobile repo (bantle): only pre-existing builds/*.apk deletions; branch unchanged.
```

---

## 11. Files changed

```text
app/icon.png                              (plain transparent mint-mark favicon)
components/admin/AdminIdleTimeout.tsx      (new; idle + absolute sign-out, warning)
app/admin/layout.tsx                       (import + mount AdminIdleTimeout in
                                            authenticated branch only)
reports/WEB_ADMIN_SESSION_TIMEOUT_AND_FAVICON_REPORT.md   (this report)
```

No `.env`, logs, credentials, build artifacts, screenshots, backups, or unrelated
files included.

---

## 12. Risks / blockers

```text
- Low risk, reversible. Client idle timeout is additive; server gating untouched.
- IMPORTANT: client-side idle timeout is NOT full protection. The enforceable
  control is the Supabase Auth inactivity/timebox setting (founder dashboard,
  pending; may be plan-dependent).
- localStorage-based absolute start is an approximation (per-browser, resettable
  by clearing storage); it is defense-in-depth, not an authoritative session age.
- Favicons are cached hard by browsers; a hard refresh is needed to see the plain
  mark.
- apple-icon.png intentionally stays app-style (transparent apple-touch icons
  look poor on iOS home screens).
```

---

## 13. Next recommended step

```text
1. Founder configures Supabase Dashboard -> Authentication -> Sessions
   (inactivity timeout ~30m, timebox ~8-12h) to make expiry server-enforced.
2. Founder hard-refreshes to confirm the plain tab favicon, and verifies admin
   auto sign-out by leaving an admin tab idle (or temporarily lowering the local
   constant; do not commit).
3. Open a PR on feature/trust-verification-admin-queues for review.
```
