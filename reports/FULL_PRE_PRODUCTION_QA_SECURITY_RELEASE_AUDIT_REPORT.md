# Bantle — Full Pre-Production QA, Cybersecurity & Release-Readiness Audit

**Date:** 2026-06-27
**Auditor role:** Senior QA + Cybersecurity + Release Engineer + Privacy/DPDP reviewer + Product reliability reviewer
**Audit type:** READ-ONLY. No source, database, RLS, migration, function, storage-policy, or behavior changes were made. Only this report file was written.

> Honesty labels used throughout:
> **PASS** = actually executed and passed · **FAIL** = actually executed and failed ·
> **VERIFIED BY SOURCE** = source/policy/trigger construction strongly supports expected behavior, not runtime-executed ·
> **PENDING RUNTIME** = needs real account/device/session · **PARTIAL** = partial evidence ·
> **NOT TESTED** / **NOT APPLICABLE**.

---

## 1. Executive summary

Bantle's mobile app and web/admin panel show a **mature, defense-in-depth security posture** with no critical (P0) or high (P1) source-level findings. Both repositories build cleanly and are git-clean of unexpected source changes.

Highlights:

- **Mobile** uses an anon/publishable Supabase key only (no service-role key shipped), encrypted `SecureStore` session storage, and privacy-safe `__DEV__`-gated logging.
- **Database** enforces RLS across all user tables, blocks profile self-escalation at *both* the column-grant and trigger layers, keeps identity selfies in a private bucket readable only by service-role/admin, and routes privileged transitions through `SECURITY DEFINER` RPCs.
- **Web/admin** gates `/admin/*` in middleware (validated JWT + `is_admin`), calls `requireAdmin` at the top of every admin API route with same-origin CSRF protection, keeps the service-role key strictly server-only, ships strong security headers/CSP, and enforces an admin idle timeout (30 min idle / 12 h absolute).

The findings that remain are **Medium/Low/Info** and are dominated by **marketing-copy accuracy** (a support page that references OTP/SMS/phone sign-in, which contradicts the documented email-only model) and **minor SEO/branding** drift. None of these block release, but the support-page copy should be corrected before launch for legal/privacy accuracy.

A meaningful share of security claims are **VERIFIED BY SOURCE / PENDING RUNTIME** rather than **PASS**, because runtime cross-user RLS and storage tests, device camera tests, and live admin-session tests require disposable accounts/devices that were not available to this read-only audit. These are listed in §18.

**Go/No-Go: GO for production, conditional** on (a) correcting the support-page auth-model copy (P2) and (b) running the short list of two-account/device runtime smoke tests in §18. Neither is a blocker for a staged/beta rollout.

---

## 2. Repositories and branches audited

| Repo | Path | Branch | Release line |
| --- | --- | --- | --- |
| Mobile | `/Users/syedejazahammed/Documents/GitHub/bantle` | `feature/face-aligned-selfie-capture` | `app.json` version **1.1.5**, iOS build **115**, Android versionCode **115** |
| Web/admin | `/Users/syedejazahammed/Documents/GitHub/bantle-web` | `feature/trust-verification-admin-queues` | Next.js app (package `bantle-web@0.1.0`) |

Git state at audit time:
- **Mobile:** dirty entries are *only* pre-existing **deleted** `builds/*.apk` artifacts (13 files). No source/config files modified. Left untouched per instructions.
- **Web:** clean working tree.

> Note: `README.md` (mobile) documents the release line as `1.0.9 / 109`. The actual `app.json` is `1.1.5 / 115`. This is documentation drift, not a build issue (see Info findings).

---

## 3. Scope and non-scope

**In scope:** static source review of both repos; mobile auth/profile/selfie/listings/deals/chat/notifications/ratings; mobile static security & privacy scan; Supabase migrations/RLS/storage/RPC/trigger/Edge-Function review (source only); web/admin auth/middleware/API-route/service-role/idle-timeout review; marketing SEO/privacy/legal-copy review; release build/typecheck/lint verification; safe attack-simulation classification.

**Out of scope / not performed:** any write/edit/commit of source; any DB/RLS/migration/function/storage change; runtime cross-user RLS exploitation; brute force; third-party/infra attacks; sending real pushes/broadcasts; uploading private data; production data modification. No secrets were printed.

---

## 4. Tools / commands run

All read-only or build-verification only:

