# Bantle Web/Admin QA and Security Audit

## 1. Executive summary

- Overall risk level: Ready only after High security dependency and shared Supabase/Edge authorization issues are addressed.
- Launch blockers: no web-only Critical issue was confirmed, but the shared Supabase Edge Function Critical finding in the mobile report affects admin-triggered broadcast/push flows.
- High-risk issues: vulnerable Next.js dependency advisories and shared privileged Edge Function access-control gaps.
- Medium-risk issues: no explicit CSRF/origin checks on mutating admin API routes, and the public verify page can show success based only on URL parameters.
- Low-risk issues: audit action naming for broadcast retry is less explicit than ideal; server logs return/store operational error details.
- Verification status: static review, build, lint, dependency audit, and read-only Supabase metadata checks completed. No admin mutation routes were called.

## 2. Commands run and results

| Command | Result |
| --- | --- |
| `git status --short` | Passed. Existing unrelated dirty/untracked files are present: `.gitignore` modified, `CHATGPT_WEB_REPO_HANDOFF.md`, `database-backups/`. They were not touched. |
| `npm run build` | Passed. |
| `npm run lint` | Passed. |
| `git diff --check` | Passed before report creation. |
| `npm audit --omit=dev` | Failed: 1 high vulnerability in `next` and 1 moderate vulnerability in `postcss`. `package.json:18` pins `next` to `14.2.35`. |
| `rg -n "console\\.log\|console\\.warn\|console\\.error" app components lib middleware.ts` | Completed. Found server-side error logging in admin routes; no client secret values printed. |
| `rg -n "service_role\|SUPABASE_SERVICE_ROLE\|secret\|password\|token\|authorization\|private" . --glob '!node_modules' --glob '!.git' --glob '!.next' --glob '!database-backups'` | Completed. Found expected service-role server helper and auth/token handling references; no env values printed. |
| `rg -n "TODO\|FIXME\|HACK\|XXX\|BUG" app components lib` | Completed. No blocker from TODO markers found. |
| `rg -n "requireAdmin\\(\|createAdminSupabaseClient\|adminSupabase\|serviceRole\|NextResponse\\.json" app lib` | Completed. Reviewed admin API protection patterns. |
| Supabase MCP read-only metadata queries | Completed. Checked RLS status, policies, constraints, indexes, and admin-only table policy posture. No production data was mutated. |

## 3. Files/areas reviewed

| Area | Files reviewed | Coverage | Notes |
| --- | --- | --- | --- |
| Admin auth/middleware | `middleware.ts`, `lib/admin-auth.ts`, `lib/admin-supabase-route.ts`, `lib/admin-supabase-server.ts` | High | Middleware and server route helper both enforce admin checks. |
| Admin APIs | Users/reports/listings/deals/audit/broadcasts/dashboard API routes | High for Phase 5-9 routes | Mutating routes call `requireAdmin`; CSRF/origin hardening remains a medium finding. |
| Admin UI | `app/admin/page.tsx`, listings/deals/audit/broadcast clients/components/nav | Medium-high | Operational modules are present; no mutation buttons found on audit. |
| Broadcast safety | `app/admin/api/broadcasts/*`, `lib/admin-broadcasts.ts`, `app/admin/broadcasts/BroadcastsClient.tsx` | High | Server validates confirmation, reason, idempotency, URL and marketing wording blocks. |
| Audit log | `app/admin/api/audit/route.ts`, `components/admin/AuditPayloadViewer.tsx` | Medium-high | Payloads are collapsed and display-redacted. |
| Public auth pages | `app/(marketing)/verify/VerifyClient.tsx`, `app/(marketing)/reset-password/ResetPasswordClient.tsx` | Medium | Reset password is stronger than verify page. |
| Config/dependencies | `package.json`, Next/Tailwind config, audit output | Medium | Build/lint pass; audit has High Next.js advisory. |

## 4. Critical launch blockers

