# Pre-Launch Fix Recon 6 — Web/Admin Security Batch

Date: 2026-05-25  
Mode: read-only recon, except this report file.

## 1. Executive Summary

Current inspection confirms all three web/admin findings are still real, but they should not all be bundled together.

Recommended next implementation batch: bundle `BANTLE-WEB-005` and `BANTLE-WEB-006` only.

- `BANTLE-WEB-005` CSRF/origin guard is a focused admin API hardening change. The privileged mutation routes already centralize through `requireAdmin(request)` in `lib/admin-auth.ts`, so a same-origin guard can be added centrally, with one extra logout route adjustment.
- `BANTLE-WEB-006` verify page false-success handling is isolated to the public `/verify` client. The current page claims success from URL params alone and does not strip auth params.
- `BANTLE-WEB-004` Next.js dependency advisory should be split into its own dependency-upgrade pass. The app is already on latest `14.x` (`14.2.35`), and `npm audit` only offers a breaking force fix to `next@16.2.6`.

What should not be bundled: do not combine the Next.js major upgrade with CSRF/verify fixes. It changes framework/runtime surface area and needs a dedicated regression pass for middleware, App Router route handlers, Supabase SSR cookies, and public auth flows.

Tracker context:

- Syed smoke-tested Pre-Launch Fix 6 successfully, so `BANTLE-UX-020` should be marked `VERIFIED` in the next docs/tracker pass.
- `BANTLE-DATA-003` should remain `SHIPPED`, not fully `VERIFIED`, because active to completed still needs a controlled past-`ends_at` test.

No Supabase MCP was used. No production data was queried or mutated.

## 2. Commands Run

| Repo | Command | Result | Notes |
| --- | --- | --- | --- |
| `bantle-web` | `git status --short` | Completed | Pre-existing dirty state: modified `.gitignore`, untracked handoff/recon/audit docs and `database-backups/`. |
| `bantle-web` | `cat package.json` | Completed | `next` is `14.2.35`; `eslint-config-next` is `14.2.35`. |
| `bantle-web` | `node -p "require('./package.json').dependencies?.next || require('./package.json').devDependencies?.next"` | Completed | Printed `14.2.35`. |
| `bantle-web` | package-lock inspection via `rg` and Node parse | Completed | Root and lockfile both resolve `next` and `eslint-config-next` to `14.2.35`. |
| `bantle-web` | `npm audit --omit=dev` | Failed as expected due advisories | Reports `next` high advisory group and `postcss` moderate advisory. Force fix would install `next@16.2.6`, a breaking major upgrade. |
| `bantle-web` | `npm outdated next` | Exit 1 because package is outdated vs latest | Current `14.2.35`, wanted `14.2.35`, latest `16.2.6`. |
| `bantle-web` | `npm view next@14 version --json` | Completed | Latest available Next 14 release is `14.2.35`. |
| `bantle-web` | `npm view eslint-config-next@14 version --json` | Completed | Latest available matching eslint config 14 release is `14.2.35`. |
| `bantle-web` | `rg -n "export async function (POST|PUT|PATCH|DELETE)..." app lib middleware.ts --glob '!node_modules'` | Completed | Found all admin mutation handlers and confirmed no origin/CSRF/content-type header guard in route/helper search. |
| `bantle-web` | `find app/admin/api -name route.ts -print, then sorted` | Completed | 25 admin API route files found; 10 are mutating routes. |
| `bantle-web` | `rg -n "verify|token_hash|type=|email|otp|verifyOtp|exchangeCodeForSession|confirm" app components lib --glob '!node_modules'` | Completed | Located `/verify` and reset-password comparison flow. |
| `bantle-web` | `npm run build` | PASS | Next build succeeded on `14.2.35`; warning: edge runtime on a page disables static generation for that page. |
| `bantle-web` | `npm run lint` | PASS | No ESLint warnings or errors. |
| `bantle-web` | `git diff --check` | PASS | No whitespace errors in tracked diffs. |
| `bantle` | `git status --short` | Completed | Pre-existing untracked mobile recon/handoff/build artifacts; no mobile files edited by this recon. |
| `bantle` | `rg -n "BANTLE-UX-020|BANTLE-DATA-003|BANTLE-WEB-004|BANTLE-WEB-005|BANTLE-WEB-006" BANTLE_PRE_LAUNCH_BUG_TRACKER.md DEEP_UNDERSTANDING.md --glob '!node_modules'` | Completed | Tracker has `BANTLE-DATA-003` `SHIPPED`, `BANTLE-UX-020` `SHIPPED`, web findings `NOT_STARTED`. |