```
git status --short / git branch --show-current / git log --oneline -30   (both repos)
git diff --check                                                          (both repos)
ls / read (file + directory inspection)
grep -RInE  (console.*, service_role, EXPO_PUBLIC/process.env, secrets)
git ls-files | grep (.env / google-services tracking check)
# Mobile (Node v22.22.3)
npm run typecheck      -> exit 0  (PASS)
npm run lint           -> exit 0  (PASS)
# Web (Node v22.22.3)
npx tsc --noEmit       -> exit 0  (PASS)
npm run lint           -> exit 0  (PASS)
npm run build          -> exit 0  (PASS)
```

Four parallel read-only specialist sub-agents were used to cover breadth (mobile QA, Supabase RLS/storage/functions, web-admin security, marketing/SEO). Their evidence-cited findings were folded in and the highest-value items independently re-verified by direct file reads.

---

## 5. Test data / accounts used

**None.** No disposable user or admin accounts were available, so no live multi-user, device-camera, or admin-login runtime tests were performed. All such scenarios are labeled **PENDING RUNTIME** (§18). No PII, emails, phone numbers, selfies, chat bodies, tokens, signed URLs, or push tokens are reproduced in this report.

---

## 6. Scenario matrix (representative)

> Status legend per §1. "Sev if failed" = severity were the control to fail.

### Mobile — auth/session

| ID | Scenario | Expected | Status | Evidence | Sev |
| --- | --- | --- | --- | --- | --- |
| M-AUTH-01 | Protected screens while logged out | Routed to auth, no protected pixels | VERIFIED BY SOURCE | `app/_layout.tsx` gating effect + `app/index.tsx` | P1 |
| M-AUTH-02 | Email verification gate | Soft banner + per-action gate modal | VERIFIED BY SOURCE | `components/VerifyEmailBanner.tsx`, `VerifyEmailGateModal.tsx` | P2 |
| M-AUTH-03 | Banned / soft-deleted gates | Banned & recovery gates before tabs | VERIFIED BY SOURCE | `app/(auth)/*`, `stores/auth.ts` | P1 |
| M-AUTH-04 | Sign-out clears session | Full store cascade + SecureStore clear | VERIFIED BY SOURCE | `stores/auth.ts` sign-out path | P1 |
| M-AUTH-05 | Stale profile on user switch | Session-id guard on async fetches | VERIFIED BY SOURCE | session-id checks across stores | P2 |
| M-AUTH-06 | Session storage at rest | Encrypted, chunked Keystore | VERIFIED BY SOURCE | `lib/supabase.ts` `ChunkingSecureStoreAdapter` | P1 |
| M-AUTH-07 | Expired/invalid session | autoRefresh + re-gate | PENDING RUNTIME | `lib/supabase.ts` (`autoRefreshToken:true`) | P1 |

### Mobile — profile / identity / self-escalation

| ID | Scenario | Expected | Status | Evidence | Sev |
| --- | --- | --- | --- | --- | --- |
| M-PROF-01 | Edit profile writes only safe fields | Only `{bio}` / display via RPC | VERIFIED BY SOURCE | `app/edit-profile.tsx`, `stores/auth.ts` (writes only `show_last_seen`/`analytics_consent`) | P1 |
| M-PROF-02 | Self-set `is_admin` | Blocked | VERIFIED BY SOURCE | `profile_update_hardening.sql` REVOKE UPDATE + 13-col allowlist + deny-by-default `BEFORE UPDATE` trigger raising 42501 | P0 |
| M-PROF-03 | Self-approve `identity_verification_status`/badges/trust | Blocked | VERIFIED BY SOURCE | columns not in grant allowlist; transitions owned by `SECURITY DEFINER` RPCs | P0 |
| M-PROF-04 | Submit identity selfie | Inserts `profile_verifications` status `pending` only | VERIFIED BY SOURCE | `lib/identityVerification.ts` | P2 |
| M-PROF-05 | Name-change 2/year limit | Server-enforced via RPC | PARTIAL | `lib/nameChangeErrors.ts` + `20260624_name_change_limit_reverification_enforcement.sql` | P2 |
| M-PROF-06 | Selfie path/landmarks logged | Never | VERIFIED BY SOURCE | `components/verification/FaceAlignedSelfieCamera.tsx:175-184` (`__DEV__`-gated, only generic string/bool) | P2 |
| M-PROF-07 | GPS requested during capture | No | VERIFIED BY SOURCE | `app.json` permissions: CAMERA + POST_NOTIFICATIONS only; `Permissions-Policy geolocation=()` on web | P2 |

