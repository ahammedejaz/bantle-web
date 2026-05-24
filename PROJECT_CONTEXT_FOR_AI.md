# Bantle Web - AI project context

Last updated: 2026-05-24
Repo path: `/Users/syedejazahammed/Documents/GitHub/bantle-web`
Production URL: `https://bantle.in`
Mobile repo: `/Users/syedejazahammed/Documents/GitHub/bantle`
Supabase project id: `fpoviccitrraonvvgont`

This file is intended as the first document a future Claude, ChatGPT, or other AI coding agent should read before changing this repository. It consolidates the current codebase, the older project dump, and the admin phase recon documents into one practical source of truth.

Scan scope for this document:

- Manually reviewed source routes, components, shared libs, middleware, configs, and the existing planning/recon docs.
- Treated `package-lock.json` as generated dependency metadata; dependency truth is summarized from `package.json`.
- Ignored local/deployment metadata like `.vercel/` and `.claude/settings.local.json` except to note that they exist and are not part of the app surface.

## 1. Executive summary

`bantle-web` is a Next.js 14 App Router application with two major surfaces:

1. Public marketing, support, and legal pages for Bantle at `bantle.in`.
2. A protected admin panel at `/admin/*` for reports, users, listings, deals, and platform catalog management.

Bantle itself is an India-first mobile app for household subscription coordination. The current product positioning is important: Bantle is framed as a tool for roommates, family, and partners who already share a household. It is not meant to be described as a stranger marketplace. Payments happen outside Bantle via UPI. Bantle does not hold money.

The old `BANTLE_WEB_PROJECT_DUMP.md` is useful historical context, but it predates the admin panel and contains stale statements like "no backend, no auth." The current reality is:

- Public pages are mostly static server components.
- `/reset-password` and `/verify` are client-enhanced Supabase auth helper pages.
- `/admin/*` uses Supabase cookie sessions, middleware gating, and server-side service-role API routes.
- Admin Phases 1 through 8 are verified. Phase 9 dashboard analytics refresh is shipped awaiting Syed smoke verification.

### Pre-Launch Fix 2 Update - 2026-05-24

- Web/admin commit `a3b4fc7` updated platform activation/deactivation toast copy so persistent in-app notification failures and push-only failures are reported separately.
- Mobile/Supabase commit `04bed57` updated `send_push_notification`; the deployed function is ACTIVE version 17 and now parses Expo ticket `data` as either one object or an array.
- Production migration `20260524095313 protect_admin_closed_listing_reopen` added DB-level protection against owners reopening Bantle/admin-closed listings or spoofing closure metadata.
- Mobile commits `d9da79e` and `775cc91` added the DB migration and updated listing edit/My Listings UI for Bantle-closed rows.
- `broadcast_push_dispatcher` was intentionally left unchanged.

## 2. Technology stack

- Framework: Next.js `14.2.35`, App Router.
- Runtime language: TypeScript 5, strict mode enabled.
- React: React 18.
- Styling: Tailwind CSS 3.4 with custom Bantle tokens in `tailwind.config.ts`.
- UI primitives: local shadcn-style `Button` and `Sheet`; Radix Dialog for sheets/modals.
- Icons: `lucide-react`.
- Supabase:
  - `@supabase/supabase-js` for browser anon flows and service-role route handlers.
  - `@supabase/ssr` for admin cookie sessions in middleware/server components.
- Utility styling helpers: `clsx`, `tailwind-merge`, `class-variance-authority`.
- Hosting: Vercel, production on `main`.

Package scripts:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

There are no unit tests in this repo currently. Verification normally means `npm run build` and `npm run lint`, plus manual admin smoke tests from `ADMIN_PANEL_PLAN.md`.

## 3. Environment variables

Required in Vercel and locally for auth/admin behavior:

- `NEXT_PUBLIC_SUPABASE_URL`
  - Public Supabase project URL.
  - Used by browser, middleware, server components, and service-role client factory.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Public anon key.
  - Used by browser auth clients and user-JWT route client.
- `SUPABASE_SERVICE_ROLE_KEY`
  - Private service-role key.
  - Must not have `NEXT_PUBLIC_`.
  - Used only by `lib/admin-supabase-server.ts`.
  - Never expose to client components.

The service-role client has a runtime browser guard. If a client import graph ever pulls `lib/admin-supabase-server.ts` into the browser, it throws immediately.

## 4. Repository map

Top-level files:

- `package.json` - Next/Supabase/Radix/lucide dependencies and scripts.
- `next.config.mjs` - empty Next config object.
- `tsconfig.json` - strict TS, `@/*` path alias to repo root.
- `tailwind.config.ts` - Bantle color, font, radius, max-width tokens.
- `.eslintrc.json` - `next/core-web-vitals` and `next/typescript`.
- `.gitignore` - ignores `.next`, `node_modules`, `.vercel`, env locals, build artifacts, `next-env.d.ts`.
- `middleware.ts` - gates all `/admin/:path*` routes.
- `README.md` - old marketing-site docs, partially stale after admin work.
- `BANTLE_WEB_PROJECT_DUMP.md` - older broad project dump, useful but stale about no backend/auth.
- `ADMIN_PANEL_PLAN.md` - canonical admin roadmap and phase records.
- `PHASE_3_RECON.md` - production schema snapshot for users/listings/deals.
- `PHASE_4_RECON.md` - production schema snapshot for platforms.
- `PROJECT_CONTEXT_FOR_AI.md` - this file.

Main directories:

- `app/`
  - Next.js app routes, layouts, icons, global CSS.
- `app/(marketing)/`
  - Public website route group. Parentheses do not affect URLs.
- `app/admin/`
  - Admin layout, pages, and route handlers.
- `components/`
  - Shared marketing components and admin components.
- `components/ui/`
  - Local UI primitives.
- `lib/`
  - Constants, Supabase clients, admin auth/actions/push helpers, TOS metadata.
- `public/`
  - Currently empty in this checkout. Favicons live under `app/`.

## 5. Design system and code style

Design rules currently encoded by Tailwind and existing components:

- Page background: cream (`#FAF5EC`).
- Primary brand color: deep teal (`#04342C`).
- Secondary text: muted ink (`#6B6B6B`).
- Borders: `line` (`#E5E0D5`).
- Card surface: `cream-card` (`#FFFDF7`).
- Typography:
  - Inter for body via `next/font/google`.
  - Lora for headings, usually italic for hero/page titles.
  - Only weights 400 and 500 are loaded.
- Visual style:
  - Flat, border-based, very little motion.
  - No gradients/shadows as a general marketing rule, though admin modals/toasts currently use `shadow-xl`/`shadow-lg`.
  - Sentence case in UI.
  - Lucide icons only.

Utility classes in `app/globals.css`:

- `.container-x` - centered max-width 1200px with responsive horizontal padding.
- `.prose-bantle` - long-form page typography.
- `.text-balance`, `.text-pretty` - CSS text-wrap helpers.

`lib/utils.ts` exports `cn(...inputs)` using `clsx` and `tailwind-merge`.

## 6. Brand/legal constants

`lib/constants.ts` is the source of truth for:

- `BRAND_NAME = "Bantle"`
- `TAGLINE = "Share subscription costs."`
- `SITE_URL = "https://bantle.in"`
- `SITE_DESCRIPTION` - household subscription coordination copy.
- Contact emails:
  - `support@bantle.in`
  - `feedback@bantle.in`
  - `privacy@bantle.in`
  - `legal@bantle.in`
  - `grievance@bantle.in`