| ID | Severity | Title | Evidence | Impact | Repro/Verification | Recommended fix |
| --- | --- | --- | --- | --- | --- | --- |
| W-CRIT-01 | Critical | No web-only Critical finding confirmed | Reviewed admin middleware at `middleware.ts:16-68`, API guard helper at `lib/admin-auth.ts:26-64`, and service-role helper at `lib/admin-supabase-server.ts:23-43`. Mutating reviewed admin routes call `requireAdmin`. | No direct web-only Critical issue was confirmed. However, shared privileged Edge Functions are a Critical launch blocker in `QA_SECURITY_AUDIT_MOBILE.md` because admin broadcast/push routes invoke those functions. | Needs dynamic non-admin tests for every admin API route. | Fix shared Edge Function authorization before launch, then run non-admin API access tests. |

## 5. High severity findings

| ID | Severity | Title | Evidence | Impact | Repro/Verification | Recommended fix |
| --- | --- | --- | --- | --- | --- | --- |
| W-HIGH-01 | High | Web dependency audit reports vulnerable Next.js advisories | `package.json:18` pins `next` to `14.2.35`, and `package.json:28` pins `eslint-config-next` to the same version. `npm audit --omit=dev` reported a High vulnerability group for `next` plus a moderate `postcss` advisory. | The public/admin app may be exposed to Next.js vulnerabilities including request handling, cache, middleware/proxy, or SSRF-related advisories depending on deployed configuration. | Re-run `npm audit --omit=dev`. Review advisories against the deployed Next.js version. | Upgrade Next.js and `eslint-config-next` to a patched compatible version, then run `npm run build`, `npm run lint`, and a full admin/public smoke pass. Do not use a breaking force upgrade without testing. |
| W-HIGH-02 | High | Shared Edge Function authorization gap affects admin broadcast/push operations | Web broadcast send inserts a broadcast and invokes the dispatcher at `app/admin/api/broadcasts/route.ts:153-197`; retry invokes dispatcher at `app/admin/api/broadcasts/[id]/retry/route.ts:50-62`. The dispatcher itself lacks an in-function service-role/admin authorization check, documented as M-CRIT-01 in the mobile/Supabase report. | Even though web routes are admin-only, the underlying Supabase function can potentially be invoked outside the admin web route if a caller has a valid Supabase JWT/anon key and a broadcast id. | Needs staging verification. Attempt dispatcher invocation with a non-admin token and confirm it is rejected before dispatch. Do not test on production with mutating payloads. | Add in-function service-role/internal-secret authorization to the dispatcher and other privileged Edge Functions. Keep web `requireAdmin` checks as the outer layer. |

## 6. Medium severity findings

