# Bantle Combined QA and Security Summary

## 1. Overall launch readiness

Not ready: blockers found.

The product is functionally broad and recent Phase 5-9 admin work is present, but three security/data-integrity issues should be fixed before launch:

- privileged Supabase Edge Functions need explicit service-role/admin/internal-secret authorization;
- admin-closed listings can be reopened by listing owners;
- deal participants can directly update too many deal fields through the client RLS policy.

Web/admin build and lint pass. Mobile typecheck passes, but mobile lint and dependency audits still need cleanup.

## 2. Top 10 issues across both repos

| Rank | Severity | Repo | Area | Issue | Recommended action |
| --- | --- | --- | --- | --- | --- |
| 1 | Critical | Mobile/Supabase | Edge Functions | Privileged service-role functions do not enforce service-role/admin authorization inside the function. | Add explicit role/secret/admin checks before privileged work in `send_push_notification`, `broadcast_push_dispatcher`, `milestone_checkin_dispatcher`, and `account_hard_delete_dispatcher`. |
| 2 | High | Mobile/Supabase + Web/Admin | Listings | Listing owners can reopen admin force-closed listings. | Add DB trigger/policy protection for admin-closed rows and hide mobile Reopen for rows with `closed_by`/`closed_at`. |
| 3 | High | Mobile/Supabase | Deals | Deal participants can update arbitrary deal fields under a broad RLS policy. | Enforce deal transitions and immutable/admin-only fields with RPCs or triggers. |
| 4 | High | Web/Admin | Dependencies | `npm audit --omit=dev` reports a High Next.js vulnerability group for `next@14.2.35`. | Upgrade Next.js to a patched compatible version and regression-test middleware/admin flows. |
| 5 | Medium | Web/Admin | Admin mutation safety | Mutating admin APIs lack explicit CSRF/origin validation. | Add origin allowlist and/or CSRF token for state-changing `/admin/api/*` routes. |
| 6 | Medium | Web/Public | Verify flow | `/verify` can display success based only on URL params and does not strip token/hash params. | Verify/consume confirmation params or show neutral state; strip auth params immediately. |
| 7 | Medium | Mobile | Dependencies | `npm audit --omit=dev` reports 18 moderate advisories in mobile dependency chains. | Plan dependency upgrade pass; do not force-upgrade without full Expo regression. |
| 8 | Medium | Mobile | Release verification | `npm run lint` fails with 12 errors and 27 warnings. | Fix lint errors and triage warnings before release. |
| 9 | Medium | Mobile/Supabase | Performance | Notification history query lacks a general `(user_id, created_at desc)` index. | Add index if staging `EXPLAIN` confirms sequential scan at realistic volume. |
| 10 | Medium | Mobile/Web | Privacy/logging | Production logs include user/deal identifiers and raw backend error messages in some paths. | Sanitize production logs and return generic user/admin-facing errors with correlation ids. |

## 3. Launch blockers

- M-CRIT-01: Privileged Edge Functions can be invoked without an in-function service-role/admin/internal authorization check.
- M-HIGH-01: Admin-closed listings can be reopened by the listing owner.
- M-HIGH-02: Deal participant UPDATE policy is overbroad and can corrupt lifecycle/admin fields.
- W-HIGH-01: Next.js dependency audit has a High advisory group. Treat as a release blocker if the admin/public web app will be internet-exposed before upgrading.

## 4. Security posture summary

- Access control: Admin web routes use middleware and `requireAdmin`, and reviewed admin APIs are server-side guarded. The weakest access-control boundary is Supabase Edge Functions using service-role clients without caller role/secret checks.
- Auth/session: Mobile auth gating exists for onboarding/profile/banned/soft-delete states, and admin SSR auth checks are present. Dynamic testing is still needed for banned/deleted edge cases and non-admin access.
- RLS: RLS is enabled on key tables. Admin-only tables have no normal-user policies. However, listings and deals have overbroad UPDATE permissions for owner/participant lifecycle fields.
- Admin service role: Web service-role client is server-only with a browser import guard. Edge Functions also use service-role safely from an environment perspective, but need explicit caller authorization.
- Notifications/push: Mobile notification response loop fixes are present; broadcast payloads now show title/body; Android channels are registered. Push dispatch functions need stronger authorization.
- Privacy/compliance: Incident broadcasts are incident-only with confirmation/reason/audit. Analytics autocapture/consent, log identifier retention, and public verify-token handling need follow-up verification.

## 5. Suggested next Codex implementation prompts

| Priority | Prompt title | Scope |
| --- | --- | --- |
| 1 | Harden Supabase Edge Function authorization | Add shared helper to require service-role JWT or internal secret for cron/webhook functions; require admin/internal invocation for broadcast dispatcher; update web invocation headers if needed; deploy and verify without sending pushes. |
| 2 | Prevent reopening admin-closed listings | Add additive migration/trigger preventing non-admin clients from reopening listings with `closed_by`/`closed_at`; update mobile UI copy; update types; verify existing user-close/reopen still works. |
| 3 | Restrict deal lifecycle updates | Add DB trigger or RPC-backed deal transition model; block client writes to admin termination fields and immutable deal terms; regression-test propose/accept/cancel/complete/dispute/admin terminate. |
| 4 | Upgrade Next.js safely | Update `next`/`eslint-config-next`, run build/lint, smoke middleware/admin/public auth pages, and document any breaking changes. |
| 5 | Add CSRF/origin checks to admin mutations | Add shared admin mutation guard for POST/PATCH/DELETE routes; allow same-origin admin requests; regression-test all admin actions. |
| 6 | Fix public verify token handling | Strip auth params, verify token/code where applicable, avoid false success state, and smoke real Supabase email confirmation flow. |
| 7 | Clear mobile lint and audit debt | Fix `react/no-unescaped-entities` errors, triage hook dependency warnings, and plan Expo/Supabase dependency upgrades. |

## 6. Final recommendation

Do not launch publicly until the Edge Function authorization gap, admin-closed listing bypass, and deal UPDATE policy are fixed. After those are addressed, Bantle can move into a final staging regression pass focused on admin mutations, listing/deal lifecycle transitions, notification routing, and non-admin access denial. The web/admin implementation is structurally sound, but dependency and CSRF hardening should be completed before broad exposure.