- Legal identity:
  - `COMPANY_NAME = "Syed Ejaz Ahammed"`
  - `JURISDICTION_CITY = "Bengaluru"`
  - `GRIEVANCE_OFFICER_NAME = "Syed Ejaz Ahammed"`
  - `POSTAL_ADDRESS = "Bengaluru, Karnataka, India"`
- `NAV_LINKS`
  - `/about`
  - `/how-it-works`
  - `/safety`
  - `/faq`
  - `/support`
- `LEGAL_LINKS`
  - `/privacy`
  - `/terms`
  - `/refund-policy`
  - `/community-guidelines`
- `POLICY_EFFECTIVE_DATE = "14 May 2026"`

`lib/tos.ts` is the current TOS metadata source:

- `CURRENT_VERSION = "2.0"`
- `EFFECTIVE_DATE = "2026-05-14"`
- `EFFECTIVE_DATE_DISPLAY = "14 May 2026"`
- `CHANGES_FROM_PREVIOUS` lists the household-only reframing and related legal changes.

If terms change, update this file, `/terms`, and the equivalent mobile repo constant used for blocking re-acceptance.

## 7. Layout architecture

Root layout: `app/layout.tsx`

- Loads Inter and Lora.
- Imports `app/globals.css`.
- Defines site-wide metadata and SEO defaults.
- Renders only `<html>` and `<body>`.
- Does not render Header/Footer.

Marketing layout: `app/(marketing)/layout.tsx`

- Wraps public pages with:
  - Skip link.
  - `Header`.
  - Main content.
  - `Footer`.
- Exists as a route group so URLs remain clean.
- Admin routes do not inherit marketing chrome.

Admin layout: `app/admin/layout.tsx`

- Exports noindex metadata.
- Reads Supabase cookie session using `createServerClient`.
- If signed out, renders a bare cream background so `/admin/login` can show.
- If signed in, fetches admin profile through service role.
- Redirects to `/` if profile is not admin as defense in depth.
- Wraps children in `AdminToastProvider`.
- Renders desktop sidebar `AdminNav` on `md+` and `AdminMobileHeader` on mobile.

## 8. Middleware and admin auth

`middleware.ts` matches `/admin/:path*`.

Flow:

1. Create a Supabase server client using anon key plus request cookies via `createRouteSupabase`.
2. Read `supabase.auth.getUser()`.
3. For `/admin/login`:
   - If signed in and profile has `is_admin = true`, redirect to `/admin`.
   - Otherwise allow the login page.
4. For every other `/admin/*` path:
   - If no user, redirect to `/admin/login`.
   - If user exists but `profiles.is_admin` is false/missing, redirect to `/`.
   - If admin, continue.

`lib/admin-auth.ts` exports `requireAdmin(request)` for route handlers:

- Uses user-JWT cookie client to get the current user.
- Checks `profiles.is_admin`.
- On success returns `{ admin: { id, email }, supabase }`.
- The returned `supabase` is the service-role client.
- On failure returns `{ error: NextResponse }` with 401 or 403 JSON.

Every admin API route should call `requireAdmin()` first.

## 9. Supabase client helpers

`lib/supabase.ts`

- Browser-only anon client for `/reset-password`.
- `persistSession: false`, `autoRefreshToken: false`, `detectSessionInUrl: false`.
- Created fresh per reset page load, then held in a ref once recovery session is established.

`lib/admin-supabase-browser.ts`

- Browser client for admin login.
- Uses `createBrowserClient` from `@supabase/ssr`.
- Persists cookie session so middleware and server components can read it.

`lib/admin-supabase-route.ts`

- Server client using anon key and request cookies.
- Used in middleware and logout route.
- Runs as the user, under RLS.

`lib/admin-supabase-server.ts`

- Server-only service-role client.
- Uses `SUPABASE_SERVICE_ROLE_KEY`.
- `persistSession: false`, `autoRefreshToken: false`.
- Has a browser runtime guard.

## 10. Admin audit and push helpers

`lib/admin-actions.ts`

- Defines `AdminActionType`:
  - `report_resolved`
  - `report_dismissed`
  - `user_warned`
  - `user_banned`
  - `user_soft_deleted`
  - `user_restored`
  - `platform_created`
  - `platform_updated`
  - `platform_deleted`
  - `listing_closed`
  - `deal_terminated`
  - `broadcast_sent`
- `logAdminAction(supabase, input)` inserts into `admin_actions`.
- Audit errors are logged and swallowed. The primary action is not rolled back if audit logging fails.

Important: current permanent-ban routes set `permanently_banned = true`, but some audit action names and comments still say `user_soft_deleted` or "soft-deletes." Treat the code behavior as current truth and comments as partly stale.

`lib/admin-push.ts`

- `sendAdminPush({ supabase, recipientUserId, title, body, data })`.
- Reads `profiles.push_token`.
- Sends HTTPS request directly to Expo push API `https://exp.host/--/api/v2/push/send`.
- Uses Android `channelId: "moderation"`.
- Returns `{ sent: true }` or `{ sent: false, reason }`.
- Used for moderation warning/temp-ban/perma-ban flows.
- Re-engagement pushes are permanently out of scope per `ADMIN_PANEL_PLAN.md`.

## 11. Public route inventory

All public pages live in `app/(marketing)/`.

`/`

- File: `app/(marketing)/page.tsx`.
- Landing page.
- Composed of `HeroSection`, `WhyBantle`, `HowItWorks`, `TrustSection`, `ComingSoonCTA`.
- Core copy: household subscription coordination, no marketplace, UPI outside Bantle, early access.

`/about`

- File: `app/(marketing)/about/page.tsx`.
- Story, product principles, what Bantle does not do, contact.
- Principles emphasize household over marketplace, India-first, direct UPI settlement.

`/how-it-works`

- File: `app/(marketing)/how-it-works/page.tsx`.
- Six-step explanation:
  - Add the plan.
  - Invite household.
  - Agree on split.
  - Settle over UPI.
  - Get reminded at renewal.
  - Adjust when household changes.
- Includes provider terms note.

`/safety`

- File: `app/(marketing)/safety/page.tsx`.
- Trust and safety copy:
  - Household trust model.
  - Email verification and optional Google sign-in.
  - Block/report controls.
  - Red flags.
  - Bantle is coordination only.

`/faq`

- File: `app/(marketing)/faq/page.tsx`.
- Static FAQ rendered with native `<details>`.
- Sections:
  - Getting started.
  - Household coordination.
  - Trust and safety.
  - Account.
  - Technical.
- Mentions Android launch first and no end-user web app beyond marketing/auth helper pages.

`/support`

- File: `app/(marketing)/support/page.tsx`.
- Contact cards for support and feedback.
- Troubleshooting and email details.
- Known stale copy: it still mentions OTP/SMS carrier-dependent delivery in the "Before you email" list, while the rest of the app says email-only and no phone/SMS. Future copy pass should fix this.

`/privacy`

- File: `app/(marketing)/privacy/page.tsx`.
- DPDP Act 2023 aware privacy policy.
- States Bantle does not collect phone numbers or payment information.
- Lists Supabase, Resend, FCM, Google, Bugsnag, PostHog as vendors.
- Covers data retention, DPDP rights, children privacy, security, transfers, grievance contact.

`/terms`

- File: `app/(marketing)/terms/page.tsx`.
- TOS v2.0.
- Household-only positioning.
- User attestations for household membership, authority, provider compliance, no stranger sharing, no commercial resale.
- Payments outside Bantle.
- Jurisdiction: Bengaluru, India.

`/refund-policy`

- File: `app/(marketing)/refund-policy/page.tsx`.
- Bantle is free and does not handle money.
- Refund disputes are between users/UPI/banks.
- Says if paid features arrive later, policy must update before taking payment.

`/community-guidelines`