Note: the table abbreviates a long `rg` command for readability. The actual inspection searched for mutation handlers, `NextResponse`, cookies, headers, origin/referer/CSRF, `requireAdmin`, Supabase clients, and service-role usage across `app`, `lib`, and `middleware.ts`.

## 3. Next.js Dependency Finding

### Current Version

- `package.json:18` pins `next` to `14.2.35`.
- `package.json:28` pins `eslint-config-next` to `14.2.35`.
- `package-lock.json:17` and `package-lock.json:4436` confirm `next@14.2.35` is installed.
- `package-lock.json:27` and `package-lock.json:2649` confirm `eslint-config-next@14.2.35` is installed.

`next.config.mjs` is minimal and currently exports an empty config object.

### Audit Result

`npm audit --omit=dev` reports:

- `next` high severity advisory group spanning the installed version range.
- `postcss <8.5.10` moderate advisory under `node_modules/next/node_modules/postcss`.
- The suggested audit fix is `npm audit fix --force`, which would install `next@16.2.6` and is explicitly marked as a breaking change.

`npm outdated next` reports:

- Current: `14.2.35`
- Wanted: `14.2.35`
- Latest: `16.2.6`

`npm view next@14 version --json` confirms there is no newer Next 14 release after `14.2.35`. The same is true for `eslint-config-next@14`.

### Recommended Target

As of this recon, the audit-resolving target is likely `next@16.2.6` plus matching `eslint-config-next@16.2.6`, or the latest patched stable version at implementation time after re-running `npm audit` and `npm view`.

Because this is a major framework upgrade from 14 to 16, it should be a dedicated dependency pass, not bundled with application security code changes.

### Risk

Risk is medium to high for release engineering, even though the app code is structurally simple:

- The app uses App Router route handlers extensively under `app/admin/api/**`.
- `middleware.ts:16-68` gates `/admin/*` and depends on Supabase SSR cookie behavior.
- `lib/admin-supabase-route.ts:25-36` uses `@supabase/ssr` cookie get/set integration.
- Admin pages and API routes rely on server/client boundaries and service-role isolation.
- Public auth pages include `/reset-password` and `/verify` flows that should be smoke-tested after framework upgrade.

### Implementation Notes

Run in the dedicated Next upgrade pass:

- Re-run `npm audit --omit=dev` and `npm outdated next` first.
- Upgrade `next` and `eslint-config-next` together.
- Do not use `npm audit fix --force` blindly without reviewing resulting package changes.
- Run `npm run build`, `npm run lint`, and `git diff --check`.
- Smoke `/`, `/verify`, `/reset-password`, `/admin/login`, middleware redirects, all admin pages, and representative admin API mutations in staging.

Bundle recommendation for `BANTLE-WEB-004`: split. Do not bundle with CSRF/verify.

## 4. Admin Mutation API Inventory

Current central helper evidence:

- `lib/admin-auth.ts:26-65` validates the user and `profiles.is_admin`, then returns a service-role Supabase client.
- `lib/admin-auth.ts` does not inspect `Origin`, `Referer`, `Content-Type`, `Sec-Fetch-*`, or any CSRF token.
- `lib/admin-supabase-server.ts:23-43` constructs the server-only service-role client and correctly throws if imported in a browser context.
- `lib/admin-supabase-route.ts:25-36` creates the user-session Supabase client from request cookies.
- `middleware.ts:16-68` protects `/admin/*` routing, but it is not a CSRF/origin guard for state-changing API calls.