### Mobile — selfie capture (face-aligned)

| ID | Scenario | Expected | Status | Evidence | Sev |
| --- | --- | --- | --- | --- | --- |
| M-SELF-01 | Capture disabled until ready/green | Button gated on alignment | VERIFIED BY SOURCE | `FaceAlignedSelfieCamera.tsx` alignment state machine | P2 |
| M-SELF-02 | No manual override | Cannot capture unaligned | VERIFIED BY SOURCE | same | P2 |
| M-SELF-03 | Submit-only upload | Upload only on submit | VERIFIED BY SOURCE | `lib/identityVerification.ts` `submitIdentitySelfieVerification` | P2 |
| M-SELF-04 | MIME/size validation | JPEG/PNG/WebP, ≤10 MB | VERIFIED BY SOURCE | `lib/identityVerification.ts` `ALLOWED_MIME_TYPES`, `IDENTITY_SELFIE_MAX_BYTES` | P2 |
| M-SELF-05 | Capture on real Android/iOS device | Works | PENDING RUNTIME | no device available | P1 |
| M-SELF-06 | Permission denied / no-face / multi-face states | Correct guidance | PENDING RUNTIME | logic present, not device-run | P3 |

### Mobile — listings / deals / chat

| ID | Scenario | Expected | Status | Evidence | Sev |
| --- | --- | --- | --- | --- | --- |
| M-LIST-01 | Unverified user blocked from hosting | `can_user_host` gate | VERIFIED BY SOURCE (server) / PARTIAL (client) | `lib/hostingEligibility.ts` + `trust_phase1` RPC; CONCERN: client `unknown` result proceeds, relies on RLS | P2 |
| M-LIST-02 | Active-platform-only selection | Inactive hidden | VERIFIED BY SOURCE | `stores/platforms.ts`, post flow | P3 |
| M-LIST-03 | Edit another user's listing | Blocked | VERIFIED BY SOURCE | listings RLS `listings_select_active_or_own` + owner-scoped writes | P1 |
| M-DEAL-01 | Proposal-first (no chat before accept) | Composer read-only until active | VERIFIED BY SOURCE | `get_proposal_first_chat_ui_state` RPC + `stores/chats.ts` | P1 |
| M-DEAL-02 | Propose on own listing | Blocked | VERIFIED BY SOURCE | `propose_deal_*_with_disclaimer()` buyer-only checks | P2 |
| M-DEAL-03 | Duplicate proposal | Blocked | PARTIAL | client markers + `phase6h2d_duplicate_open_proposal_guard.sql` | P2 |
| M-DEAL-04 | Price/listing/user immutable post-creation | Blocked | VERIFIED BY SOURCE | `protect_deal_lifecycle_updates()` trigger (raises check_violation) | P1 |
| M-DEAL-05 | Illegal lifecycle transition | Rejected | VERIFIED BY SOURCE | accept via `accept_deal_with_disclaimer()`; other transitions rejected | P1 |
| M-DEAL-06 | Payment processing claim in app | None | VERIFIED BY SOURCE | disclaimer copy; no payment APIs | P2 |
| M-CHAT-01 | Non-participant read/send | Blocked | VERIFIED BY SOURCE (RLS) / PENDING RUNTIME | `messages_*_participants`, `conversations_select_participants` | P1 |
| M-CHAT-02 | Signed URL leaked in logs | Never | VERIFIED BY SOURCE | `stores/chats.ts` logs only cache hit/miss counts; cache cleared on sign-out | P2 |

### Mobile — notifications / ratings

| ID | Scenario | Expected | Status | Evidence | Sev |
| --- | --- | --- | --- | --- | --- |
| M-NOT-01 | Push payload leaks sensitive data | Only event + ids | VERIFIED BY SOURCE | `supabase/functions/send_push_notification` data = `{conversation_id, sender_id}` | P2 |
| M-NOT-02 | Unknown notification kind | No crash, fallback route | VERIFIED BY SOURCE | union + fallback to `/notifications` | P3 |
| M-RATE-01 | Duplicate rating | Prevented | VERIFIED BY SOURCE | client `hasUserRated` + DB `UNIQUE(deal_id,rater_id,milestone)` | P2 |
| M-RATE-02 | Rate non-participated deal | Blocked | VERIFIED BY SOURCE | client `isParticipant` + `ratings_insert_participants` RLS | P2 |