- File: `app/(marketing)/community-guidelines/page.tsx`.
- Behavioral rules:
  - Be honest.
  - Be respectful.
  - Honour deals.
  - Keep it on Bantle.
  - No selling outside scope.
  - No illegal content.
  - Report problems.
  - Consequences.
- Some wording still uses "listings and deals" from the earlier marketplace model. This may be intentional because the mobile schema still uses listings/deals, but review if doing a full household-only copy pass.

`/verify`

- Files:
  - `app/(marketing)/verify/page.tsx`
  - `app/(marketing)/verify/VerifyClient.tsx`
- Noindex.
- Client reads Supabase auth params from both query string and hash fragment:
  - `token_hash`
  - `token`
  - `access_token`
  - `type`
  - `code`
- If params exist, renders "Email verified" state with `bantle://` deep link.
- Otherwise renders neutral explainer.

`/reset-password`

- Files:
  - `app/(marketing)/reset-password/page.tsx`
  - `app/(marketing)/reset-password/ResetPasswordClient.tsx`
- Noindex, nofollow, no-referrer, force dynamic, no cache.
- Reads recovery tokens from query or hash.
- Strips tokens from URL before continuing.
- Establishes recovery session via:
  - `setSession` for hash `access_token`/`refresh_token`.
  - `verifyOtp({ token_hash, type: "recovery" })` for query token format.
- Validates password client-side:
  - At least 8 chars.
  - Uppercase.
  - Lowercase.
  - Number.
  - Confirm must match.
- Calls `supabase.auth.updateUser({ password })`.
- On success clears password state and signs out globally.
- Success state intentionally does not use a deep link because an earlier deep-link button caused mobile app splash freeze.

## 12. Shared public components

`components/Header.tsx`

- Sticky top nav.
- Logo link to `/`.
- Desktop nav from `NAV_LINKS`.
- Mobile trigger via `MobileNav`.

`components/Footer.tsx`

- Dark teal footer.
- Uses `NAV_LINKS`, `LEGAL_LINKS`, `CONTACT_EMAIL`, `TAGLINE`.
- Renders disabled store badges.
- Uses current year.

`components/MobileNav.tsx`

- Client component.
- Radix `Sheet`.
- Right-side drawer with nav, legal links, store badges.

`components/HeroSection.tsx`

- Landing hero with copy and an inline phone mock.
- Phone mock lists Spotify, YouTube Premium, Apple One with prices.
- Uses lucide icons in bottom nav.
- This is placeholder artwork until real app screenshots are available.

`components/ComingSoonBadges.tsx`

- Disabled Play Store and App Store badge-like buttons.
- Variants: `default` and `compact`.
- Uses inline SVG glyphs for Play and Apple.

`components/FeatureCard.tsx`

- Small icon card used on homepage.

`components/PageHeader.tsx`

- Standard hero/header for non-landing marketing pages.

`components/ui/button.tsx`

- Local button primitive with variants `primary`, `secondary`, `ghost`, `muted` and sizes `sm`, `md`, `lg`.
- Note: `asChild` is declared but not implemented as a Slot; this component always renders a `<button>`.

`components/ui/sheet.tsx`

- Radix Dialog wrapper for a slide-in sheet.
- Exports root/trigger/close/content/title/description.

## 13. Admin route inventory

Admin pages:

- `/admin`
  - `app/admin/page.tsx`
  - Server component dashboard.
  - Re-checks user/admin status and greets by display name.
  - Notes remaining admin roadmap phases.
- `/admin/login`
  - `app/admin/login/page.tsx`
  - `app/admin/login/LoginClient.tsx`
  - Email/password sign-in with generic error copy.
- `/admin/reports`
  - `app/admin/reports/page.tsx`
  - `app/admin/reports/ReportsListClient.tsx`
  - Filters reports by status/category and paginates.
- `/admin/reports/[id]`
  - `app/admin/reports/[id]/page.tsx`
  - `app/admin/reports/[id]/ReportDetailClient.tsx`
  - Report detail, parties, other reports, optional messages, action panel.
- `/admin/users`
  - `app/admin/users/page.tsx`
  - `app/admin/users/UsersListClient.tsx`
  - Debounced search by email/name/UUID.
- `/admin/users/[id]`
  - `app/admin/users/[id]/page.tsx`
  - `app/admin/users/[id]/UserDetailClient.tsx`
  - User identity, counts, ban/self-delete context, action panel, tabs.
- `/admin/listings`
  - `app/admin/listings/page.tsx`
  - `app/admin/listings/ListingsClient.tsx`
  - Search, status/platform/archive filters, pagination, and listing rows.
- `/admin/listings/[id]`
  - `app/admin/listings/[id]/page.tsx`
  - `app/admin/listings/[id]/ListingDetailClient.tsx`
  - Listing summary, host card, active/pending deals, recent deals, audit entries, and force-close action.
- `/admin/deals`
  - `app/admin/deals/page.tsx`
  - `app/admin/deals/DealsClient.tsx`
  - Search, status/platform/role filters, pagination, and deal rows.
- `/admin/deals/[id]`
  - `app/admin/deals/[id]/page.tsx`
  - `app/admin/deals/[id]/DealDetailClient.tsx`
  - Deal summary, host/buyer cards, listing card, conversation, recent messages, ratings, audit entries, and force-terminate action.
- `/admin/audit`
  - `app/admin/audit/page.tsx`
  - `app/admin/audit/AuditClient.tsx`
  - Read-only `admin_actions` feed with action/resource/date/search filters, safe links, and collapsed payload display.
- `/admin/platforms`
  - `app/admin/platforms/page.tsx`
  - `app/admin/platforms/PlatformsListClient.tsx`
  - Platform catalog grouped by category, create/edit/toggle active.

Admin nav currently links Dashboard, Reports, Users, Listings, Deals, Audit, Broadcasts, and Platforms.

## 14. Admin API routes

All admin route handlers live under `app/admin/api/*` and should call `requireAdmin()`.

Authentication:

- `POST /admin/api/logout`
  - File: `app/admin/api/logout/route.ts`
  - Uses cookie route client and `supabase.auth.signOut()`.
  - Returns `{ success: true }`.

Reports:

- `GET /admin/api/reports`
  - File: `app/admin/api/reports/route.ts`
  - Query params:
    - `status` default `pending`; valid: `all`, `pending`, `reviewed`, `actioned`, `dismissed`.
    - `category` default `all`.
    - `page` default `1`.
  - Page size 20.
  - Selects report row plus reporter and reported profile snippets.
- `GET /admin/api/reports/[id]`
  - File: `app/admin/api/reports/[id]/route.ts`
  - Fetches full report plus reporter/reported profiles.
  - If `conversation_id` exists, fetches up to 100 messages.
  - Fetches up to 20 other reports against the same reported user.
- `POST /admin/api/reports/[id]/resolve`
  - File: `app/admin/api/reports/[id]/resolve/route.ts`
  - Body:
    - `action`: `resolve`, `dismiss`, `warn`, `ban_temp`, `ban_perm`.
    - `reason`: required for `warn`, `ban_temp`, `ban_perm`.
  - Requires report status `pending`, otherwise 409 "Report already triaged".
  - Status mapping:
    - `resolve` -> report `status = reviewed`, `resolution_action = none`.
    - `dismiss` -> report `status = dismissed`, `resolution_action = dismissed`.
    - `warn` -> report `status = actioned`, `resolution_action = warned`.
    - `ban_temp` -> report `status = actioned`, `resolution_action = banned_temp`.
    - `ban_perm` -> report `status = actioned`, `resolution_action = banned_perm`.
  - Warning/ban actions send push and insert `notifications` rows.
  - Temp ban sets `profiles.banned_until` to now + 7 days, plus reason/admin id.
  - Permanent ban sets `profiles.permanently_banned = true`, plus reason/admin id.
  - Current code logs perma-ban with action type `user_soft_deleted`, which is semantically stale.