| Route | Method | requireAdmin? | service-role? | Origin/CSRF today? | Risk | Recommended guard |
| --- | --- | --- | --- | --- | --- | --- |
| `app/admin/api/broadcasts/[id]/retry/route.ts:44` | POST | Yes, line 45 | Yes via `requireAdmin` | No | High impact, can retry broadcast dispatch | Same-origin guard; no JSON content-type requirement because this route has no body. |
| `app/admin/api/broadcasts/route.ts:112` | POST | Yes, line 113 | Yes via `requireAdmin` | No | High impact, sends incident broadcast | Same-origin guard; JSON content-type gate is safe because client sends `application/json`. |
| `app/admin/api/deals/[id]/terminate/route.ts:64` | POST | Yes, line 68 | Yes via `requireAdmin` | No | High impact, force-terminates deals | Same-origin guard; JSON content-type gate is safe. |
| `app/admin/api/listings/[id]/close/route.ts:46` | POST | Yes, line 50 | Yes via `requireAdmin` | No | High impact, force-closes listings | Same-origin guard; JSON content-type gate is safe. |
| `app/admin/api/logout/route.ts:10` | POST | No | No, uses user-session client | No | Low security impact, but state-changing cookie/session endpoint | Apply same-origin guard through a shared helper; no JSON content-type requirement. |
| `app/admin/api/platforms/[id]/route.ts:301` | PATCH | Yes, line 305 | Yes via `requireAdmin` | No | High impact, activates/deactivates platform and can fan out notifications | Same-origin guard; JSON content-type gate is safe. |
| `app/admin/api/platforms/route.ts:56` | POST | Yes, line 57 | Yes via `requireAdmin` | No | Medium impact, creates platform metadata | Same-origin guard; JSON content-type gate is safe. |
| `app/admin/api/reports/[id]/resolve/route.ts:35` | POST | Yes, line 39 | Yes via `requireAdmin` | No | High impact, resolves reports and can warn/ban/notify | Same-origin guard; JSON content-type gate is safe. |
| `app/admin/api/users/[id]/ban/route.ts:17` | POST | Yes, line 21 | Yes via `requireAdmin` | No | High impact, bans users and sends notifications | Same-origin guard; JSON content-type gate is safe. |
| `app/admin/api/users/[id]/restore/route.ts:14` | POST | Yes, line 18 | Yes via `requireAdmin` | No | High impact, restores bans/deletion states | Same-origin guard; JSON content-type gate is safe. |

Read-only admin API routes also call `requireAdmin`, but they are GET-only and should not be modified for CSRF. They still benefit from the existing middleware and route-level admin checks.

Client fetch evidence:

- JSON mutation clients already set `Content-Type: application/json`, for example deal terminate, listing close, report resolve, user actions, platform editor, platform activation, and broadcast send.
- Broadcast retry and logout are POSTs without JSON bodies.

## 5. Recommended Admin CSRF/Origin Pattern

### Central Helper Location

Add a shared same-origin guard in `lib/admin-auth.ts` or a small adjacent helper such as `lib/admin-request-guard.ts`.

Recommended minimal structure:

- `isMutationMethod(method)` for `POST`, `PUT`, `PATCH`, `DELETE`.
- `validateSameOriginRequest(request)` returns `null` when allowed or a `NextResponse.json({ error: "Invalid request origin." }, { status: 403 })` when blocked.
- Have `requireAdmin(request)` call this guard before user/profile lookup when `request.method` is mutating.
- Export the same guard for `app/admin/api/logout/route.ts`, because logout does not call `requireAdmin`.

This protects all privileged admin mutations with one central change plus logout.

### Origin Logic

Safest launch pattern:

