# Web/admin security remediation — 3 October 2026

Scope: audit A04 (admin MFA), A05 (web dependencies), A15 (listing queries/input validation), A16 (script CSP). No payment, escrow, or new marketplace features. Branch `fix/backend-audit-remediation`, starting from `3c5e141`.

## Plan and implementation

### A04: verified MFA before privileged access

- Active administrator means `is_admin`, no soft deletion, no permanent ban, no active temporary ban. Shared check now protects proxy, layout, dashboard and API authorization consistently.
- `auth.getUser()` validates the session and `auth.getClaims()` verifies JWT claims; only `aal2` passes privileged checks. Client-controlled metadata is never used.
- `requireAdmin` refuses AAL1 before constructing the service client. The dashboard independently checks AAL2 before service-role metrics (layouts may execute concurrently with pages).
- `/admin/mfa` independently permits only active admins at AAL1 and exposes only Auth enrollment/challenge. Existing verified authenticators are challenged; enrollment is explicit, removes only abandoned unverified TOTP factors, verifies a fresh code, and navigates with a full load to discard AAL1 router state. MFA errors stay generic. Setup keys stay in component memory and are never logged.
- Protected pages moved to `app/admin/(protected)` without changing public URLs. Login and MFA have a bare layout so signed-out and AAL1 sessions cannot enter the protected shell by layout fallback.
- Proxy refresh cookies are preserved on redirects and forwarded to Server Components. Admin APIs return 401/403 JSON rather than login HTML.
- Lost-factor recovery is documented in README: another enrolled factor or identity-checked project-owner recovery using Auth admin tools, revoke sessions and record recovery, then re-enroll. No insecure bypass endpoint or password-reset exemption.

### A15: bounded batch listing summary

- Replace up to 50 availability RPCs plus a potentially truncated deals query with one `admin_listing_summary(p_listing_ids uuid[])` call.
- RPC contract: service role only, max 50 IDs, returns `listing_id`, `slots_available`, `pending_deal_count`, `active_deal_count`. Availability follows canonical slot calculation. Active count must preserve all status-active rows, including previously terminated active deals (backend owner notified).
- Failed summary query returns a retryable 500 rather than misleading zero counts.
- Shared finite safe-integer pagination rejects malformed/overflowing/negative offsets across listings, deals, users, reports and user-detail lists. Maximum page is 100,000; variable page size stays bounded at 50. Existing fixed-size endpoints retain their page sizes.

### A16: nonce-based script execution

- Next 16 `proxy.ts` creates a fresh cryptographically random nonce, overwrites inbound nonce/CSP headers, forwards matching request CSP, and returns matching response CSP.
- Production script policy uses nonce + `strict-dynamic`; removes `unsafe-inline` and `unsafe-eval` for scripts. Development alone permits eval for tooling. Existing inline CSS remains permitted for React styles and animations.
- Root layout requests headers, opting HTML into dynamic rendering. All HTML is private/no-store to prevent cached nonce mismatch/reuse. Next runtime scripts, custom first-paint code, and JSON-LD receive the same nonce.
- Tradeoff: public HTML no longer gets static shared caching. Static images/fonts/JS remain cacheable. The site remains fully crawlable; this does not require JavaScript for public content.

### A05: supported security updates

- Next and eslint-config-next pinned at 16.3.8. Next 16.2 patches do not fix all reported issues (including next/og); stayed on supported major 16.
- Supabase JS pinned at 2.117.2; SSR pinned at existing compatible 0.10.3. Vitest 4.1.11; PostCSS 8.5.28 override for all consumers. Other packages updated within declared compatible ranges and committed lockfile.
- npm 10 had a peer-resolution Arborist crash during updating. A clean lock was generated with npm 11.21.0, then clean install verified; npm 10 `ci --dry-run` now succeeds. No force/legacy-peer-deps bypass or unsupported major framework upgrade.
- `npm audit --omit=dev`: **0 vulnerabilities**. CI now rejects new high/critical production advisories.
- Full `npm audit`: **7 high entries**, all due to one unpatched upstream `braces@3.0.3` issue [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). Affected paths: Tailwind 3 → chokidar/micromatch → braces, and eslint-config-next → eslint plugin → fast-glob → micromatch → braces. All are development/build dependencies processing repository-controlled glob patterns, not application-request inputs. Do not build untrusted PR source with privileged environment access. The vulnerable upstream implementation is **not patched**; no upstream fixed release exists as checked today. This residual is disclosed, not hidden by overriding audit output or claiming zero total findings. Moving to Tailwind 4 solely to erase advisory counts would be unrelated redesign/compatibility work and would not necessarily eliminate lint's path.

## Verification