| ID | Severity | Title | Evidence | Impact | Repro/Verification | Recommended fix |
| --- | --- | --- | --- | --- | --- | --- |
| W-MED-01 | Medium | Mutating admin APIs rely on admin cookies without explicit CSRF/origin validation | `requireAdmin` validates the session/admin profile and returns a service-role client at `lib/admin-auth.ts:26-64`, but it does not validate `Origin`, `Referer`, or a CSRF token. State-changing routes such as broadcast POST use only `requireAdmin` plus body validation at `app/admin/api/broadcasts/route.ts:108-234`; listing close and deal terminate follow the same server-side guard pattern. | If deployed cookies are sent cross-site and browser/SameSite behavior is not sufficient, a malicious site could attempt to trigger admin POSTs from an authenticated admin browser. JSON content-type and SameSite may mitigate this, but static review cannot prove deployment cookie posture. | Needs dynamic/browser verification. Inspect Supabase SSR cookie `SameSite` and attempt cross-site POST in staging. | Add an explicit server-side origin allowlist for all mutating `/admin/api/*` routes and/or a CSRF token tied to the admin session. Keep `requireAdmin` as the authorization check. |
| W-MED-02 | Medium | Public email verify page can show success based only on URL parameters and does not strip token/hash params | `VerifyClient` treats presence of `token_hash`, `token`, `access_token`, `type`, or `code` as success at `app/(marketing)/verify/VerifyClient.tsx:13-38`. It reads hash tokens at `app/(marketing)/verify/VerifyClient.tsx:21-34` but does not call Supabase verification or strip the URL. The reset-password page does strip auth params before processing at `app/(marketing)/reset-password/ResetPasswordClient.tsx:71-84` and verifies/sets the session at `app/(marketing)/reset-password/ResetPasswordClient.tsx:88-104`. | Users can see a false “email confirmed” state by visiting `/verify?type=signup`, and real token/hash values may remain visible in browser history or screenshots. This may not change server auth state, but it is confusing and leaks token-bearing URLs longer than needed. | Visit `/verify?type=signup` and confirm it shows the verified state. Test a real Supabase email confirmation flow in staging and verify whether the server consumes the token before this page loads. | Mirror reset-password hygiene: verify the token/code where applicable or display a neutral “check the app” state until Supabase confirms; strip auth params from the visible URL immediately. |
| W-MED-03 | Medium | Broadcast retry is audited as `broadcast_sent` instead of a distinct retry action | Retry route logs `action_type: "broadcast_sent"` with `payload.retry = true` at `app/admin/api/broadcasts/[id]/retry/route.ts:70-97`. | The audit log preserves the retry in payload, but filtering by action type cannot distinguish first sends from retries. This weakens operational review after broadcast incidents. | Open `/admin/audit` and filter `broadcast_sent`; retry and initial send rows share the action type. | Add `broadcast_retried` to the admin action type documentation/union and use it for retry rows, or update audit UI labels to surface `payload.retry` prominently. |
| W-MED-04 | Medium | Server error responses can expose backend error messages to admins | Broadcast create returns `insertError?.message` to the browser at `app/admin/api/broadcasts/route.ts:188-191`; other admin routes follow similar patterns. | Admin-only exposure is less sensitive than public exposure, but raw database errors can reveal schema details and make logs/UI noisy. | Trigger a controlled validation/DB error in staging and inspect the JSON error body. | Return friendly generic errors to the client with a correlation id; keep detailed DB errors server-side. |

## 7. Low severity / polish findings

| ID | Severity | Title | Evidence | Impact | Repro/Verification | Recommended fix |
| --- | --- | --- | --- | --- | --- | --- |
| W-LOW-01 | Low | Test broadcast user fallback UUID is embedded server-side | `lib/admin-broadcasts.ts:3-5` defines the confirmation phrase and fallback test-user UUID; `getTestBroadcastUserId` prefers `BANTLE_BROADCAST_TEST_USER_ID` at `lib/admin-broadcasts.ts:32-35`. | This is server-only in reviewed imports, but it hardcodes a real user identifier into source and can become stale. | Search imports for `BROADCAST_TEST_USER_FALLBACK`; ensure it is never imported into a client component. | Require `BANTLE_BROADCAST_TEST_USER_ID` in production and fail preview if missing, or keep the fallback only in non-production. |
| W-LOW-02 | Low | Dashboard exposes latest admin display/email in aggregate API | Dashboard API is admin-only and returns latest admin action admin display/email at `app/admin/api/dashboard/route.ts:495-519`. | This is acceptable for the sole admin/operator, but it is still PII in an aggregate endpoint. | Confirm `/admin/api/dashboard` is inaccessible to non-admin users. | Keep as-is if intentional; otherwise show display name only or truncate email consistently. |
| W-LOW-03 | Low | Broadcast UI defaults to all eligible users | Product correction explicitly requested all-user broadcasts be available; the UI supports strong confirmation and server validation. This is not a current bug, but it increases operator blast radius. Server-side safeguards live at `app/admin/api/broadcasts/route.ts:236-345`. | Admin mistake could reach all eligible users, though typed confirmation and preview counts reduce risk. | Open `/admin/broadcasts` and verify confirmation phrase/count appears before send. | Keep confirmation and incident-only validation. Consider a non-production environment banner or requiring a fresh preview immediately before send. |

## 8. Security findings by OWASP category