Users:

- `GET /admin/api/users`
  - File: `app/admin/api/users/route.ts`
  - Query params:
    - `q` optional.
    - `page` default `1`.
  - Page size 20.
  - If `q` is UUID, exact id match.
  - Otherwise `email.ilike` OR `display_name.ilike`, with `%` and `_` escaped.
- `GET /admin/api/users/[id]`
  - File: `app/admin/api/users/[id]/route.ts`
  - Fetches full `profiles` row.
  - Parallel count queries for listings, active listings, deals as host, deals as buyer, reports filed, reports received.
- `GET /admin/api/users/[id]/listings`
  - File: `app/admin/api/users/[id]/listings/route.ts`
  - Page size 20.
  - Fetches owned listings, raw platform slug, status, archive time.
- `GET /admin/api/users/[id]/deals`
  - File: `app/admin/api/users/[id]/deals/route.ts`
  - Page size 20.
  - Fetches deals where host OR buyer.
  - Includes counterparty display names.
  - Counterparty UUID intentionally not exposed in response comments.
- `GET /admin/api/users/[id]/reports`
  - File: `app/admin/api/users/[id]/reports/route.ts`
  - Limit 50 for each side.
  - Returns `reports_filed` and `reports_received`.
- `GET /admin/api/users/[id]/audit`
  - File: `app/admin/api/users/[id]/audit/route.ts`
  - Limit 50.
  - Returns `admin_actions` rows targeting that user.
- `POST /admin/api/users/[id]/ban`
  - File: `app/admin/api/users/[id]/ban/route.ts`
  - Body:
    - `type`: `temp` or `permanent`.
    - `reason`: required.
  - Rejects self-ban.
  - Rejects banning an admin.
  - Temp ban sets `banned_until`, `banned_reason`, `banned_by`.
  - Permanent ban sets `permanently_banned`, `banned_reason`, `banned_by`.
  - Sends push and inserts moderation notification row.
  - Logs `user_banned` for temp, but `user_soft_deleted` for permanent. This naming is stale relative to current behavior.
- `POST /admin/api/users/[id]/restore`
  - File: `app/admin/api/users/[id]/restore/route.ts`
  - Body:
    - `type`: `ban` or `self_delete`.
    - `reason`: optional.
  - `ban` clears `banned_until`, `banned_reason`, `banned_by`, `permanently_banned`.
  - `self_delete` clears `deleted_at`.
  - No push on restore.
  - Logs `user_restored`.

Listings:

- `GET /admin/api/listings`
  - File: `app/admin/api/listings/route.ts`
  - Query params: `q`, `user_id`, `platform`, `status`, `archived`, `page`, `page_size`.
  - Searches listing UUID, user UUID, title, platform, host email, and host display name.
  - Returns listing rows with host summary, slots available, pending deal count, and active deal count.
- `GET /admin/api/listings/[id]`
  - File: `app/admin/api/listings/[id]/route.ts`
  - Returns listing detail, host profile, active/pending deals, recent deals, listing audit entries, and host report counts.
- `POST /admin/api/listings/[id]/close`
  - File: `app/admin/api/listings/[id]/close/route.ts`
  - Body: `{ "reason": "..." }`, 3-500 chars.
  - Active listings are set to `status = 'closed'` with `closed_reason`, `closed_by`, `closed_at`, and `updated_at`.
  - Already closed listings are idempotent and do not send duplicate notification, push, or audit.
  - It does not mutate `archived_at`, deal statuses, deal dates, conversations, or messages.
  - Host only gets persistent `listing_closed` notification and best-effort transactional push.
  - Logs `admin_actions.action_type = 'listing_closed'`.

Deals:

- `GET /admin/api/deals`
  - File: `app/admin/api/deals/route.ts`
  - Query params: `q`, `user_id`, `listing_id`, `platform`, `status`, `role`, `page`, `page_size`.
  - Searches deal UUID, listing UUID, user UUID, listing title/platform, and host/buyer email/display name.
  - Returns deal rows with listing summary, host summary, buyer summary, and admin termination metadata.
- `GET /admin/api/deals/[id]`
  - File: `app/admin/api/deals/[id]/route.ts`
  - Returns deal detail, listing, host, buyer, conversation summary, recent messages, ratings, and deal audit entries.
- `POST /admin/api/deals/[id]/terminate`
  - File: `app/admin/api/deals/[id]/terminate/route.ts`
  - Body: `{ "reason": "..." }`, 3-500 chars.
  - Pending/active deals are set to `status = 'cancelled'` with admin termination metadata.
  - Already admin-terminated deals are idempotent and do not send duplicate notification, push, message, or audit.
  - It does not mutate `started_at`, `ends_at`, listings, ratings, conversations, archives, unrelated deals, or chat history.
  - Host and buyer get persistent `deal_terminated` notifications and best-effort transactional pushes.
  - Inserts a best-effort system chat message using existing `messages.kind = 'deal_cancelled'`.
  - Logs `admin_actions.action_type = 'deal_terminated'`.

Audit:

- `GET /admin/api/audit`
  - File: `app/admin/api/audit/route.ts`
  - GET-only, read-only route over `admin_actions`.
  - Uses `requireAdmin()` and the service-role Supabase client server-side.
  - Query params: `page`, `page_size`, `action_type`, `admin_id`, `target_user_id`, `target_resource_type`, `target_resource_id`, `date_from`, `date_to`, `q`.
  - Sorts latest-first by `created_at`.
  - Validates UUID and date filters; date-only values are expanded to full UTC day boundaries.
  - Joins admin and target-user profile summaries.
  - Does not search payload and does not insert audit rows.

Platforms:

- `GET /admin/api/platforms`
  - File: `app/admin/api/platforms/route.ts`
  - No pagination; expected catalog is small.
  - Selects all platforms ordered by `display_order`, then `label`.
  - Adds `listing_count` for each platform by counting `listings.platform = platform.id`.
  - Because there is no FK, counts are value-match counts.
- `POST /admin/api/platforms`
  - File: `app/admin/api/platforms/route.ts`
  - Creates a platform.
  - Validates:
    - `id`: lowercase letters/digits/underscore, 2-40 chars.
    - `label`: required, max 60.
    - `category`: one of `music`, `video`, `cloud`, `work`.
    - `default_monthly_price`: integer 1-100000.
    - `brand_color`: `#RRGGBB`.
    - `brand_initials`: 1-3 chars, uppercased.
    - `display_order`: integer.
  - Sets `is_active: true`.
  - Returns 409 on duplicate slug.
  - Logs `platform_created`.
- `PATCH /admin/api/platforms/[id]`
  - File: `app/admin/api/platforms/[id]/route.ts`
  - Slug is immutable.
  - Accepts subset of label/category/price/color/initials/is_active/display_order.
  - Same validation as create.
  - Logs `platform_updated` with field-level `changes`.

There is no `DELETE /admin/api/platforms/[id]` implementation despite older plan text mentioning delete/soft-delete. Current platform removal is activate/deactivate via `is_active`.

## 15. Admin components

Shell:

- `AdminNav`
  - Sidebar nav.
  - Uses current pathname to mark active.
  - Shows admin name/email and sign-out button.
- `AdminMobileHeader`
  - Mobile top bar with Radix left drawer containing `AdminNav`.
- `LogoutConfirmDialog`
  - Confirmation modal.
  - Calls `POST /admin/api/logout`.
  - Hard navigates to `/admin/login`.