1. For mutating admin API requests, compare `Origin` to `request.nextUrl.origin` when `Origin` is present.
2. If `Origin` is missing, compare `Referer` origin to `request.nextUrl.origin` when `Referer` is present.
3. Reject mismatches with `403` and sanitized copy: `Invalid request origin.`
4. Decide whether missing both `Origin` and `Referer` is rejected in production. For stricter CSRF protection, reject in production and optionally allow in local development only if needed.

Using `request.nextUrl.origin` avoids hardcoding production, preview, and local origins. It should work for Vercel preview deployments and localhost as long as requests are made from the same displayed origin.

### Content-Type Gate

Current code does not validate content type before `request.json()`.

Recommended minimal pass:

- Add same-origin guard as the core fix.
- Optionally add JSON content-type validation for only the routes that call `request.json()`.
- Do not require JSON content type on `broadcast retry` or `logout`, because they have no JSON body.

If adding content-type in the same pass, use a helper option rather than copying checks into every route, for example `requireAdmin(request, { requireJson: true })` or `requireAdminJsonMutation(request)`. This is safe because all current admin UI JSON mutation fetches already send `Content-Type: application/json`.

### Why Not Double-Submit Token Now

A double-submit/session CSRF token would also be valid, but it requires client state plumbing through admin pages and mutation fetches. The current launch-safe fix is explicit same-origin validation plus optional JSON content-type gating. A custom header or double-submit token can be a later hardening pass if Syed wants defense beyond origin checks.

### Routes Excluded

No mutating admin API route should be excluded from same-origin validation.

Only content-type validation should be route-aware:

- Apply to JSON-body routes.
- Exclude no-body routes: broadcast retry and logout.

### Breakage Risk

Low to medium:

- Same-origin browser admin UI fetches should continue to work.
- Vercel preview and local dev should work if the check uses `request.nextUrl.origin` dynamically.
- It could break any undocumented external script that calls admin mutation endpoints cross-origin or without `Origin`/`Referer`; no current code evidence shows such clients exist.
- If production sits behind a proxy/custom domain that changes perceived origin, smoke test on the actual deployed admin URL before marking verified.

### Tests

Implementation pass should run:

- `npm run build`
- `npm run lint`
- `git diff --check`

Manual/staging smoke:

- Same-origin admin actions still work: platform update, listing close, deal terminate, report resolve, user ban/restore, broadcast preview/send/retry using a safe non-production or controlled test path.
- Cross-origin request with `Origin: https://example.invalid` to a mutating admin endpoint returns `403` before privileged work.
- Logout still works from the admin UI.

## 6. Public Verify Page Finding

### Current Flow

`app/(marketing)/verify/page.tsx:15-20` renders `VerifyClient` inside Suspense.

`app/(marketing)/verify/VerifyClient.tsx:13-19` sets `hasAuthParams` if any of these query params exist:

- `token_hash`
- `token`
- `access_token`
- `type`
- `code`

`app/(marketing)/verify/VerifyClient.tsx:21-34` reads URL hash params and sets `hasHashTokens` if any of these hash params exist:

- `access_token`
- `token`
- `type`

`app/(marketing)/verify/VerifyClient.tsx:36-38` then sets `isVerified = hasAuthParams || hasHashTokens` and renders `VerifiedState` without calling Supabase.

`VerifiedState` at `app/(marketing)/verify/VerifyClient.tsx:41-101` says: `Welcome to Bantle. Your email is confirmed.`

### False-Success Risk

Confirmed from static code: `/verify?type=signup` is enough to render the success state because `type` alone makes `hasAuthParams` true. The page does not verify or consume a token/code.

Other mishandled states today:

- Missing token: neutral only if no auth-looking params exist.
- Invalid token: still success if a token-looking param exists.
- Expired token: still success if a token-looking param exists.
- Already-used token: still success if a token-looking param exists.
- Wrong type: still success because any `type` param is accepted.
- Network/server error: not handled because no network verification happens.
- Redirect/session state: not established or checked.
- Token hygiene: query/hash params are not stripped from the visible URL.