| OWASP category | Status |
| --- | --- |
| Broken Access Control | Web admin routes reviewed use middleware and `requireAdmin`. Shared Edge Function access control remains a confirmed blocker in the Supabase layer. |
| Cryptographic Failures | No web crypto misuse found. Reset password strips and verifies tokens; verify page needs improvement. |
| Injection | No SQL injection found in reviewed admin APIs; Supabase query builder is used. Payload JSON is rendered as text inside `<pre>`, not HTML. |
| Insecure Design | Confirmed medium: CSRF/origin checks are not explicit for high-impact admin POSTs. |
| Security Misconfiguration | Confirmed high dependency advisory for Next.js. Service-role helper correctly throws if imported client-side at `lib/admin-supabase-server.ts:13-21`. |
| Vulnerable and Outdated Components | Confirmed W-HIGH-01 and `postcss` moderate advisory. |
| Identification and Authentication Failures | Middleware and route helper both validate admin status. Public verify page can mislead about verification state. |
| Software and Data Integrity Failures | Broadcast idempotency is present at `app/admin/api/broadcasts/route.ts:133-151`. Listing/deal data integrity findings are in the mobile/Supabase report. |
| Security Logging and Monitoring Failures | Audit logging exists for admin mutations. Retry action naming should be clearer. |
| SSRF | Needs dependency-level review due Next.js advisory; no custom SSRF sink found in reviewed app code. |

## 9. Web/admin-specific findings

- Admin auth: middleware gates `/admin` routes at `middleware.ts:16-68`, and API routes use `requireAdmin` at `lib/admin-auth.ts:26-64`. No missing `requireAdmin` was confirmed in the reviewed admin mutation routes.
- Service-role boundary: `lib/admin-supabase-server.ts:13-21` prevents browser import, and service-role env var is read only server-side at `lib/admin-supabase-server.ts:23-43`.
- Destructive actions: listing close, deal terminate, broadcast send/retry all include server-side validation and audit paths in reviewed code.
- Broadcast safety: confirmation phrase, idempotency key, reason, URL block, and marketing/re-engagement word block are enforced server-side at `app/admin/api/broadcasts/route.ts:236-345`.
- Audit log: payload display is collapsed by default and redacts keys matching token/secret/key/password/authorization/private at `components/admin/AuditPayloadViewer.tsx:6-63`.
- Dashboard: dashboard API is admin-only and returns aggregates/latest action summaries only at `app/admin/api/dashboard/route.ts:28-60` and `app/admin/api/dashboard/route.ts:495-548`.

## 10. Supabase/RLS/Edge Function findings relevant to web/admin

- Admin-only tables `admin_actions`, `broadcasts`, and `broadcast_recipients` have RLS enabled and no normal-user policies in read-only metadata.
- Supporting indexes exist for `admin_actions`, `broadcasts`, `deals`, and `listings`; the old `broadcasts_all_eligible_rate_limit_idx` remains but is harmless after product removal of the 24-hour limit.
- Notification CHECK includes `broadcast_incident`, `listing_closed`, and `deal_terminated`.
- Shared Edge Function authorization remains the main Supabase issue and is documented as M-CRIT-01.

## 11. Regression risk areas

- Admin POST routes after adding CSRF/origin validation.
- Broadcast send/retry idempotency and dispatcher authorization.
- Audit payload redaction after adding new action types.
- Dashboard counts if table schemas change.
- Public verify/reset flows after token handling cleanup.
- Next.js upgrade regression in middleware, app router, and Supabase SSR cookies.

## 12. Recommended fix order

1. Must fix before launch: shared Edge Function authorization gap from `QA_SECURITY_AUDIT_MOBILE.md`.
2. Must fix before launch or immediately before public admin exposure: W-HIGH-01 Next.js dependency advisories.
3. Should fix before launch: W-MED-01 explicit CSRF/origin protection for admin mutation routes.
4. Should fix before launch: W-MED-02 verify page token handling and false success state.
5. Can defer with docs: W-MED-03 retry action naming and W-MED-04 admin-facing DB error details.
6. Can defer: Low polish findings.

## 13. Things not verified

- No mutating admin API calls were made.
- Non-admin browser/API access was not dynamically tested.
- Cookie `SameSite`/CSRF behavior was not verified in a deployed browser environment.
- Next.js advisories were not mapped one-by-one to the deployed Vercel config.
- Public legal/privacy pages were not reviewed line-by-line against legal requirements.
- Vercel environment variables and runtime headers were not inspected.