- `AdminToastProvider` / `AdminToast`
  - Simple context toast system.
  - `useAdminToast().show(message, "success" | "error")`.
  - Success dwell 2.5s, error dwell 4s.

Reports:

- `reportStatus.ts`
  - Source of truth for report statuses and display badges.
  - `isStatusOpen(status)` means `status === "pending"`.
- `ReportRow`
  - List card.
  - Category/status badges and parties.
  - Relative time display.
- `ReportActionModal`
  - Resolve/dismiss/warn/temp-ban/perma-ban confirmation modal.
  - Reason required for user-facing moderation actions.
- `ReportDetailClient`
  - Loads detail API.
  - Shows status/category, reporter notes, parties, other reports, optional conversation messages.
  - Shows action buttons only for pending reports.

Users:

- `userStatus.ts`
  - `getUserDisplayName()` handles nullable display names.
  - `getUserStatus()` priority: admin > self_deleted > perm_banned > temp_banned > active.
  - `getUserStatusDisplay()` badge labels/classes.
  - `canTakeActionOn()` exists but is currently unused.
- `UserRow`
  - Search result row.
- `UserDetailClient`
  - Loads profile/counts and renders identity/count/action/tab sections.
- `UserActionPanel`
  - Shows no actions for admins.
  - Active users: temp/permanent ban.
  - Banned users: restore from ban.
  - Self-deleted users: restore from self-deletion.
- `UserActionModal`
  - Parameterized modal for user actions.
- `UserDetailTabs`
  - Tabs: Listings, Deals, Reports, Audit log.
- `UserListingsTab`
  - Table of listings.
  - Defensive status rendering because `listings.status` has no DB check constraint.
  - Displays raw platform slug.
- `UserDealsTab`
  - Card list of deals.
  - Handles null host/buyer IDs because deals survive profile hard-delete with `ON DELETE SET NULL`.
- `UserReportsTab`
  - Reports filed by and against the user.
  - Links to report detail.
- `UserAuditTab`
  - List of admin actions targeting the user.
  - Expandable JSON payload.

Platforms:

- `PlatformRow`
  - Brand tile, label, slug, active/inactive badge, price, listing count, display order.
  - Edit and activate/deactivate buttons.
  - Invalid stored hex color falls back to gray.
- `PlatformEditorDialog`
  - Create/edit modal.
  - Create mode:
    - Auto-suggests slug from label until slug touched.
    - Auto-fills initials from first 2 letters if empty.
  - Edit mode:
    - Slug disabled/immutable.
  - Live preview tile.
  - Client validation mirrors server validation.
  - 409 duplicate slug surfaces inline on slug field.

## 16. Production schema facts from recon docs

The web repo does not contain Supabase migrations; those live in the mobile repo. The following facts came from read-only production recon files.

`profiles`

- Primary key `id uuid`, FK to `auth.users(id)` with `ON DELETE CASCADE`.
- Important columns:
  - `phone text` nullable, but web copy says phone numbers are not collected.
  - `display_name text` nullable.
  - `bio`, `avatar_url`.
  - `is_verified boolean`.
  - `rating_avg numeric`, `rating_count integer`.
  - `created_at`.
  - `email text`.
  - `deleted_at` for self-delete grace flow.
  - `last_seen_at`, `show_last_seen`.
  - `push_token` and push metadata.
  - TOS/privacy/age/analytics fields.
  - `is_admin boolean not null default false`.
  - `banned_until`, `banned_reason`, `banned_by`.
  - `permanently_banned boolean not null default false`.
- No check constraints.
- Current sole admin is Syed: `b0103e79-885f-4ea8-a353-5a91c2db007c`, email `yaazfashions99@gmail.com`.

`admin_actions`

- Append-only audit table.
- Fields include admin id, action type, target user/resource, reason, payload JSON, created_at.
- Service role writes; no user-facing access.

`user_reports`

- Status enum/check is effectively:
  - `pending`
  - `reviewed`
  - `actioned`
  - `dismissed`
- Resolution actions used by admin:
  - `none`
  - `warned`
  - `banned_temp`
  - `banned_perm`
  - `dismissed`
- FKs:
  - `reporter_id` -> profiles, `ON DELETE CASCADE`.
  - `reported_id` -> profiles, `ON DELETE SET NULL`.
  - `resolved_by`, `reviewed_by` -> profiles, `ON DELETE SET NULL`.
  - Optional conversation/message FKs.

`listings`

- Key columns:
  - `id uuid default gen_random_uuid()`.
  - `user_id uuid not null`, FK profiles `ON DELETE CASCADE`.
  - `platform text not null`.
  - `category text not null`.
  - `title`, `description`.
  - `monthly_price integer`.
  - `slots_total integer`.
  - `duration_months integer`.
  - `status text default 'active'`.
  - `created_at`, `updated_at`, `archived_at`.
- Check constraints:
  - `monthly_price` 1-100000.
  - `slots_total` 1-50.
  - `duration_months` 1-24.
- No check constraint on `status`.
- No FK from `listings.platform` to `platforms.id`.

`deals`

- Key columns:
  - `id uuid default gen_random_uuid()`.
  - `listing_id uuid not null`, FK listings `ON DELETE CASCADE`.
  - `host_id uuid`, FK profiles `ON DELETE SET NULL`.
  - `buyer_id uuid`, FK profiles `ON DELETE SET NULL`.
  - `status text default 'pending'`.
  - `agreed_price integer`.
  - `started_at`, `ends_at`, `created_at`.
  - `conversation_id`, `duration_months`, `terminated_at`.
- Check constraints:
  - `agreed_price` 1-100000.
  - `host_id IS DISTINCT FROM buyer_id`.
  - `status` in `pending`, `active`, `completed`, `disputed`, `cancelled`.

`platforms`

- Key columns:
  - `id text primary key`.
  - `label text`.
  - `category text`.
  - `default_monthly_price integer`.
  - `brand_color text`.
  - `brand_initials text`.
  - `is_active boolean default true`.
  - `display_order integer default 0`.
  - `created_at`.
- No `updated_at`.
- Category check constraint: `music`, `video`, `cloud`, `work`.
- Indexes:
  - PK on id.
  - category index where active.
  - active index.
- Current data quality at recon time:
  - 11 distinct listing platform slugs.
  - All snake_case, no casing/spacing duplicates.

`notifications`

- Used by admin moderation actions for persistent in-app rows.
- The kind check constraint now allows moderation, platform-status, and listing-close admin rows, including:
  - `moderation_warning`
  - `moderation_ban_temp`
  - `moderation_ban_perm`
  - `platform_deactivated`
  - `platform_activated`
  - `listing_closed`
- Admin routes log insert failures but do not fail the primary action.

## 17. Admin phase status

Read `ADMIN_PANEL_PLAN.md` for full details and smoke tests. Current summary:

- Phase 1 - Foundation: shipped.
  - Admin auth, middleware, service-role client, shell, toast system, placeholders.
- Phase 1.1 - Logout/mobile/identity: shipped.
  - Logout route/dialog, mobile admin nav, admin identity in nav.
- Phase 1.2 - Marketing layout isolation: shipped.
  - Public routes moved into `(marketing)` group so admin no longer renders marketing header/footer.
- Phase 2 - Reports queue: shipped.
  - Reports list/detail, resolve/dismiss/warn/ban.
- Phase 2.1 - Report status alignment: shipped.
  - Real statuses are pending/reviewed/actioned/dismissed.
- Phase 2.2 - Persistent moderation notifications and permanent-ban fix: shipped.
  - Permanent ban uses `permanently_banned`, not `deleted_at`.