### Web / admin

| ID | Scenario | Expected | Status | Evidence | Sev |
| --- | --- | --- | --- | --- | --- |
| W-ADM-01 | `/admin/*` while logged out | Redirect to `/admin/login` | VERIFIED BY SOURCE | `middleware.ts` | P1 |
| W-ADM-02 | `/admin/*` as normal user | Redirect to `/` (no surface) | VERIFIED BY SOURCE | `middleware.ts` `is_admin` check | P1 |
| W-ADM-03 | Every admin API route auth | `requireAdmin` first | VERIFIED BY SOURCE | all admin API handlers call `requireAdmin` (`lib/admin-auth.ts:60`); confirmed in build route map | P0 |
| W-ADM-04 | Mutation without valid origin | 403 | VERIFIED BY SOURCE | `validateSameOriginMutationRequest` (`lib/admin-auth.ts:30`); prod rejects missing Origin/Referer | P1 |
| W-ADM-05 | Service-role in client bundle | Never | VERIFIED BY SOURCE | `admin-supabase-server.ts:14` `window` guard; key only `SUPABASE_SERVICE_ROLE_KEY` (no NEXT_PUBLIC); zero overlap with `use client` files | P0 |
| W-ADM-06 | Admin idle timeout | 30 min idle / 12 h absolute, sign out | VERIFIED BY SOURCE / PENDING RUNTIME | `components/admin/AdminIdleTimeout.tsx` mounted only in authed `app/admin/layout.tsx` | P2 |
| W-ADM-07 | Internal notes exposed to users | Never | VERIFIED BY SOURCE | reject flows persist `admin_internal_note`; user notif carries only `user_visible_message` | P2 |
| W-ADM-08 | Selfie URL exposure | Short-lived (5 min) admin-only | VERIFIED BY SOURCE | `SIGNED_URL_TTL_SECONDS = 5*60`, generated only in `requireAdmin`-gated GET | P2 |
| W-ADM-09 | Broadcast accidental mass-send | Double confirmation + count match | VERIFIED BY SOURCE | `lib/admin-broadcasts.ts` confirmation texts + 409 on count drift; `admin-push` single-recipient only | P2 |
| W-ADM-10 | Deal termination/ban safeguards | Reason required, idempotent, audited | VERIFIED BY SOURCE | terminate/ban routes (self-ban & admin-ban rejected) | P2 |

### Web — marketing / SEO / privacy

| ID | Scenario | Expected | Status | Evidence | Sev |
| --- | --- | --- | --- | --- | --- |
| W-SEO-01 | Exact home title string | `Bantle - Split or buy subscriptions with more trust` | PARTIAL / CONCERN | rendered title = `Split or buy subscriptions with more trust. | Bantle` (`lib/constants.ts:2`, `app/layout.tsx`, `app/(marketing)/page.tsx`) — same words, different order/separator/trailing period | P3 |
| W-SEO-02 | Meta description / OG / Twitter | Present + accurate | VERIFIED BY SOURCE | `app/layout.tsx` metadata + `opengraph-image.tsx`/`twitter-image.tsx` | P3 |
| W-SEO-03 | JSON-LD valid | `@context` + `@graph`, no runtime error | VERIFIED BY SOURCE | `app/(marketing)/page.tsx` Organization+WebSite graph, escaped inject | Info |
| W-SEO-04 | robots excludes private | `/admin`, `/verify`, `/reset-password` disallowed | VERIFIED BY SOURCE | `app/robots.ts` | P2 |
| W-SEO-05 | sitemap public-only | 12 public routes | VERIFIED BY SOURCE | `app/sitemap.ts` | P3 |
| W-SEO-06 | OG image headline matches tagline | Full "split or buy" | CONCERN | `opengraph-image.tsx`/`twitter-image.tsx` say "Split subscriptions with more trust." (drops "or buy") | P3 |
| W-LEG-01 | Payment boundary clear | No payment processing/verification claim | VERIFIED BY SOURCE | about/how-it-works/terms/refund/safety/home copy | P1 |
| W-LEG-02 | No access/refund/outcome guarantee | Disclaimed | VERIFIED BY SOURCE | faq/safety/home copy | P1 |
| W-LEG-03 | "biometric"/"liveness"/"fraud-proof" as capability | Absent / only "does not use" | VERIFIED BY SOURCE | safety/privacy/faq | P1 |
| W-LEG-04 | DPDP over-claim | Measured language only | VERIFIED BY SOURCE | privacy ("with DPDP Act 2023 in mind") | P2 |
| W-LEG-05 | Support page auth-model accuracy | Match email-only, Android+iOS | FAIL (copy) / CONCERN | `app/(marketing)/support/page.tsx` references OTP/SMS (~L45-46), "phone number ... you use to sign in" (~L68), "Update Bantle from the Play Store" (~L49) | P2 |
| W-NAV-01 | Footer links complete | All policy/nav targets exist | VERIFIED BY SOURCE | `components/Footer.tsx` | P3 |
| W-NAV-02 | MobileNav legal completeness | All legal pages reachable | PARTIAL | `MobileNav` uses `LEGAL_LINKS` (4) omitting Account-deletion & Child-safety (still in footer) | P3 |