It does not leak raw backend errors today because it never calls the backend, but it does leave token-bearing URLs visible longer than needed.

### Comparison Flow

`app/(marketing)/reset-password/ResetPasswordClient.tsx:71-104` has the stronger pattern:

- Strips auth params from the visible URL with `history.replaceState`.
- Uses `supabase.auth.setSession` for hash access/refresh tokens.
- Uses `supabase.auth.verifyOtp` for query token recovery links.
- Shows error unless session establishment succeeds.

`lib/supabase.ts:15-32` already provides a browser Supabase client with anon key only, `persistSession: false`, `autoRefreshToken: false`, and `detectSessionInUrl: false`. This can be reused by `/verify`.

### Recommended Fix

Mobile/web DB changes are not needed. This is a web-only public page fix.

Recommended `/verify` behavior:

- Add explicit phases: `checking`, `success`, `neutral`, `error`.
- Strip query/hash auth params from the visible URL immediately on mount, before verification work, like reset password does.
- Only render verified success after one of these succeeds:
  - `supabase.auth.verifyOtp({ token_hash, type })` for supported email verification token-hash links.
  - `supabase.auth.exchangeCodeForSession(code)` for code-based redirect links, if current Supabase auth emails use `code`.
  - `supabase.auth.setSession({ access_token, refresh_token })` only when both tokens exist in hash params.
- Do not treat `type` alone as success.
- Do not treat `status`/copy/system text as proof of verification.
- Sanitize all error copy: `This verification link is invalid or expired. Open Bantle and request a new verification email.`
- Avoid displaying raw Supabase errors or token values.

Implementation should confirm the exact Supabase email confirmation redirect shape in staging. If the web page is only an informational fallback after Supabase already consumed the token elsewhere, then the safe product behavior is still not to claim success from params alone. Use neutral copy such as `Open Bantle to finish verification` unless Supabase verification succeeds.

### Safe To Bundle?

Yes, `BANTLE-WEB-006` is safe to bundle with `BANTLE-WEB-005` because it is isolated to the public verify client and reuses existing auth-page patterns. It should not be bundled with the Next.js major upgrade.

## 7. Safe Bundle Recommendation

| Bug ID | Safe to implement now? | Bundle with others? | Why |
| --- | --- | --- | --- |
| `BANTLE-WEB-004` | Yes, but as a dedicated dependency pass | No | The installed `14.2.35` is latest Next 14. Audit fix points to `16.2.6`, a breaking major upgrade. Needs separate regression of framework, middleware, SSR cookies, route handlers, and auth pages. |
| `BANTLE-WEB-005` | Yes | Yes, with `BANTLE-WEB-006` | Central `requireAdmin` pattern makes same-origin guard small and testable. Logout needs one extra shared guard call. No DB or dependency changes required. |
| `BANTLE-WEB-006` | Yes | Yes, with `BANTLE-WEB-005` | Isolated public verify-page fix. Existing reset-password flow and `lib/supabase.ts` provide a local pattern. No DB, admin route, or dependency changes required. |

Recommended next prompt: implement `BANTLE-WEB-005` and `BANTLE-WEB-006` together, mobile tracker/docs update included if needed. Follow immediately with a separate `BANTLE-WEB-004` Next.js upgrade prompt.

## 8. Tracker Update Recommendation

Mobile repo tracker currently shows:

- `BANTLE-DATA-003` at `BANTLE_PRE_LAUNCH_BUG_TRACKER.md:45` and section `BANTLE_PRE_LAUNCH_BUG_TRACKER.md:260` as `SHIPPED`.
- `BANTLE-UX-020` at `BANTLE_PRE_LAUNCH_BUG_TRACKER.md:62` and section `BANTLE_PRE_LAUNCH_BUG_TRACKER.md:516` as `SHIPPED`.
- `BANTLE-WEB-004`, `BANTLE-WEB-005`, and `BANTLE-WEB-006` at `BANTLE_PRE_LAUNCH_BUG_TRACKER.md:46-48` as `NOT_STARTED`.