- Phase 2.3 - Notification kind constraint and logging: shipped.
  - Moderation notification kinds added; logging made greppable.
- Phase 3 - Users management: shipped.
  - Search, detail, listings/deals/reports/audit tabs, user ban/restore.
- Phase 4 - Platforms management: shipped.
  - Catalog list/create/update/activate-deactivate.
- Phase 4.1 - Mobile PlatformTile fallback rollout: shipped in the mobile repo.
  - Admin panel unchanged.
- Phase 5 - Listings management: verified by Syed.
  - Search/list/detail listings; force-close active listings with reason; host notification/push; no deal mutation.
- Phase 6 - Deals management: verified by Syed.
  - Search/list/detail deals; force-terminate pending/active deals with reason; host+buyer notification/push; best-effort system chat event; no listing/rating/unrelated-deal mutation.
- Phase 7 - Audit log viewer: verified by Syed.
- Phase 8 - Manual incident broadcast push: verified by Syed.
- Phase 9 - Admin dashboard analytics and refresh: shipped, awaiting Syed smoke verification.

Important permanent scope decision: re-engagement push notifications are out of scope permanently. Only transactional/functional/commitment/incident pushes are allowed.

## 18. Mobile repo coordination

The mobile app is a separate repo at `/Users/syedejazahammed/Documents/GitHub/bantle`.

Web routes linked from mobile settings:

- `https://bantle.in/privacy`
- `https://bantle.in/terms`
- `https://bantle.in/faq`
- `mailto:support@bantle.in`
- `mailto:feedback@bantle.in`

Web to mobile deep link:

- `bantle://` is used on `/verify`.
- It is intentionally not used on `/reset-password` success because of a previous mobile splash freeze.

Mobile platform catalog behavior from Phase 4 recon:

- Mobile has `stores/platforms.ts`, `lib/platforms.ts`, and `PlatformTile`.
- Platform picker reads from the platform store, not hardcoded constants.
- Deactivated platforms are hidden from picker.
- After Phase 4.1, mobile fetches all platform rows so historical listings keep their brand tile even when a platform is inactive.
- New platforms appear to existing users after the mobile store re-inits (usually next sign-in/cold start). No web change can force-refresh currently.

Admin moderation mobile dependencies:

- Mobile gates temp/perma banned users.
- Mobile displays persistent moderation notifications.
- Mobile has an Android `moderation` notification channel.

## 19. Known inconsistencies and stale areas

These are not necessarily urgent bugs, but future agents should know them.

1. `README.md` and `BANTLE_WEB_PROJECT_DUMP.md` are outdated about "no backend, no auth." The admin panel now has route handlers and auth.
2. `BANTLE_WEB_PROJECT_DUMP.md` still has marketplace-era descriptions. Current product positioning is household coordination.
3. `app/(marketing)/support/page.tsx` still references OTP/SMS delivery, contradicting email-only/no-phone positioning.
4. `app/(marketing)/opengraph-image.tsx` says "trusted neighbours" and "Play Store & App Store." This may be stale relative to household-only copy and Android-first messaging.
5. Some report/perma-ban comments and modal copy still say "soft-delete" or "7-day cron" for permanent bans. Current code sets `profiles.permanently_banned = true` and should not self-restore through `deleted_at`.
6. Permanent-ban audit action type is currently `user_soft_deleted` in report and user ban routes. This is semantically stale; a future cleanup could introduce/use `user_banned` with payload `{ type: "permanent" }` or add `user_permanently_banned`.
7. `components/ui/button.tsx` exposes `asChild?: boolean` but ignores it. Do not rely on shadcn Slot behavior unless you implement it.
8. `PlatformEditorDialog` and `PlatformRow` use `font-bold` on brand tiles, despite the old README saying 600/700 are banned. Existing app already does this.
9. Admin API route comments sometimes say `/api/admin/...`; actual paths are `/admin/api/...`.
10. `ADMIN_PANEL_PLAN.md` Phase 4 originally mentioned DELETE/soft-delete, but shipped code uses only `PATCH is_active`.
11. `UserListingsTab` still displays raw platform slug rather than joining/resolving platform label.

## 20. How to add or change public pages

For a normal public content page:

1. Add route under `app/(marketing)/your-route/page.tsx`.
2. Export `metadata`.
3. Use `PageHeader`.
4. Put long-form content inside `article.container-x.prose-bantle`.
5. Import constants from `lib/constants.ts`; do not hardcode email/legal identity.
6. Add to `NAV_LINKS` or `LEGAL_LINKS` only if it should appear in nav/footer.
7. Keep household-only positioning unless the product direction explicitly changes.
8. Run `npm run build` and `npm run lint`.

If a page needs URL search params:

- Use a server `page.tsx` with metadata and `<Suspense>`.
- Put `useSearchParams()` in a `"use client"` child.
- See `/verify` and `/reset-password`.

## 21. How to add admin features

Use these patterns:

1. Page route under `app/admin/...`.
2. Client component for interactive UI if needed.
3. API route under `app/admin/api/...`.
4. First line of every admin route handler should be:

```ts
const auth = await requireAdmin(request);
if ("error" in auth) return auth.error;
const { admin, supabase } = auth;
```

5. Use the service-role `supabase` from `requireAdmin()` for privileged DB work.
6. Validate request bodies server-side even if client validates.
7. Use 400/401/403/404/409/500 style JSON errors consistently.
8. For state changes:
   - Perform primary action first.
   - Then write `admin_actions` through `logAdminAction`.
   - Do not log an action before the primary action succeeds.
9. Use `useAdminToast()` for client feedback.
10. If adding enum-like DB values, query and update CHECK constraints in the mobile repo migrations during the same phase.

Before starting any admin roadmap phase, read `ADMIN_PANEL_PLAN.md` in full and update phase status exactly as that doc instructs.

## 22. Pending roadmap details

Phase 5 - Listings management:

- Shipped 2026-05-23 and verified by Syed.
- Production migration added `listings.closed_reason`, `closed_by`, and `closed_at`.
- Routes:
  - `GET /admin/api/listings`
  - `GET /admin/api/listings/[id]`
  - `POST /admin/api/listings/[id]/close`
- Force-close semantics:
  - Set listing `status = 'closed'` with close reason/by/at.
  - Leave `archived_at` unchanged.
  - Do not mutate deals, conversations, or messages.
  - Notify host only with `listing_closed`; no saved-only or all-user notification.

Phase 6 - Deals management:

- Shipped 2026-05-23, awaiting Syed verification.
- Routes:
  - `GET /admin/api/deals`
  - `GET /admin/api/deals/[id]`
  - `POST /admin/api/deals/[id]/terminate`
- Force-terminate semantics:
  - Allow pending/active only.
  - Set `status = 'cancelled'`, preserve/set `terminated_at`, and write `terminated_by`, `termination_reason`, `termination_source = 'admin'`.
  - Notify host and buyer only with `deal_terminated`; no saved-only or all-user notification.
  - Best-effort system chat event uses `messages.kind = 'deal_cancelled'`.
  - Do not mutate listings, ratings, conversations, archives, started/ends dates, or unrelated deals.

Phase 7 - Audit log viewer:

- Verified by Syed.
- Route:
  - `GET /admin/api/audit`
- `/admin/audit` is a top-level read-only `admin_actions` feed with filters by action/resource/date/search and collapsed payload rendering.

Phase 8 - Manual broadcast push:

- Verified by Syed.
- Routes:
  - `GET /admin/api/broadcasts`
  - `POST /admin/api/broadcasts`
  - `GET /admin/api/broadcasts/preview`
  - `POST /admin/api/broadcasts/[id]/retry`
- Page:
  - `/admin/broadcasts`