---

## 7. Mobile QA results

Functional flows are coherent and source-complete: auth gating, email/banned/soft-delete/TOS gates, profile editing, identity verification submission, face-aligned selfie capture state machine, listing creation with active-platform filtering, proposal-first deals, lifecycle transitions, chat eligibility/read-only composer, notifications routing, and ratings. The strongest, fully source-verified areas are **profile self-escalation prevention** and **ratings integrity** (verified at both client and DB layers). See matrix §6. Device-dependent flows (camera capture across OS, app-resume realtime) are PENDING RUNTIME.

## 8. Mobile security results

- **No service-role key in mobile code.** `grep` for `service_role`/`SERVICE_ROLE` in `app/components/lib/stores` returns only references inside `supabase/functions/*` (server-side Deno Edge Functions), which is correct.
- **Client uses anon/publishable key only** with `EXPO_PUBLIC_*` env (`lib/supabase.ts`), encrypted+chunked `SecureStore`, `detectSessionInUrl:false`.
- **Logging is privacy-safe.** Only 12 `console.*` calls total (1 `console.log`), and that one (`FaceAlignedSelfieCamera.tsx:183`) is `__DEV__`-gated and restricted to generic string/bool values — no URIs, frames, landmarks, coordinates, or user IDs. `lib/safeError.ts` centralizes redacted error reporting; Bugsnag plugin redacts password/token/email/phone keys (`app.json` `with-bugsnag` `redactedKeys`).
- **Selfie privacy:** stored to private `verification-selfies` bucket under `verification/{uid}/{id}.ext`; `selfie_metadata` excludes URI/landmarks/GPS.

## 9. Supabase / RLS / storage / function review

- **RLS enabled with explicit policies** on profiles, listings, deals, conversations, messages, message_attachments, notifications, ratings, saved_listings, hidden_listings, user_blocks, user_reports, user_report_attachments, profile_verifications, name_change_requests, trust_system_settings, broadcasts/broadcast_recipients, admin_actions, push_dispatch_log. Tables with no user policy (notifications INSERT, broadcasts, admin_actions) are **default-deny → service-role only**, which is correct for server-generated rows.
- **Self-escalation blocked at two layers:** `profile_update_hardening.sql` REVOKEs broad UPDATE and GRANTs only a 13-column self-service allowlist, plus a deny-by-default `BEFORE UPDATE` trigger raising `42501` on any non-allowlisted column change. `is_admin`, `identity_verification_status`, `is_verified`, badge/trust columns, and `deleted_at` are not client-writable.
- **Cross-user isolation:** `public_profiles` projection excludes email/phone/push_token/is_admin/banned/consent; `profiles` direct SELECT restricted to own row. Private buckets: `verification-selfies` (no authenticated SELECT → admin/service-role read only), `chat-media` (participant-only + block check), `report-evidence` (reporter-only).
- **Deal integrity:** `protect_deal_lifecycle_updates()` blocks mutation of id/listing/host/buyer/conversation/price/duration/created_at and admin-termination metadata; proposals must go through `propose_deal_*_with_disclaimer()` RPCs (proposal-first enforced).
- **SECURITY DEFINER hygiene:** sampled functions consistently set `search_path` and `REVOKE ... FROM PUBLIC/anon` with targeted `GRANT EXECUTE`. Minor: several older guard functions use `search_path TO 'public'` rather than `''` (low risk; see Info).
- **Edge Functions:** all five have `verify_jwt = true` (`config.toml`). `_shared/internalAuth.ts` verifies callers via constant-time secret compare or `service_role` JWT. `export_user_data` derives `userId` from the verified token (never request body), rate-limits 24 h, returns only the caller's own data (peers reduced to display_name; reports-against-the-user excluded). `send_push_notification` enforces ownership before dispatch and excludes credentials/attachment paths from payloads.