Next docs/tracker pass should:

- Mark `BANTLE-UX-020` `VERIFIED` because Syed smoke-tested Fix 6 successfully.
- Keep `BANTLE-DATA-003` `SHIPPED`, not `VERIFIED`, with note that active to completed still needs controlled past-`ends_at` verification.
- For the recommended next implementation batch, mark `BANTLE-WEB-005` and `BANTLE-WEB-006` `IN PROGRESS` before code changes and `SHIPPED`, not `VERIFIED`, after implementation.
- Keep `BANTLE-WEB-004` `NOT_STARTED` until the dedicated Next upgrade pass begins.

Do not update historical audit reports as if they were current status; they are evidence snapshots.

## 9. Implementation Prompt Inputs

Use these inputs for the next implementation prompt if Syed chooses the recommended bundle.

Scope:

- Implement only `BANTLE-WEB-005` and `BANTLE-WEB-006`.
- Do not upgrade Next.js or modify package files in this pass.
- Do not run migrations or mutate production data.
- Do not send broadcasts/push/emails.
- Do not change mobile app behavior except tracker/docs if explicitly requested.

`BANTLE-WEB-005` exact work:

- Add a shared same-origin mutation guard in `lib/admin-auth.ts` or `lib/admin-request-guard.ts`.
- Have `requireAdmin(request)` apply the guard automatically for `POST`, `PUT`, `PATCH`, and `DELETE`.
- Apply the same guard to `app/admin/api/logout/route.ts` because it does not call `requireAdmin`.
- Use `request.nextUrl.origin` as the expected origin.
- Validate `Origin` first, then `Referer` fallback.
- Return `403` with sanitized copy such as `Invalid request origin.` for cross-origin requests.
- Do not weaken existing admin/session/profile checks.
- Optionally add JSON content-type validation only to routes that call `request.json()`; do not require JSON on broadcast retry or logout.

Admin mutation routes to smoke:

- `POST /admin/api/broadcasts/[id]/retry`
- `POST /admin/api/broadcasts`
- `POST /admin/api/deals/[id]/terminate`
- `POST /admin/api/listings/[id]/close`
- `POST /admin/api/logout`
- `PATCH /admin/api/platforms/[id]`
- `POST /admin/api/platforms`
- `POST /admin/api/reports/[id]/resolve`
- `POST /admin/api/users/[id]/ban`
- `POST /admin/api/users/[id]/restore`

`BANTLE-WEB-006` exact work:

- Update `app/(marketing)/verify/VerifyClient.tsx`.
- Reuse `createBrowserSupabase` from `lib/supabase.ts` unless implementation finds a better existing helper.
- Strip auth query/hash params immediately with `history.replaceState`.
- Replace param-presence success with real verification/session establishment.
- Never show success for `type` alone.
- Handle missing, invalid, expired, already-used, wrong type, and network/server error states with neutral or sanitized error UI.
- Do not display raw backend errors or token values.

Verification commands:

- `npm run build`
- `npm run lint`
- `git diff --check`
- `git status --short`

Manual/staging smoke checklist:

- `/verify?type=signup` does not show verified success.
- Real email verification link succeeds in staging or controlled dev.
- Invalid/expired/already-used verification link shows a safe error or neutral state.
- Auth params are stripped from the visible URL.
- Admin login still works.
- Same-origin admin mutations still work.
- Cross-origin admin mutation attempt is rejected with `403` before privileged work.
- Logout still works.

Follow-up dedicated prompt for `BANTLE-WEB-004`:

- Re-run audit/outdated commands.
- Upgrade Next.js and matching eslint config to the current patched stable target.
- Run build/lint/diff checks.
- Smoke middleware, admin auth, admin APIs, `/verify`, `/reset-password`, and public pages.