- Supabase:
  - `broadcasts`
  - `broadcast_recipients`
  - `notifications.kind = broadcast_incident`
  - dedicated Edge Function `broadcast_push_dispatcher`
- Semantics:
  - Incident-only, not marketing, not re-engagement.
  - Default audience is `all_eligible`; `test_syed` is available for smoke verification only.
  - All-user sends are not blocked by a 24-hour cooldown; admins may send repeated incident updates when operationally necessary.
  - Persistent in-app rows are created for eligible recipients independently from push delivery; pushes go only to users with `push_token`.
  - Pushes are sent one recipient/token per Expo request to avoid mixed-project token batch failures.
  - Failed/partial broadcasts can be retried without creating a new broadcast row or duplicating existing notification rows.
  - User-facing broadcast push and in-app notifications show the admin-entered title/body. Fallback copy is only used for malformed or missing payloads.
  - Privileged Edge Function calls now require trusted internal authorization before service-role work. Web/admin callers pass `x-bantle-internal-secret` from server-only `BANTLE_INTERNAL_FUNCTION_SECRET`; existing service-role bearer invocations remain supported for database webhook/cron compatibility. The Vercel Production env var is configured; Preview requires branch-specific env setup before testing privileged calls there.
  - In-app broadcast row taps mark read and stay on `/notifications`; push banner taps open `/notifications` without stacking when already there.
  - Push notification responses are consumed once with a central handler, in-memory and persisted recent response keys, and `clearLastNotificationResponseAsync()` when available.
  - Deleted, permanently banned, and currently temp-banned users are excluded.
  - User-visible payload does not include admin id, internal reason, emails, push tokens, or recipient lists.
  - Codex did not send an all-user broadcast during implementation.

Phase 9 - Admin dashboard analytics and refresh:

- Shipped 2026-05-24, awaiting Syed verification.
- Route:
  - `GET /admin/api/dashboard`
- Page:
  - `/admin`
- Semantics:
  - Replaces the stale Phase 5-8 placeholder copy with an operational admin dashboard.
  - Uses `requireAdmin()` plus the server-only service-role Supabase client in the API route.
  - Returns aggregate counts only for users, reports, listings, deals, platforms, broadcasts, and audit actions.
  - Shows recent admin actions without exposing raw user lists or push tokens.
  - Includes quick links to Reports, Users, Listings, Deals, Audit, Broadcasts, and Platforms.
  - Broadcast copy remains incident-only / not marketing; audit copy is read-only.
  - No marketing analytics, re-engagement analytics, PostHog dashboard embed, mobile change, schema migration, or production data mutation was added.

## 23. Verification checklist for future changes

Basic:

```bash
npm run lint
npm run build
```

Manual public checks:

- `/`
- `/about`
- `/faq`
- `/privacy`
- `/terms`
- `/verify`
- `/reset-password` with no tokens should show safe error/neutral state.

Manual admin checks:

- Signed out `/admin` redirects to `/admin/login`.
- Admin can sign in and reach `/admin`.
- Non-admin is redirected to `/`.
- `/admin/reports` loads and filters.
- `/admin/users` search works.
- `/admin/platforms` loads grouped catalog.
- Logout clears session and returns to login.

For moderation changes:

- Confirm DB state changes.
- Confirm `admin_actions` row.
- Confirm notification row if expected.
- Confirm Expo push failure does not break primary action unless explicitly required.

For mobile-affecting schema/notifications:

- Update mobile repo migrations/types.
- Update mobile app code.
- Rebuild APK when behavior must be tested on device.

## 24. Quick file index

Core:

- `app/layout.tsx`
- `app/(marketing)/layout.tsx`
- `app/admin/layout.tsx`
- `middleware.ts`
- `lib/constants.ts`
- `lib/tos.ts`
- `lib/utils.ts`

Supabase/auth:

- `lib/supabase.ts`
- `lib/admin-supabase-browser.ts`
- `lib/admin-supabase-route.ts`
- `lib/admin-supabase-server.ts`
- `lib/admin-auth.ts`
- `lib/admin-actions.ts`
- `lib/admin-push.ts`

Marketing:

- `app/(marketing)/page.tsx`
- `app/(marketing)/about/page.tsx`
- `app/(marketing)/how-it-works/page.tsx`
- `app/(marketing)/safety/page.tsx`
- `app/(marketing)/faq/page.tsx`
- `app/(marketing)/support/page.tsx`
- `app/(marketing)/privacy/page.tsx`
- `app/(marketing)/terms/page.tsx`
- `app/(marketing)/refund-policy/page.tsx`
- `app/(marketing)/community-guidelines/page.tsx`
- `app/(marketing)/verify/page.tsx`
- `app/(marketing)/verify/VerifyClient.tsx`
- `app/(marketing)/reset-password/page.tsx`
- `app/(marketing)/reset-password/ResetPasswordClient.tsx`

Marketing components:

- `components/Header.tsx`
- `components/Footer.tsx`
- `components/MobileNav.tsx`
- `components/HeroSection.tsx`
- `components/ComingSoonBadges.tsx`
- `components/FeatureCard.tsx`
- `components/PageHeader.tsx`
- `components/ui/button.tsx`
- `components/ui/sheet.tsx`

Admin shell/components:

- `components/admin/AdminNav.tsx`
- `components/admin/AdminMobileHeader.tsx`
- `components/admin/AdminToast.tsx`
- `components/admin/AdminToastProvider.tsx`
- `components/admin/LogoutConfirmDialog.tsx`

Admin reports:

- `app/admin/reports/page.tsx`
- `app/admin/reports/ReportsListClient.tsx`
- `app/admin/reports/[id]/page.tsx`
- `app/admin/reports/[id]/ReportDetailClient.tsx`
- `app/admin/api/reports/route.ts`
- `app/admin/api/reports/[id]/route.ts`
- `app/admin/api/reports/[id]/resolve/route.ts`
- `components/admin/reportStatus.ts`
- `components/admin/ReportRow.tsx`
- `components/admin/ReportActionModal.tsx`

Admin users:

- `app/admin/users/page.tsx`
- `app/admin/users/UsersListClient.tsx`
- `app/admin/users/[id]/page.tsx`
- `app/admin/users/[id]/UserDetailClient.tsx`
- `app/admin/api/users/route.ts`
- `app/admin/api/users/[id]/route.ts`
- `app/admin/api/users/[id]/ban/route.ts`
- `app/admin/api/users/[id]/restore/route.ts`
- `app/admin/api/users/[id]/listings/route.ts`
- `app/admin/api/users/[id]/deals/route.ts`
- `app/admin/api/users/[id]/reports/route.ts`
- `app/admin/api/users/[id]/audit/route.ts`
- `components/admin/userStatus.ts`
- `components/admin/UserRow.tsx`
- `components/admin/UserActionPanel.tsx`
- `components/admin/UserActionModal.tsx`
- `components/admin/UserDetailTabs.tsx`
- `components/admin/UserListingsTab.tsx`
- `components/admin/UserDealsTab.tsx`
- `components/admin/UserReportsTab.tsx`
- `components/admin/UserAuditTab.tsx`

Admin listings:

- `app/admin/listings/page.tsx`
- `app/admin/listings/ListingsClient.tsx`
- `app/admin/listings/[id]/page.tsx`
- `app/admin/listings/[id]/ListingDetailClient.tsx`
- `app/admin/api/listings/route.ts`
- `app/admin/api/listings/[id]/route.ts`
- `app/admin/api/listings/[id]/close/route.ts`
- `components/admin/ListingCloseModal.tsx`
- `components/admin/ListingRow.tsx`
- `components/admin/ListingStatusBadge.tsx`