> Runtime cross-user denial, trigger-fires-on-tamper, and signed-URL storage behavior are **PENDING RUNTIME** (service-role bypasses RLS, so these need real non-service-role JWTs to prove).

## 10. Web/admin QA results

All admin routes built successfully (`npm run build` exit 0) as dynamic server routes (users, deals, listings, identity-verifications, name-change-requests, reports, broadcasts, platforms, audit, settings/deal-reputation, login). Trust-review approve/reject, name-change approve/reject, ban/terminate, broadcasts, and report resolution flows are present and guarded.

## 11. Web/admin security results

Strong and consistent (see §6 W-ADM rows): middleware gate with validated JWT + `is_admin`; `requireAdmin` at the top of every admin API route; same-origin CSRF protection for mutations (prod rejects missing Origin/Referer); service-role key strictly server-only with a browser-load guard; security headers (CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy camera=() microphone=() geolocation=()`); idle timeout mounted only in the authenticated admin layout; internal notes never sent to users; selfie review via 5-minute signed URLs only. **No CONCERN-level web security findings.**

## 12. Marketing / SEO / privacy results

Legal/payment-boundary discipline is strong: payments-outside-Bantle stated repeatedly, no access/refund/outcome guarantees, "biometric/liveness/facial recognition" appear only as capabilities Bantle does *not* use, no "fraud-proof/scam-proof/100% safe" language, DPDP language measured. JSON-LD valid, robots/sitemap correct. Issues are copy-accuracy and minor SEO/branding drift (see Findings §15).

## 13. Release / build readiness results

| Check | Repo | Result |
| --- | --- | --- |
| `npm run typecheck` | Mobile | **PASS** (exit 0) |
| `npm run lint` | Mobile | **PASS** (exit 0) |
| `git diff --check` | Mobile | clean |
| `npx tsc --noEmit` | Web | **PASS** (exit 0) |
| `npm run lint` | Web | **PASS** (exit 0) |
| `npm run build` | Web | **PASS** (exit 0) |
| `git diff --check` / `git status` | Web | clean |
| Node version | both | v22.22.3 (matches required Node 22) |

Mobile `app.json` version/build are internally consistent (1.1.5 / 115 / 115). IPA/AAB metadata was not unzipped/verified in this audit (PENDING; README provides the procedure).

## 14. Attack-simulation results (classification)

**Authentication/session:** protected-route-logged-out, admin-logged-out, admin-as-normal-user, direct admin-API-without-auth, admin-API-as-normal-user, mutation-with-bad-origin → **VERIFIED BY SOURCE** (middleware + `requireAdmin` + same-origin). Stale/expired session, idle-tab → **PENDING RUNTIME**.

**Authorization:** read/modify another user's profile, escalate `is_admin`, self-approve identity, self-add badge, create listing while unverified, modify another's listing, propose on own listing, duplicate proposal, chat before accept, message non-participant convo, illegal deal transition, change deal price → **VERIFIED BY SOURCE** at policy/trigger/RPC layer; cross-user execution → **PENDING RUNTIME**.

**Privacy/leakage:** selfie path in logs, signed URL in push, chat body in logs, email/phone public, public-profile over-exposure, export/delete exposing others, analytics-before-consent → **VERIFIED BY SOURCE** (no leakage paths found; consent-gated PostHog). PII in Bugsnag/PostHog at runtime → **PENDING RUNTIME**.

**Storage:** read others' selfie/attachment, oversized/invalid MIME, path traversal, guessable path, signed-URL lifetime → **VERIFIED BY SOURCE** (private buckets, owner/participant policies, path-scoped, MIME+size validation, 5-min admin signed URLs). Live signed-URL fetch as wrong user → **PENDING RUNTIME**.

**Business logic:** proposal-first bypass, unverified deal-limit bypass, name-change yearly-limit bypass, verified-to-list bypass, blocked-user bypass → **VERIFIED BY SOURCE / PARTIAL** (server RPCs + triggers); runtime → **PENDING RUNTIME**.

---

## 15. Findings by severity

### P0 — Critical
**None.**

### P1 — High
**None.**

### P2 — Medium
1. **Support page contradicts the email-only / cross-platform model.** `app/(marketing)/support/page.tsx` references "OTP", "SMS delivery can be carrier-dependent" (~L45-46), "The phone number or email you use to sign in" (~L68), and "Update Bantle from the Play Store" (~L49). The documented auth model is **email-based** (no SMS/phone sign-in) and the app targets **Android + iOS**. This is a public-facing accuracy/privacy-consistency issue (a public page implying phone/SMS data collection that the privacy policy says is not collected). **Recommendation:** rewrite to reference email sign-in only, remove OTP/SMS language, and make store wording "App Store / Play Store". (Copy-only; no code logic.)
2. **Host-eligibility `unknown` result proceeds to insert (client).** `lib/hostingEligibility.ts` returns `{status:'unknown'}` on unexpected RPC error and the post flow then relies on RLS/server to reject. Server enforcement exists, so this is defense-in-depth, not an open hole. **Recommendation:** treat `unknown` as blocked in the client UX (fail-closed) before production scale-up.

### P3 — Low
1. **Home/marketing title is not the exact requested string.** Rendered `Split or buy subscriptions with more trust. | Bantle` vs requested `Bantle - Split or buy subscriptions with more trust`. Same keywords; confirm intended branding (`lib/constants.ts:2`, `app/(marketing)/page.tsx`).
2. **OG/Twitter image headline drops "or buy"** ("Split subscriptions with more trust.") — inconsistent with the canonical tagline.
3. **MobileNav legal list omits Account-deletion and Child-safety-standards** (`LEGAL_LINKS`, `constants.ts:38-43`); both remain reachable from the footer.
4. **`google-services.json` is tracked in git** (mobile root). This is Firebase *client* configuration (not a server secret) and is generally safe to ship in app bundles, but teams that prefer not to track it can gitignore + inject at build. (Info-adjacent.)
5. **`SECURITY DEFINER` `search_path TO 'public'`** on several older guard/trigger functions rather than `''`/`pg_temp` exclusion. Low risk (explicit, non-mutable), but Supabase advisor prefers an empty search_path.

### Info
1. **README version drift:** mobile `README.md` says `1.0.9 / 109`; `app.json` is `1.1.5 / 115`. Update docs.
2. **`.env.example` (mobile)** contains a real-looking **publishable** anon key (`sb_publishable_...`) and the custom domain `https://auth.bantle.in`. Publishable keys are designed to be public, so this is **safe by design**; flagged only for awareness. *(SECRET-LIKE VALUE handling: no service-role/private secret was found in tracked files.)*
3. **Push preview includes message text.** `send_push_notification` includes `message_text` in the notification copy (standard messaging behavior). No payment/credential data is included, and event/system kinds + attachment paths are excluded. Confirm this matches the intended privacy posture; message content does transit Expo/APNs/FCM as with any chat app.

---

## 16. Strong controls found

1. Mobile ships **no service-role key**; anon/publishable key only, encrypted chunked `SecureStore` sessions.
2. **Two-layer profile self-escalation prevention** (column-grant allowlist + deny-by-default `BEFORE UPDATE` trigger).
3. **Private identity-selfie bucket** with no authenticated SELECT (admin/service-role read only), path-scoped INSERT.
4. **Proposal-first + deal immutability** enforced by server RPCs and a lifecycle-protection trigger.
5. **RLS across all user tables**; `public_profiles` projection excludes PII.
6. **Edge Functions**: `verify_jwt=true` everywhere + constant-time internal-auth; `export_user_data` returns only the caller's data with a 24 h rate limit.
7. **Web admin**: middleware gate + `requireAdmin` on every API route + same-origin CSRF + server-only service-role with browser guard + CSP/security headers + idle timeout + double-confirmed broadcasts + internal notes never user-exposed + 5-minute selfie signed URLs.
8. **Privacy-safe logging** (`__DEV__`-gated, redacted error reporting, consent-gated analytics).
9. **Clean builds**: typecheck/lint/build all pass on Node 22; git clean.

## 17. Weaknesses / risks found

- Public **support-page copy** misrepresents the auth model (OTP/SMS/phone, Play-Store-only) — the most actionable pre-launch item (P2-1).
- Client **fail-open on `unknown` host eligibility** (P2-2) — server-backed, but should fail closed.
- Minor **SEO/branding/nav** drift (P3-1..3) and **doc drift** (Info-1).
- Operational: **server-side Supabase Auth session expiry** is a founder dashboard setting; the admin idle timeout is client defense-in-depth (middleware `is_admin` remains the authoritative server gate).

## 18. Runtime tests pending (require disposable accounts/devices)

1. Two-account cross-user RLS denial: read/modify another user's profile, ratings, deals, messages.
2. Confirm `profiles_verification_update_guard` trigger fires on `is_admin`/`identity_*` tamper attempts.
3. Storage signed-URL fetch as wrong user for all three private buckets.
4. Device camera selfie capture on real Android and iOS (permission-denied/no-face/multi-face/ready/retake/cancel/background).
5. Admin login + idle-timeout + absolute-lifetime live behavior.
6. Expired/invalid session re-gating on mobile; app-resume realtime (BUG_103 regression).
7. Name-change yearly limit and unverified deal-limit live enforcement.
8. Verify built IPA/AAB metadata (version/build/min-OS) before store upload.

## 19. Recommendations

1. **Before launch (P2):** rewrite `support/page.tsx` to reflect email-only sign-in (remove OTP/SMS/phone), and use "App Store / Play Store" wording.
2. **Before scale (P2):** make client host-eligibility fail closed on `unknown`.
3. **Polish (P3):** decide the canonical home `<title>`; align OG/Twitter image headline to the full tagline; add Account-deletion + Child-safety to MobileNav legal list.
4. **Hygiene (Info/P3):** update mobile README version to 1.1.5/115; consider normalizing older `SECURITY DEFINER` functions to `search_path = ''`; decide policy on tracking `google-services.json`.
5. **Verification:** run the §18 runtime smoke list with two disposable users + one admin before/at general availability.
6. **Operational:** set server-side Supabase Auth session expiry in the dashboard to back the client idle timeout.

## 20. Go / No-Go recommendation

**GO for production — conditional.** No P0/P1 issues; controls are strong and builds are clean. Conditions: (1) correct the support-page auth-model copy (P2-1) for legal/privacy accuracy, and (2) complete the §18 two-account/device runtime smoke tests. For a staged/beta rollout, these are not hard blockers; for broad GA, address P2 items and the runtime smokes first.

## 21. Appendix — commands and evidence snippets

```
# Branches / cleanliness
mobile: feature/face-aligned-selfie-capture; dirty = only deleted builds/*.apk (pre-existing)
web:    feature/trust-verification-admin-queues; clean

# Build verification (Node v22.22.3)
mobile: npm run typecheck -> exit 0 ; npm run lint -> exit 0
web:    npx tsc --noEmit -> exit 0 ; npm run lint -> exit 0 ; npm run build -> exit 0
both:   git diff --check -> clean

# Mobile secret/leak scan
grep service_role app components lib stores  -> matches ONLY under supabase/functions/* (server-side)
console.* in app/components/lib/stores       -> 12 total (1 console.log, __DEV__-gated, no PII)
git ls-files | grep .env                     -> only .env.example (publishable key; safe), .env gitignored

# Key source anchors
lib/supabase.ts                              -> anon key + encrypted chunked SecureStore, detectSessionInUrl:false
lib/identityVerification.ts                  -> private bucket, path verification/{uid}/{id}, MIME+10MB validation
supabase/functions/_shared/internalAuth.ts   -> constant-time internal auth / service_role JWT
bantle-web/middleware.ts                      -> /admin/* gate (getUser + is_admin)
bantle-web/lib/admin-auth.ts                  -> requireAdmin + validateSameOriginMutationRequest
bantle-web/lib/admin-supabase-server.ts       -> service-role server-only + window guard
bantle-web/next.config.mjs                    -> CSP + security headers
bantle-web/app/(marketing)/support/page.tsx   -> CONCERN: OTP/SMS/phone/Play-Store copy
```

*End of report. No source, configuration, database, or behavior changes were made during this audit; only this report file was created.*