- 16 test files, 42 tests passed. Added authorization refusals before service-client construction; active/soft-deleted/banned/AAL1/AAL2 checks; signed-out/API/proxy routing; nonce spoofing/no-store; MFA enrollment and existing-factor protection; pagination; batch summary call count.
- TypeScript and ESLint passed with no errors or warnings.
- Production build passed on Next 16.3.8 (all expected URLs preserved).
- Actual production server at local port 3417: `/`, `/about`, `/admin/login`, `/reset-password`, `/verify` return 200; every script tag has the corresponding response nonce; each request gets a new nonce; HTML has private/no-store. `/admin` and `/admin/mfa` signed-out redirect to login; `/admin/api/listings` signed-out returns JSON 401.
- Secret scan and `git diff --check` pass.
- Enrollment/challenge browser behavior is tested with mocked Auth responses; no production admin factor or session was altered during implementation. Parent release review should confirm real Supabase TOTP enabled and migration ordering.

## Release ordering and review boundary

1. Deploy the bounded listing-summary RPC first (or coordinate it in the same release window).
2. Deploy web with enrollment/challenge and all AAL2 checks.
3. Apply database AAL2 guards once enrollment is available; no legacy admin RPC should remain AAL1-accessible.
4. Smoke-test public/login routes and anonymous API refusals in production. Existing admins will be prompted to enroll/challenge on next request.

Implementation is local at time of this report. Parent owns fresh review, commits, GitHub release and production confirmation; do not infer deployment from this file.

Official references: [Supabase TOTP MFA](https://supabase.com/docs/guides/auth/auth-mfa/totp), [Next CSP](https://nextjs.org/docs/app/guides/content-security-policy).

## Resume verification — 12 October 2026

Reconstructed the interrupted working tree before edits. Web changes remain local and uncommitted; latest GitHub production deployment is still commit `3c5e141` (deployment `6182979110`). The saved matcher repair was present but had not received its final HTTP verification.

- Closed the prior independent review blocker: the proxy excludes precise static endpoints/framework asset directories, not arbitrary filename extensions. All 17 actual Next matcher cases pass. Added `scripts/check-csp-http.mjs`, which verifies actual production HTTP routing rather than calling the proxy directly. On a fresh production build at `http://127.0.0.1:3418`, `/admin/users/synthetic.png` redirects with CSP; `/unknown.svg` returns HTML 404 with CSP. Ten normal/adversarial paths have fresh nonces, private/no-store responses, and matching nonce on every emitted script. Forged incoming `x-nonce` is ignored. Anonymous admin APIs remain JSON 401.
- Retention migration compatibility: existing web runtime handles null listing/profile joins. Updated TypeScript contracts for nullable deal listing and conversation participants/listing. Added a rendered regression preserving the survivor's terms and message evidence after host/listing deletion, with no invalid `/null` links. Existing FK names must remain stable for PostgREST joins.
- Fresh dependency audit exposed `postcss-selector-parser` [GHSA-rj75-hqrm-r3gf](https://github.com/postcss/postcss-selector-parser/security/advisories/GHSA-rj75-hqrm-r3gf). Targeted override to patched `7.1.6`; inspected upstream changelog (v7 changes insertion-during-iteration semantics), verified production compilation and byte-identical generated CSS before/after (`234971d39f2f98103a145616c64f739cc2bceb6dace3f7c4e08799248bdd4064`). No framework/Tailwind major upgrade. Full audit returns the same seven build-only braces findings described above; production audit remains zero.
- Final self-verification: **17 test files / 60 tests pass**, typecheck, lint, build, secret scan and diff check pass. Clean `npm ci --ignore-scripts` succeeded using the lockfile. Fresh HTTP smoke passed all ten paths. This is self-verification, pending independent review and web release.

### A11 production Auth configuration resolved

Using the existing private Management API token, read only the relevant flags: `password_hibp_enabled=false`, `mfa_totp_enroll_enabled=true`, `mfa_totp_verify_enabled=true`. Submitted a single-field Auth config PATCH `{ "password_hibp_enabled": true }`; the existing project accepted it (HTTP 200). A separate fresh GET confirmed all three flags **true**. No plan upgrade, billing change, signing key change, human-factor enrollment, or other Auth setting change was made.

The provider-side leaked-password check is now enabled in production. This does not claim that existing passwords were reset or that any customer sign-up/password flow was exercised. Admin TOTP enrollment/verification support is confirmed enabled; user enrollment remains their own action. Safe local independent readback helper: `node /tmp/bantle-auth-flags-readback.cjs` prints only these three boolean flags, loading the token privately from the mobile repository environment. The temporary helper is not a deployed artifact.

References checked on resumption: [Supabase password security](https://supabase.com/docs/guides/auth/password-security), [Auth config PATCH API](https://supabase.com/docs/reference/api/v1-update-auth-service-config), and the Supabase changelog. The current password-security docs describe the Pro-plan requirement; this project's existing configuration accepted the setting without a billing operation.