Admin platforms:

- `app/admin/platforms/page.tsx`
- `app/admin/platforms/PlatformsListClient.tsx`
- `app/admin/api/platforms/route.ts`
- `app/admin/api/platforms/[id]/route.ts`
- `components/admin/PlatformRow.tsx`
- `components/admin/PlatformEditorDialog.tsx`

Docs/plans:

- `README.md`
- `BANTLE_WEB_PROJECT_DUMP.md`
- `ADMIN_PANEL_PLAN.md`
- `PHASE_3_RECON.md`
- `PHASE_4_RECON.md`

## 25. Platform Activation/Deactivation Update — 2026-05-23

Platform activation/deactivation now has transition-aware admin behavior:

- `PATCH /admin/api/platforms/[id]` detects active-to-inactive and inactive-to-active transitions.
- Deactivation notifies only transactional recipients: active-listing hosts and pending/active deal participants for that platform.
- Activation notifies only hosts with active, unarchived listings for that platform.
- Saved-only users, all users, and re-engagement audiences are not notified by default.
- Persistent notification rows use `platform_deactivated` or `platform_activated`.
- Push is best-effort through the mobile repo's `send_push_notification` Edge Function.
- Platform toggles must not delete, archive, close, cancel, complete, or date-mutate listings or deals.

Deployment notes:

- Do not deploy admin fanout before the mobile app supports the notification kind being inserted.
- Apply mobile repo migrations before enabling the corresponding admin action broadly.
- Deploy the updated `send_push_notification` Edge Function before relying on new transactional push kinds.
- See `PLATFORM_DEACTIVATION_IMPLEMENTATION.md` in both repos for smoke tests and rollback notes.

## 26. Phase 5 Listings Management Update — 2026-05-23

Listings management shipped and was verified by Syed:

- `/admin/listings` searches and filters listings by host, title, platform, status, and archive state.
- `/admin/listings/[id]` shows listing state, host, active/pending deals, recent deals, audit entries, and host report counts.
- Force-close sets `listings.status = 'closed'` plus `closed_reason`, `closed_by`, `closed_at`, and `updated_at`.
- Force-close does not delete/archive listings, mutate deals, alter deal dates, or touch conversations/messages.
- Only the host receives a persistent `listing_closed` notification and best-effort transactional push.
- Saved-only users, deal participants, all users, and re-engagement audiences are not notified in Phase 5.
- Production Supabase migration and `send_push_notification` deployment are complete; mobile release is still required for first-class `listing_closed` notification UI.

## 27. Phase 6 Deals Management Update — 2026-05-23

Deals management shipped in code and was verified by Syed:

- `/admin/deals` searches and filters deals by deal/listing/user identity, participant email/name, platform, status, and role.
- `/admin/deals/[id]` shows deal state, listing, host, buyer, conversation, recent messages, ratings, and audit entries.
- Force-terminate accepts pending/active deals only and writes `status = 'cancelled'`, `terminated_at`, `terminated_by`, `termination_reason`, and `termination_source = 'admin'`.
- Force-terminate does not close/archive listings, mutate `started_at`/`ends_at`, mutate ratings, delete conversations/messages, archive deals, or touch unrelated deals.
- Host and buyer receive persistent `deal_terminated` notifications and best-effort transactional pushes through the Edge Function.
- A best-effort system chat event is inserted using existing `deal_cancelled` message kind so mobile can render "Deal terminated by Bantle."
- Saved-only users, unrelated users, all users, and re-engagement audiences are not notified in Phase 6.
- Production Supabase migration and `send_push_notification` deployment are complete; mobile release is still required for first-class `deal_terminated` notification and admin-termination UI.

## 28. Phase 7 Audit Log Viewer Update — 2026-05-23

Audit log viewer shipped in code and was verified by Syed:

- `/admin/audit` lists `admin_actions` latest-first.
- `/admin/api/audit` is a read-only GET route guarded by `requireAdmin()` and backed by the service-role Supabase client.
- Filters cover action type, target resource type, date range, and search by action/reason/resource/user/UUID.
- Payload JSON is collapsed by default and display-redacts suspicious keys containing token/secret/key/password/authorization/private.
- Known resources link to user, listing, deal, report, or platform admin surfaces.
- Phase 7 added no Supabase migration and no mobile changes.

## 29. Phase 8 Incident Broadcast Update — 2026-05-24

Incident broadcast push was verified by Syed:

- `/admin/broadcasts` shows an incident-only warning, a guarded send form, recipient preview counts, and recent broadcast summaries.
- `/admin/api/broadcasts` supports read-only recent broadcast listing and guarded POST sends.
- `/admin/api/broadcasts/preview` is read-only and returns recipient/push-token counts for `test_syed` or `all_eligible`.
- Production Supabase migration `20260524000345_phase_8_incident_broadcasts.sql` added service-role-only `broadcasts` and `broadcast_recipients` tables plus `broadcast_incident` in `notifications_kind_check`.
- Dedicated Edge Function `broadcast_push_dispatcher` creates/reuses persistent notifications, sends Expo pushes one recipient/token per request on the `incident_broadcast` channel, clears stale tokens on `DeviceNotRegistered`, and updates broadcast/recipient counts.
- `/admin/api/broadcasts/[id]/retry` and the Retry failed delivery UI retry existing failed/partial broadcasts without creating a new broadcast row.
- User-facing push and in-app broadcast notifications show the admin-entered title/body; admin-only reason is not shown to users, and fallback copy is only for malformed payloads.
- In-app broadcast notification row taps mark read and stay on the Notifications screen; push banner taps open Notifications without stacking when already there.
- Push notification responses are consumed once using a central mobile handler, an in-memory set, and persisted recent response keys, so stale Expo last-response data does not re-navigate after app reopen/resume.
- `all_eligible` sends require exact confirmation, a mandatory admin-only reason, URL-free user-visible copy, and marketing/re-engagement wording checks.
- There is no 24-hour all-user cooldown; admins may send outage-start and outage-resolved updates when needed.
- `all_eligible` is the default audience. `test_syed` remains available only for smoke verification.
- Latest observed all-user broadcast `29f165e4-efaf-4eb2-b1de-6d2896588dbe` had 20 in-app notifications with title/body payload fields; read-only inspection during the copy clarity fix showed it as `completed`.
- Codex did not send an all-user broadcast during implementation, the cooldown-removal adjustment, the reliability fix, or the copy clarity fix.

## 30. Phase 9 Dashboard Analytics Update — 2026-05-24

Phase 8 incident broadcasts were verified by Syed. Phase 9 dashboard analytics is shipped in code and awaiting Syed smoke verification:

- `/admin` no longer says Listings, Deals, Audit, and Broadcasts are future phases.
- `/admin/api/dashboard` is a read-only admin route guarded by `requireAdmin()` and using the service-role Supabase client server-side only.
- The dashboard shows aggregate operational metrics for users, reports, listings, deals, platforms, broadcasts, and audit actions.
- Report `open` maps to `user_reports.status = 'pending'`; report `resolved` combines `reviewed` and `actioned`.
- The dashboard includes quick links to the completed admin modules and a recent admin actions feed.
- Broadcasts are labeled incident-only / not marketing, and audit access is labeled read-only.
- No schema migration, mobile change, marketing analytics, re-engagement analytics, PostHog embed, raw user list, or production data mutation was added.

## 31. One-sentence mental model

This repo is the public face and admin console for Bantle: the public side explains a household subscription coordination app and handles Supabase email flows, while the admin side uses cookie-authenticated Supabase sessions plus service-role API routes to moderate reports/users, manage listings/deals, view audit history, send incident-only broadcasts, and maintain the platform catalog.
