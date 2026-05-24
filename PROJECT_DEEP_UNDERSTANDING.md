# Bantle Web Deep Understanding

Generated: 2026-05-19

This document records a deep read of the local repository plus a read-only inspection of the connected Supabase project. It is meant to be the current operational map for future work in this codebase.

## Phase 9 Dashboard Analytics Update — 2026-05-24

Phase 8 incident broadcasts were verified by Syed. Phase 9 dashboard analytics is shipped and awaiting Syed smoke verification.

- Web/admin added `GET /admin/api/dashboard`.
- `/admin` now renders read-only operational metrics instead of stale Phase 5-8 placeholder copy.
- Metrics cover users, reports, listings, deals, platforms, broadcasts, and audit actions.
- Report `open` maps to `pending`; report `resolved` combines `reviewed` and `actioned`.
- The dashboard includes recent admin actions and quick links to Reports, Users, Listings, Deals, Audit, Broadcasts, and Platforms.
- Broadcast dashboard copy stays incident-only / not marketing, and audit copy is read-only.
- No schema migration, mobile code change, marketing analytics, re-engagement analytics, PostHog embed, raw user lists, or production data mutation was added.

## Phase 8 Incident Broadcast Update — 2026-05-24

Phase 7 audit log viewer was verified by Syed. Phase 8 incident broadcast push was verified by Syed.

- Web/admin added `/admin/broadcasts`.
- API routes added: `GET /admin/api/broadcasts`, `POST /admin/api/broadcasts`, `GET /admin/api/broadcasts/preview`, and `POST /admin/api/broadcasts/[id]/retry`.
- Production migration `20260524000345_phase_8_incident_broadcasts.sql` added service-role-only `broadcasts` and `broadcast_recipients` tables plus `broadcast_incident` in `notifications_kind_check`.
- Dedicated Edge Function `broadcast_push_dispatcher` creates/reuses persistent in-app notifications, sends Expo pushes one recipient/token per request on the `incident_broadcast` channel, clears stale push tokens on `DeviceNotRegistered`, and updates summary counts.
- Broadcasts are incident-only: no marketing, no re-engagement, mandatory admin-only reason, exact confirmation phrase, and URL/marketing-copy validation.
- Default audience is `all_eligible`; `test_syed` remains available for smoke verification only.
- There is no 24-hour all-user cooldown. Admins may send repeated incident updates when operationally necessary.
- Failed/partial broadcasts can be retried without creating a new broadcast row or duplicating existing notification rows.
- User-facing broadcast push and in-app notifications show the admin-entered title/body. Admin-only reason is not shown to users, and fallback copy is only for malformed payloads.
- In-app broadcast row taps mark read and stay on `/notifications`; push banner taps open `/notifications` without stacking when already there.
- Mobile push notification responses are consumed once with a central handler, in-memory and persisted recent response keys, and `clearLastNotificationResponseAsync()` when available, preventing stale Expo last-response navigation loops.
- Latest observed all-user broadcast `29f165e4-efaf-4eb2-b1de-6d2896588dbe` had 20 in-app notifications with title/body payload fields; read-only inspection during the copy clarity fix showed it as `completed`.
- Codex did not send an all-user broadcast during implementation, the cooldown-removal adjustment, the reliability fix, or the copy clarity fix.

## Phase 7 Audit Log Viewer Update — 2026-05-23

Phase 6 deals management was verified by Syed. Phase 7 audit log viewer was verified by Syed.

- Web/admin added `/admin/audit`.
- API route added: `GET /admin/api/audit`.
- The route is read-only, calls `requireAdmin()`, uses the service-role Supabase client server-side, and returns `admin_actions` latest-first.
- Filters support action type, admin id, target user id, target resource type/id, date range, and q search over action/reason/resource/user/UUID.
- Payload JSON is collapsed by default in the UI and display-redacts suspicious keys containing token/secret/key/password/authorization/private.
- No migration, mobile code change, or Supabase schema change was needed for Phase 7.

## Phase 6 Deals Management Update — 2026-05-23

Phase 5 listings management was verified by Syed. Phase 6 deals management was verified by Syed.

- Web/admin added `/admin/deals` and `/admin/deals/[id]`.
- API routes added: `GET /admin/api/deals`, `GET /admin/api/deals/[id]`, and `POST /admin/api/deals/[id]/terminate`.
- Production migration `20260523182659_phase_6_deal_admin_termination.sql` added `deals.terminated_by`, `termination_reason`, `termination_source`, supporting admin indexes, and `deal_terminated` in `notifications_kind_check`.
- Force-termination is pending/active only, sets `status = 'cancelled'`, preserves/sets `terminated_at`, and records admin termination metadata.
- Force-termination does not mutate listings, ratings, conversations, archives, started/ends dates, or unrelated deals.
- Host and buyer receive persistent `deal_terminated` rows and best-effort transactional pushes via `send_push_notification`.
- A best-effort system chat event uses existing `messages.kind = 'deal_cancelled'` with Bantle termination copy.
- Mobile support was pushed in bantle commit `b651188`; web/admin API/UI commits are `320a957` and `f721792`.

## Safety Boundary

- Supabase was used only through read-only MCP inspection tools and read-only SQL metadata queries.
- No Supabase migrations were applied.
- No tables were inserted, updated, deleted, truncated, restored, or migrated.
- No restore workflow was run.
- Secrets are intentionally not printed here.
- One database trigger definition contains an embedded bearer token in its HTTP metadata. That value was observed only as schema metadata and is deliberately redacted from this document.
- The Supabase project name contains an email address. This document identifies the project by ref only.

## Executive Model

- The repository is a Next.js 14 App Router web app.
- It has two major surfaces:
  - Public marketing/support/legal pages under `app/(marketing)`.
  - A protected admin panel under `app/admin`.
- Supabase is not only a mobile-app backend. The web app uses Supabase for:
  - Public reset-password flow.
  - Public verify landing page.
  - Admin cookie-session login.
  - Admin API route authorization.
  - Service-role admin reads/writes for moderation and platform catalog management.
- Existing historical docs that say "no backend, no auth, no database" are stale for the current web repo.
- The production database is the source of truth for users, listings, deals, reports, notifications, platform catalog, and admin audit records.

## Current Supabase Project

- Project ref: `fpoviccitrraonvvgont`
- Region: `ap-northeast-1`
- Status: `ACTIVE_HEALTHY`
- Postgres engine: `17`
- Database version: `17.6.1.113`
- Project created: `2026-05-05T19:52:07.387815Z`
- Public schemas inspected: `public`, `auth`, and `storage`.
- Edge functions inspected: `milestone_checkin_dispatcher`, `account_hard_delete_dispatcher`, `send_push_notification`, `export_user_data`.

## Scan Coverage

The local source scan covered these files and line counts. This is the coverage ledger for the repository read. Every listed code/config/documentation file was included in the understanding pass.

| File | Lines | Coverage note |
| --- | ---: | --- |
| `.eslintrc.json` | 3 | ESLint config read fully. |
| `ADMIN_PANEL_PLAN.md` | 913 | Admin roadmap/status read for phase context. |
| `BANTLE_WEB_PROJECT_DUMP.md` | 320 | Historical dump read for stale/current deltas. |
| `PHASE_3_RECON.md` | 235 | Users-management database recon read. |
| `PHASE_4_RECON.md` | 400 | Platforms-management database/mobile/web recon read. |
| `README.md` | 201 | Project README read; several statements are now stale. |
| `app/(marketing)/about/page.tsx` | 129 | Static about page read fully. |
| `app/(marketing)/community-guidelines/page.tsx` | 177 | Static guidelines page read fully. |
| `app/(marketing)/faq/page.tsx` | 355 | Static FAQ page read fully. |
| `app/(marketing)/how-it-works/page.tsx` | 124 | Static workflow page read fully. |
| `app/(marketing)/layout.tsx` | 32 | Public layout wrapper read fully. |
| `app/(marketing)/opengraph-image.tsx` | 87 | Dynamic Open Graph image read fully. |
| `app/(marketing)/page.tsx` | 207 | Landing page read fully. |
| `app/(marketing)/privacy/page.tsx` | 321 | Privacy policy page read fully. |
| `app/(marketing)/refund-policy/page.tsx` | 110 | Refund policy page read fully. |
| `app/(marketing)/reset-password/ResetPasswordClient.tsx` | 374 | Reset-password client flow read fully. |
| `app/(marketing)/reset-password/page.tsx` | 53 | Reset-password route wrapper read fully. |
| `app/(marketing)/safety/page.tsx` | 180 | Safety page read fully. |
| `app/(marketing)/support/page.tsx` | 115 | Support page read fully. |
| `app/(marketing)/terms/page.tsx` | 432 | Terms page read fully. |
| `app/(marketing)/verify/VerifyClient.tsx` | 156 | Verification client flow read fully. |
| `app/(marketing)/verify/page.tsx` | 34 | Verification route wrapper read fully. |
| `app/admin/api/logout/route.ts` | 15 | Logout API read fully. |
| `app/admin/api/platforms/[id]/route.ts` | 149 | Platform update API read fully. |
| `app/admin/api/platforms/route.ts` | 175 | Platform list/create API read fully. |
| `app/admin/api/reports/[id]/resolve/route.ts` | 302 | Report resolution API read fully. |
| `app/admin/api/reports/[id]/route.ts` | 91 | Report detail API read fully. |
| `app/admin/api/reports/route.ts` | 63 | Reports list API read fully. |
| `app/admin/api/users/[id]/audit/route.ts` | 36 | User audit API read fully. |
| `app/admin/api/users/[id]/ban/route.ts` | 191 | User ban API read fully. |
| `app/admin/api/users/[id]/deals/route.ts` | 49 | User deals API read fully. |
| `app/admin/api/users/[id]/listings/route.ts` | 43 | User listings API read fully. |
| `app/admin/api/users/[id]/reports/route.ts` | 57 | User reports API read fully. |
| `app/admin/api/users/[id]/restore/route.ts` | 96 | User restore API read fully. |
| `app/admin/api/users/[id]/route.ts` | 73 | User detail API read fully. |
| `app/admin/api/users/route.ts` | 59 | Users search API read fully. |
| `app/admin/layout.tsx` | 92 | Admin shell layout read fully. |
| `app/admin/login/LoginClient.tsx` | 155 | Admin login client read fully. |
| `app/admin/login/page.tsx` | 15 | Admin login page wrapper read fully. |
| `app/admin/page.tsx` | 59 | Admin dashboard read fully. |
| `app/admin/platforms/PlatformsListClient.tsx` | 176 | Platforms client read fully. |
| `app/admin/platforms/page.tsx` | 30 | Platforms page wrapper read fully. |
| `app/admin/reports/ReportsListClient.tsx` | 150 | Reports list client read fully. |
| `app/admin/reports/[id]/ReportDetailClient.tsx` | 387 | Report detail client read fully. |
| `app/admin/reports/[id]/page.tsx` | 32 | Report detail page wrapper read fully. |
| `app/admin/reports/page.tsx` | 28 | Reports page wrapper read fully. |
| `app/admin/users/UsersListClient.tsx` | 151 | Users list client read fully. |
| `app/admin/users/[id]/UserDetailClient.tsx` | 241 | User detail client read fully. |
| `app/admin/users/[id]/page.tsx` | 23 | User detail page wrapper read fully. |
| `app/admin/users/page.tsx` | 29 | Users page wrapper read fully. |
| `app/apple-icon.svg` | 4 | Icon asset read fully. |
| `app/globals.css` | 77 | Global CSS read fully. |
| `app/icon.svg` | 4 | Icon asset read fully. |
| `app/layout.tsx` | 71 | Root layout and metadata read fully. |
| `components/ComingSoonBadges.tsx` | 97 | Store badge component read fully. |
| `components/FeatureCard.tsx` | 19 | Feature card read fully. |
| `components/Footer.tsx` | 86 | Footer read fully. |
| `components/Header.tsx` | 34 | Public header read fully. |
| `components/HeroSection.tsx` | 124 | Landing hero read fully. |
| `components/MobileNav.tsx` | 68 | Mobile navigation read fully. |
| `components/PageHeader.tsx` | 27 | Page-header primitive read fully. |
| `components/admin/AdminMobileHeader.tsx` | 71 | Mobile admin drawer read fully. |
| `components/admin/AdminNav.tsx` | 91 | Admin sidebar/drawer nav read fully. |
| `components/admin/AdminToast.tsx` | 65 | Toast visual component read fully. |
| `components/admin/AdminToastProvider.tsx` | 53 | Toast provider read fully. |
| `components/admin/LogoutConfirmDialog.tsx` | 109 | Logout dialog read fully. |
| `components/admin/PlatformEditorDialog.tsx` | 488 | Platform create/edit dialog read fully. |
| `components/admin/PlatformRow.tsx` | 131 | Platform row/tile read fully. |
| `components/admin/ReportActionModal.tsx` | 232 | Report action dialog read fully. |
| `components/admin/ReportRow.tsx` | 140 | Report list row read fully. |
| `components/admin/UserActionModal.tsx` | 231 | User moderation dialog read fully. |
| `components/admin/UserActionPanel.tsx` | 128 | User moderation panel read fully. |
| `components/admin/UserAuditTab.tsx` | 128 | User audit tab read fully. |
| `components/admin/UserDealsTab.tsx` | 240 | User deals tab read fully. |
| `components/admin/UserDetailTabs.tsx` | 86 | User detail tabs read fully. |
| `components/admin/UserListingsTab.tsx` | 185 | User listings tab read fully. |
| `components/admin/UserReportsTab.tsx` | 192 | User reports tab read fully. |
| `components/admin/UserRow.tsx` | 79 | User list row read fully. |
| `components/admin/reportStatus.ts` | 118 | Report status helpers read fully. |
| `components/admin/userStatus.ts` | 87 | User status helpers read fully. |
| `components/ui/button.tsx` | 49 | Button primitive read fully. |
| `components/ui/sheet.tsx` | 94 | Sheet primitive read fully. |
| `lib/admin-actions.ts` | 54 | Admin audit helper read fully. |
| `lib/admin-auth.ts` | 65 | Admin route auth helper read fully. |
| `lib/admin-push.ts` | 77 | Admin push helper read fully. |
| `lib/admin-supabase-browser.ts` | 26 | Browser Supabase client read fully. |
| `lib/admin-supabase-route.ts` | 37 | Route/middleware Supabase client read fully. |
| `lib/admin-supabase-server.ts` | 43 | Service-role Supabase client read fully. |
| `lib/constants.ts` | 33 | Brand/legal constants read fully. |
| `lib/supabase.ts` | 33 | Public browser Supabase client read fully. |
| `lib/tos.ts` | 21 | TOS version metadata read fully. |
| `lib/utils.ts` | 6 | Utility helper read fully. |
| `middleware.ts` | 68 | Admin route middleware read fully. |
| `next.config.mjs` | 4 | Next config read fully. |
| `package.json` | 33 | Package metadata/scripts/deps read fully. |
| `postcss.config.mjs` | 8 | PostCSS config read fully. |
| `tailwind.config.ts` | 53 | Tailwind theme read fully. |
| `tsconfig.json` | 26 | TypeScript config read fully. |

Total covered lines in this ledger: 12,120.

## Repository Architecture

### Package and Build

- `package.json` defines a Next 14.2.35 app using React 18 and TypeScript 5.
- Scripts are:
  - `dev`: `next dev`
  - `build`: `next build`
  - `start`: `next start`
  - `lint`: `next lint`
- Key dependencies:
  - `@supabase/supabase-js` for browser/admin API interactions.
  - `@supabase/ssr` for cookie-based middleware/server auth.
  - `@radix-ui/react-dialog` for dialogs and sheet primitives.
  - `lucide-react` for iconography.
  - `class-variance-authority`, `clsx`, and `tailwind-merge` for component styling.
- `tsconfig.json` has strict mode enabled and `@/*` path alias.
- `next.config.mjs` is currently empty.
- `.eslintrc.json` extends `next/core-web-vitals` and `next/typescript`.

### Styling

- `tailwind.config.ts` defines the design tokens:
  - Colors: `cream`, `ink`, `teal`, `line`, `positive`, `negative`.
  - Fonts: Inter for sans, Lora for serif.
  - `content` max width of `1200px`.
  - Card and button radii.
  - Slight negative tracking utility in theme.
- `app/globals.css` imports Tailwind layers and defines:
  - Cream page background.
  - Ink text color.
  - Teal focus outlines.
  - `.container-x`.
  - `.prose-bantle`.
  - `text-balance` and `text-pretty` utilities.

### Root Layout

- `app/layout.tsx` loads Inter and Lora via `next/font/google`.
- It exports metadata built from constants in `lib/constants.ts`.
- It sets app-wide HTML/body classes.
- Public header/footer are not in the root layout. They live only in `app/(marketing)/layout.tsx`, which keeps the admin panel isolated from marketing chrome.

### Public Route Group

- `app/(marketing)/layout.tsx` wraps public pages with:
  - A skip link.
  - `Header`.
  - Main content.
  - `Footer`.
- The public route group contains:
  - `/`
  - `/about`
  - `/how-it-works`
  - `/safety`
  - `/support`
  - `/faq`
  - `/privacy`
  - `/terms`
  - `/refund-policy`
  - `/community-guidelines`
  - `/verify`
  - `/reset-password`
  - Dynamic Open Graph image route.

### Marketing Pages

- `app/(marketing)/page.tsx`
  - Landing page.
  - Uses `HeroSection`.
  - Sections explain household coordination, how it works, trust/safety, and app-store coming-soon CTA.
  - Current product copy emphasizes household/family use and explicitly avoids built-in payments.
- `app/(marketing)/about/page.tsx`
  - Explains Bantle as a household coordination tool.
  - Describes founder/legal context and product principles.
- `app/(marketing)/how-it-works/page.tsx`
  - Explains create, invite, coordinate, and keep-control flow.
- `app/(marketing)/safety/page.tsx`
  - Explains trust, user responsibilities, household access, and reporting posture.
- `app/(marketing)/support/page.tsx`
  - Gives support channels and support process.
- `app/(marketing)/faq/page.tsx`
  - Long static FAQ.
  - Covers getting started, household coordination, trust/safety, account, and technical topics.
- `app/(marketing)/privacy/page.tsx`
  - Uses constants for legal names and emails.
  - Mentions DPDP-oriented rights, vendors, retention, security, and contact path.
- `app/(marketing)/terms/page.tsx`
  - Uses `CURRENT_VERSION` and `EFFECTIVE_DATE_DISPLAY` from `lib/tos.ts`.
  - Version is `2.0`.
  - Effective date is `14 May 2026`.
  - Covers household attestations, provider rules, no payment handling, content/user conduct, disputes, liability cap, and termination.
- `app/(marketing)/refund-policy/page.tsx`
  - Explains Bantle does not process subscription payments and therefore does not provide refunds for third-party subscriptions.
- `app/(marketing)/community-guidelines/page.tsx`
  - Defines acceptable household usage, account sharing expectations, reporting, and moderation posture.
- `app/(marketing)/opengraph-image.tsx`
  - Generates an OG image using `ImageResponse`.
  - The copy still says "Find trusted neighbours...", which conflicts with the newer household-only framing.

### Public Auth Helper Routes

- `app/(marketing)/verify/page.tsx`
  - Server route wrapper.
  - `robots: noindex`.
  - Suspense-wraps the client component.
- `app/(marketing)/verify/VerifyClient.tsx`
  - Client component.
  - Reads Supabase auth markers from both query string and URL hash.
  - Recognized markers include `token_hash`, `token`, `access_token`, `type`, and `code`.
  - Shows verified/success state when markers are present.
  - Shows a neutral guidance state when markers are absent.
  - Includes a `bantle://` app-open path.
- `app/(marketing)/reset-password/page.tsx`
  - Server route wrapper.
  - `robots: noindex`.
  - Suspense-wraps the client reset form.
- `app/(marketing)/reset-password/ResetPasswordClient.tsx`
  - Client component.
  - Uses `createBrowserSupabase`.
  - Reads recovery tokens from query string and hash.
  - Handles `access_token`/`refresh_token` through `setSession`.
  - Handles `token_hash`/`token` through `verifyOtp`.
  - Cleans tokens from browser URL with `history.replaceState`.
  - Validates password length, uppercase, lowercase, number, and confirmation.
  - Calls `supabase.auth.updateUser`.
  - Signs out globally after success.
  - Avoids logging sensitive tokens.

### Shared Public Components

- `components/Header.tsx`
  - Sticky public header.
  - Uses `NAV_LINKS`.
  - Shows desktop nav and `MobileNav`.
- `components/MobileNav.tsx`
  - Client component.
  - Uses Radix dialog primitive through `Sheet`.
  - Closes after clicking a nav/legal link.
- `components/Footer.tsx`
  - Dark teal footer.
  - Uses `NAV_LINKS` and `LEGAL_LINKS`.
  - Includes current year.
  - Includes store badges.
- `components/HeroSection.tsx`
  - Main landing hero.
  - Includes app-store badges and a phone mockup.
  - The phone mockup is static JSX, not a real app preview.
- `components/ComingSoonBadges.tsx`
  - Renders app-store style badges.
  - Uses inline SVG-like structures and text.
- `components/FeatureCard.tsx`
  - Small reusable card for marketing sections.
- `components/PageHeader.tsx`
  - Shared heading/intro primitive for public content pages.
- `components/ui/button.tsx`
  - Class-variance-authority button primitive.
  - Supports `variant`, `size`, and `asChild` prop in the type.
  - Important: `asChild` is declared but not implemented with Radix Slot, so it currently has no behavior.
- `components/ui/sheet.tsx`
  - Radix dialog wrapper used as a sheet.
  - Provides content, header, title, and description primitives.

## Admin Architecture

### Authentication and Authorization

- `middleware.ts`
  - Matches `/admin/:path*`.
  - Creates a cookie-aware Supabase client with anon credentials.
  - Reads current user via `auth.getUser()`.
  - For `/admin/login`:
    - Signed-in admins redirect to `/admin`.
    - Signed-out and non-admin users may load the login page.
  - For other `/admin/*` routes:
    - Signed-out users redirect to `/admin/login`.
    - Signed-in non-admin users redirect to `/`.
    - Admin users continue.
- `app/admin/layout.tsx`
  - Re-checks the Supabase cookie session server-side.
  - Uses the service-role client to fetch `profiles.is_admin`.
  - Redirects non-admin users to `/`.
  - Renders admin sidebar/mobile header/toast provider for admins.
  - Leaves the login page with bare background when no user exists.
- `lib/admin-auth.ts`
  - Exports `requireAdmin(request)`.
  - Uses route-level Supabase client to authenticate the request user.
  - Uses service-role client to check `profiles.is_admin`.
  - Returns `401` for unauthenticated users.
  - Returns `403` for non-admin users.
  - Returns `{ admin, supabase }` for authorized API handlers.
- `lib/admin-supabase-browser.ts`
  - Browser client for admin login/session persistence.
- `lib/admin-supabase-route.ts`
  - Cookie-aware route/middleware client.
  - Keeps request/response cookies synchronized.
- `lib/admin-supabase-server.ts`
  - Service-role Supabase client.
  - Throws in browser environments.
  - Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

### Admin Login and Shell

- `app/admin/login/page.tsx`
  - Page wrapper for the login client.
- `app/admin/login/LoginClient.tsx`
  - Client login form.
  - Email/password sign-in through Supabase auth.
  - Generic error display.
  - On success routes to `/admin`.
- `app/admin/page.tsx`
  - Admin dashboard.
  - Re-checks user and admin profile.
  - Greets the admin.
  - Mentions future roadmap areas.
- `components/admin/AdminNav.tsx`
  - Client sidebar/drawer navigation.
  - Links dashboard, reports, users, platforms.
  - Tracks active route through `usePathname`.
  - Provides logout dialog.
- `components/admin/AdminMobileHeader.tsx`
  - Mobile admin header with sheet navigation.
- `components/admin/LogoutConfirmDialog.tsx`
  - Confirms logout.
  - Calls `POST /admin/api/logout`.
  - Navigates to `/admin/login`.
- `app/admin/api/logout/route.ts`
  - Signs out via route-level Supabase auth.
  - Returns JSON success.
- `components/admin/AdminToast.tsx` and `AdminToastProvider.tsx`
  - Simple global success/error toast system.
  - Provider exposes `showToast`.

### Reports Admin Flow

- `app/admin/reports/page.tsx`
  - Page wrapper.
  - Suspense-wraps report list client.
- `app/admin/reports/ReportsListClient.tsx`
  - Client list.
  - Status/category/page filters.
  - Fetches `/admin/api/reports`.
  - Renders `ReportRow`.
- `components/admin/reportStatus.ts`
  - Status constants and labels.
  - Status values are `pending`, `reviewed`, `actioned`, `dismissed`.
- `components/admin/ReportRow.tsx`
  - Report row display.
  - Shows reporter/reported, category, status, time, and context badges.
- `app/admin/api/reports/route.ts`
  - Calls `requireAdmin`.
  - Lists reports with optional `status`, `category`, and `page`.
  - Default status filter is `pending`.
  - Page size is 20.
- `app/admin/reports/[id]/page.tsx`
  - Detail page wrapper.
- `app/admin/reports/[id]/ReportDetailClient.tsx`
  - Fetches `/admin/api/reports/:id`.
  - Shows report metadata, reporter, reported user, related reports, and conversation messages.
  - Hides conversation messages until admin expands them.
  - Shows action modals for pending reports.
- `app/admin/api/reports/[id]/route.ts`
  - Calls `requireAdmin`.
  - Returns report row with reporter/reported profiles.
  - Returns up to 100 conversation messages when conversation id is present.
  - Returns other reports against the same reported user.
- `components/admin/ReportActionModal.tsx`
  - Supports `resolve`, `dismiss`, `warn`, `ban_temp`, `ban_perm`.
  - Requires reason for warning and ban actions.
  - Posts to `/admin/api/reports/:id/resolve`.
  - Important stale text: permanent-ban modal copy still refers to soft-delete / 7-day grace behavior, but current code uses `permanently_banned`.
- `app/admin/api/reports/[id]/resolve/route.ts`
  - Calls `requireAdmin`.
  - Validates action and reason.
  - Loads report.
  - Prevents banning admins.
  - `warn` sends push and inserts moderation-warning notification.
  - `ban_temp` sets `banned_until`, `banned_reason`, `banned_by`; sends push and inserts notification.
  - `ban_perm` sets `permanently_banned`, `banned_reason`, `banned_by`; sends push and inserts notification.
  - Updates report status:
    - `resolve` -> `reviewed`.
    - `dismiss` -> `dismissed`.
    - `warn`, `ban_temp`, `ban_perm` -> `actioned`.
  - Writes admin audit log.
  - Important stale naming: permanent ban audit action currently uses `user_soft_deleted`.

### Users Admin Flow

- `app/admin/users/page.tsx`
  - Users page wrapper.
- `app/admin/users/UsersListClient.tsx`
  - Debounced search UI.
  - Fetches `/admin/api/users`.
  - Supports pagination.
- `components/admin/UserRow.tsx`
  - User row display.
  - Uses status badge and display-name fallback.
- `components/admin/userStatus.ts`
  - `getUserStatus` priority is:
    - admin
    - self_deleted
    - perm_banned
    - temp_banned
    - active
  - Includes display-name fallback and styling helpers.
- `app/admin/api/users/route.ts`
  - Calls `requireAdmin`.
  - Supports exact UUID search.
  - Supports escaped `email` and `display_name` substring search.
  - Page size is 20.
- `app/admin/users/[id]/page.tsx`
  - User detail wrapper.
- `app/admin/users/[id]/UserDetailClient.tsx`
  - Fetches user detail.
  - Shows identity, status, counts, and moderation panels.
  - Shows tabbed activity for listings, deals, reports, audit.
- `app/admin/api/users/[id]/route.ts`
  - Calls `requireAdmin`.
  - Fetches full profile row.
  - Counts listings, hosted deals, bought deals, reports filed, reports received, and audit actions.
- `components/admin/UserActionPanel.tsx`
  - State-aware action panel.
  - Admin users cannot be actioned through UI.
  - Active users show temporary/permanent ban actions.
  - Banned users show ban restore.
  - Self-deleted users show self-delete restore.
- `components/admin/UserActionModal.tsx`
  - Shared dialog for user moderation actions.
  - Bans require a reason.
  - Restore reason is optional.
  - Posts to user ban/restore APIs.
- `app/admin/api/users/[id]/ban/route.ts`
  - Calls `requireAdmin`.
  - Rejects self-ban.
  - Rejects banning an admin.
  - Supports `type: "temp"` and `type: "permanent"`.
  - Temporary ban sets `banned_until`, `banned_reason`, `banned_by`.
  - Permanent ban sets `permanently_banned`, `banned_reason`, `banned_by`.
  - Sends push notification.
  - Inserts persistent notification.
  - Writes admin audit action.
  - Important stale naming: permanent ban audit action uses `user_soft_deleted`.
- `app/admin/api/users/[id]/restore/route.ts`
  - Calls `requireAdmin`.
  - Supports restoring ban fields or self-delete state.
  - Ban restore clears permanent/temp ban fields and reason/admin fields.
  - Self-delete restore clears `deleted_at`.
  - Writes admin audit action.
- `components/admin/UserDetailTabs.tsx`
  - Local tab navigation.
  - Audit count is displayed as `0` in tab config even though audit rows load separately.
- `components/admin/UserListingsTab.tsx`
  - Fetches `/admin/api/users/:id/listings`.
  - Renders listing table.
  - Defensively handles unknown listing status.
  - Displays raw platform slug.
- `app/admin/api/users/[id]/listings/route.ts`
  - Calls `requireAdmin`.
  - Lists user-owned listings with pagination.
- `components/admin/UserDealsTab.tsx`
  - Fetches `/admin/api/users/:id/deals`.
  - Displays deals where user is host or buyer.
  - Shows counterparty display name and role.
- `app/admin/api/users/[id]/deals/route.ts`
  - Calls `requireAdmin`.
  - Selects host/buyer profile joins.
  - Important mismatch: code comments say counterparty UUID is excluded, but response still includes `host_id` and `buyer_id`.
- `components/admin/UserReportsTab.tsx`
  - Fetches filed and received reports.
  - Links to report detail.
- `app/admin/api/users/[id]/reports/route.ts`
  - Calls `requireAdmin`.
  - Returns reports filed by user and reports against user.
- `components/admin/UserAuditTab.tsx`
  - Fetches admin actions targeting the user.
  - Expands JSON payload.
- `app/admin/api/users/[id]/audit/route.ts`
  - Calls `requireAdmin`.
  - Returns `admin_actions` rows where `target_user_id` matches.

### Platforms Admin Flow

- `app/admin/platforms/page.tsx`
  - Page wrapper.
- `app/admin/platforms/PlatformsListClient.tsx`
  - Fetches `/admin/api/platforms`.
  - Groups platforms by category.
  - Supports create/edit/toggle active through `PlatformEditorDialog`.
- `components/admin/PlatformRow.tsx`
  - Shows platform tile, label, slug, category, price, listing count, active status, display order.
  - Edit and activate/deactivate actions.
- `components/admin/PlatformEditorDialog.tsx`
  - Shared create/edit dialog.
  - Client-side validation mirrors server validations.
  - Slug auto-suggests from label in create mode.
  - Slug is immutable in edit mode.
  - Brand initials can be suggested from label.
  - Live preview updates from form state.
- `app/admin/api/platforms/route.ts`
  - Calls `requireAdmin`.
  - `GET`: lists platforms and per-platform listing counts.
  - `POST`: validates and creates platform.
  - Platform categories are `music`, `video`, `cloud`, `work`.
  - Slug validation is strict.
  - Writes `platform_created` audit action.
- `app/admin/api/platforms/[id]/route.ts`
  - Calls `requireAdmin`.
  - `PATCH`: validates partial updates.
  - Platform id/slug is immutable.
  - Writes `platform_updated` audit action.
- There is no platform delete API in current code. Admin removal is activation/deactivation through `is_active`.

## Library Details

- `lib/constants.ts`
  - Defines brand name, tagline, site URL, description, support/legal emails, legal identity, nav links, legal links, and policy effective date.
- `lib/tos.ts`
  - TOS current version is `2.0`.
  - Effective date is `2026-05-14`.
  - Records a short list of version changes.
- `lib/utils.ts`
  - `cn` combines `clsx` and `tailwind-merge`.
- `lib/supabase.ts`
  - Public browser Supabase client for reset-password.
  - Uses anon key.
  - Disables session persistence, auto refresh, and detect-session-in-url.
- `lib/admin-actions.ts`
  - Defines allowed admin action types.
  - Inserts `admin_actions`.
  - Catches and logs audit-write failures.
- `lib/admin-push.ts`
  - Uses service-role Supabase client to fetch recipient `profiles.push_token`.
  - Sends Expo push over HTTPS.
  - Returns structured sent/skipped/error results.

## Database Model

### Public Tables

The `public` schema has 15 tables. All have RLS enabled. Row counts are live MCP counts at scan time.

| Table | Rows | Purpose |
| --- | ---: | --- |
| `profiles` | 21 | One row per auth user plus moderation/profile state. |
| `listings` | 24 | Subscription-sharing listings. |
| `deals` | 55 | Agreements between host and buyer around listings. |
| `messages` | 350 | Conversation messages and system/deal messages. |
| `ratings` | 9 | Deal milestone ratings and comments. |
| `platforms` | 12 | Admin-managed platform catalog. |
| `conversations` | 20 | Listing-host-buyer conversation threads. |
| `saved_listings` | 6 | User saved listing join table. |
| `notifications` | 14 | In-app notification inbox rows. |
| `conversation_archives` | 0 | Per-user archived conversations. |
| `deal_archives` | 11 | Per-user archived deals. |
| `user_reports` | 16 | User safety/moderation reports. |
| `user_blocks` | 0 | User block relationships. |
| `hidden_listings` | 0 | Per-user hidden listings. |
| `admin_actions` | 27 | Admin audit log. |

### Key Public Table Details

- `profiles`
  - Primary key `id` references `auth.users`.
  - Important profile fields: `display_name`, `bio`, `avatar_url`, `email`, rating fields, onboarding state.
  - Compliance fields: TOS acceptance, age attestation, analytics consent, data export timestamp.
  - Moderation fields: `is_admin`, `deleted_at`, `banned_until`, `banned_reason`, `banned_by`, `permanently_banned`.
  - Push fields: `push_token`, `push_token_updated_at`, `push_token_last_seen_at`.
- `listings`
  - Owner `user_id` references `profiles`.
  - `platform` is text; there is no FK to `platforms.id`.
  - `monthly_price`, `slots_total`, and `duration_months` have value constraints.
  - `status` has no check constraint, so UI must render unknown values defensively.
  - `archived_at` exists.
- `deals`
  - References `listing_id`, `host_id`, `buyer_id`, and `conversation_id`.
  - `host_id` and `buyer_id` can become null after hard delete because FKs use set-null semantics.
  - Status check allows `pending`, `active`, `completed`, `disputed`, `cancelled`.
  - Contains `agreed_price`, `started_at`, `ends_at`, `duration_months`, `terminated_at`.
- `messages`
  - Belongs to `conversation_id`.
  - Optional `deal_id`.
  - `sender_id` can become null during hard delete.
  - `kind` check allows text and deal lifecycle message kinds.
  - `client_id` supports client-side idempotency.
- `ratings`
  - Tied to deal, rater, rated user, star count, optional milestone/comment.
  - Used by rating aggregate trigger.
- `platforms`
  - `id` is text slug primary key.
  - Category check allows `music`, `video`, `cloud`, `work`.
  - Includes label, default price, brand color, initials, active flag, display order.
  - No `updated_at`.
- `conversations`
  - One thread per listing/host/buyer combination.
  - Has `last_message_at`.
- `saved_listings`, `conversation_archives`, `deal_archives`, `hidden_listings`
  - Per-user join/state tables with composite primary keys.
- `notifications`
  - `kind` check includes transactional and moderation kinds.
  - `payload` is JSONB.
  - `read_at` nullable.
- `user_reports`
  - Categories include harassment, hate speech, sexual content, spam/scam, personal info, underage user, impersonation, off-app scam, and other.
  - Status values are `pending`, `reviewed`, `dismissed`, `actioned`.
  - Review/resolution fields exist.
- `user_blocks`
  - Stores blocker/blocked pairs.
- `admin_actions`
  - Audit log with admin id, action type, target user/resource, reason, payload, created timestamp.
  - RLS is enabled but there are no policies, which means normal clients cannot access it; service-role admin routes can.

### Auth and Storage Schemas

- `auth.users` has 21 rows at scan time.
- Standard Supabase Auth tables exist for identities, sessions, refresh tokens, MFA, SSO, and audit.
- `storage.buckets` and `storage.objects` have 0 rows at scan time.
- Storage migrations table has 61 rows.

### Extensions

Installed extensions:

- `pg_stat_statements`
- `pg_net`
- `pgcrypto`
- `supabase_vault`
- `uuid-ossp`
- `plpgsql`

### Views

- `public_profiles`
  - Security-definer view.
  - Exposes safe profile projection.
  - Includes conditional `last_seen_at` visibility.
  - Advisor flags this as security-definer view risk.
- `listings_with_availability`
  - Adds computed slots available to listings.
  - Joins host rating/profile projection.
- `deals_pending_milestones`
  - Finds active deals whose 30/60/90-day milestone threshold has passed.
  - Used by milestone dispatcher.

### Database Functions

- `handle_new_user`
  - Creates `profiles` row from new `auth.users`.
- `enforce_age_attested`
  - Prevents inserts for conversations/listings/messages unless the authenticated profile has `age_attested = true`.
- `enforce_listing_edit_lock`
  - Locks core listing fields when active commitments exist.
  - Allows `slots_total` only to increase in that state.
- `listing_has_active_commitments`
  - Checks whether a listing has active/completed related deals.
- `listing_slots_available`
  - Calculates remaining listing slots after pending/active deals.
- `get_conversations_with_meta`
  - Returns conversation rows with listing, host, buyer, last message, unread count, and archived flag.
- `messages_update_guard`
  - Allows only `read_at` to change during message update, except internal sender nulling for hard-delete cascade.
- `update_conversation_last_message_at`
  - Updates conversation `last_message_at` when messages insert, subject to block behavior.
- `notify_deal_completed`
  - Inserts deal-completed notifications when deals transition to completed.
- `update_profile_rating_aggregates`
  - Recalculates average/count/is_verified from ratings.
  - Inserts verification earned/lost notifications.
- `profile_is_soft_deleted`
  - Checks whether a profile has `deleted_at`.
- `close_listings_on_delete`
  - Closes active listings when profile soft-delete occurs.
- `handle_soft_delete_deals`
  - Cancels pending deals and terminates active deals when a profile soft-deletes.
- `is_user_blocked_by`
  - Checks block relationships.
- `rls_auto_enable`
  - Event trigger helper to enable RLS on new public tables.

### Triggers

Key triggers observed:

- `auth.users` insert creates `profiles` through `handle_new_user`.
- Conversations/listings/messages inserts run age-attestation checks.
- Listings update runs edit-lock guard.
- Messages insert updates conversation last-message timestamp.
- Messages update runs message update guard.
- Deal update can insert completion notifications.
- Profile update handles soft-delete side effects.
- Rating insert/update recalculates profile aggregates.
- Database webhook triggers send HTTP calls for deal/message push notifications.
- The webhook trigger metadata contains an embedded bearer token. It must remain redacted and should be considered for rotation/moving out of schema-managed text.

### RLS Policy Shape

- `profiles`: users can read/update own profile.
- `public_profiles`: exposed through view, not table policy.
- `listings`: owners can manage own listings; users can read active/own listings with soft-delete and block guards.
- `deals`: participants can access their deals; insert/update constrained by participant, slot, and profile guard logic.
- `conversations`: participants can access conversation rows.
- `messages`: conversation participants can insert/read; update restricted to read state.
- `ratings`: participants can insert/read relevant ratings.
- `saved_listings`: own saved listings only.
- `notifications`: own notification rows only.
- `conversation_archives`: own archive rows only.
- `deal_archives`: own archive rows only.
- `hidden_listings`: own hidden listing rows only.
- `user_reports`: own filed/received report access depending policy.
- `user_blocks`: own block relationships.
- `platforms`: authenticated/public read is available for catalog consumption; writes are not exposed to normal clients.
- `admin_actions`: RLS enabled with zero policies; service role only in practice.

### Migrations

The database has 39 migrations recorded. Major themes:

- Initial remote schema.
- Deals extensions and messaging.
- Saved/chat support.
- Ratings, verification, notification flows.
- Milestone check-ins.
- Soft-delete and hard-delete account flows.
- Conversation/deal archive fixes.
- User reports.
- User blocks and hidden listings.
- Email verification backfill.
- Presence.
- Push tokens.
- TOS acceptance.
- Age attestation.
- Analytics consent.
- Data export.
- Admin foundation.
- Reports status fields.
- User bans and permanent-ban field.
- Moderation notification kind constraint.
- Platforms RLS/catalog update.

## Edge Functions

### `milestone_checkin_dispatcher`

- Active, JWT verification enabled.
- Service-role cron/dispatcher function.
- Reads `deals_pending_milestones`.
- Inserts milestone notifications idempotently.
- Sends milestone push notifications through `send_push_notification`.
- Completes orphaned active deals that are past `ends_at` when a participant is soft-deleted.
- Auto-archives resolved completed/cancelled deals after the configured window.
- Returns a summary object.

### `account_hard_delete_dispatcher`

- Active, JWT verification enabled.
- Service-role cron/dispatcher function.
- Finds profiles whose `deleted_at` is older than the grace window.
- Re-checks each row before deletion.
- Deletes users through Supabase Auth admin API.
- Cascades through FK behavior.
- Returns a summary object.

### `send_push_notification`

- Active, JWT verification enabled.
- Supports direct invocation and database webhook payloads.
- Handles message inserts, deal inserts, and deal updates.
- Sends Expo push notifications.
- Clears stale `DeviceNotRegistered` push tokens.
- Uses channel IDs such as `messages`, `deals_v2`, and `milestones`.

### `export_user_data`

- Active, JWT verification enabled.
- Runs as the requesting user under RLS using the user JWT.
- Rate-limits exports by `profiles.last_data_export_at`.
- Exports profile, listings, deals, ratings, sent messages, conversations, blocks, hidden/saved listings, notifications, and reports filed by the user.
- Excludes reports made against the user.
- Updates `last_data_export_at` when invoked. It was not invoked during this scan.

## Advisor Findings

Security advisor findings observed:

- `public.admin_actions` has RLS enabled but no policies.
- `public.public_profiles` is a security-definer view.
- Several functions have mutable `search_path` warnings.
- Multiple security-definer functions are executable by anon/authenticated roles.
- Leaked password protection is disabled in Supabase Auth.

Performance advisor findings observed:

- Several foreign keys are unindexed, including FK columns in archive tables, deals, messages, profiles, ratings, saved listings, and user reports.
- Many RLS policies use `auth.uid()` directly and are flagged for initplan optimization.
- Several indexes are currently unused, including notification/profile/platform/listing/report/admin-action indexes.
- One index appears stale: `idx_user_reports_status` is partial on `status = 'open'`, but current report statuses are `pending`, `reviewed`, `actioned`, and `dismissed`.

## Existing Documentation Status

- `README.md`
  - Good for marketing-site orientation and design rules.
  - Stale where it says the app has no auth/backend/state.
  - Does not fully reflect admin routes or Supabase usage.
- `BANTLE_WEB_PROJECT_DUMP.md`
  - Useful historical record.
  - Stale where it says there is no backend/database/auth.
  - Some marketplace-era positioning predates the household coordination framing.
- `ADMIN_PANEL_PLAN.md`
  - Canonical admin roadmap.
  - Phases 1 through 4.1 are recorded as shipped.
  - Phases 5 through 8 remain future work.
  - Some route examples use older `/api/admin/...` style; current routes are `/admin/api/...`.
- `PHASE_3_RECON.md`
  - Read-only users-management recon.
  - Notes nullable display names, deals surviving hard-delete with null counterparties, and no listing status check constraint.
- `PHASE_4_RECON.md`
  - Read-only platforms-management recon.
  - Notes `platforms.id` is a text slug.
  - Notes `listings.platform` has no FK to `platforms.id`.
  - Notes platform active/deactive behavior and mobile catalog assumptions.
- `PROJECT_CONTEXT_FOR_AI.md`
  - Existing local AI context document observed in the working tree during the scan.
  - It is currently untracked in git.
  - Broadly aligned with the current app.
  - This new document adds a fresh read-only Supabase scan and a stricter tracked-source coverage ledger.

## End-to-End Workflows

### Public Landing and Legal Pages

- Requests under the marketing route group render with public header/footer.
- Pages are mostly server components with static content.
- Shared constants keep brand/legal details consistent.

### Email Verification

- Supabase auth emails can redirect to `/verify`.
- The client checks query and hash markers.
- Marker present means verified/success UI.
- Marker absent means neutral explanation UI.

### Password Reset

- Supabase recovery links redirect to `/reset-password`.
- The client establishes a session from recovery tokens.
- User enters a new password.
- Password is updated through Supabase.
- Session is globally signed out after success.

### Admin Login

- Admin signs in through Supabase email/password.
- Middleware checks cookie session and `profiles.is_admin`.
- Admin layout re-checks through service role.
- Admin APIs call `requireAdmin`.

### Report Moderation

- Admin opens reports queue.
- API fetches pending reports by default.
- Admin opens detail, optionally reviews conversation messages.
- Admin can resolve, dismiss, warn, temporary-ban, or permanent-ban.
- API updates report status, user moderation fields as needed, notification/push rows, and admin audit log.

### User Moderation

- Admin searches users.
- Admin opens user detail.
- API returns profile and activity counts.
- Admin views listings, deals, reports, audit.
- Admin can temp-ban, permanent-ban, restore ban, or restore self-delete depending status.
- API defends against self-ban and admin-target ban.

### Platform Management

- Admin opens platform catalog.
- API lists all platform rows with listing counts.
- Admin creates or edits platform.
- Admin activates/deactivates platform through `is_active`.
- No hard delete path is exposed.

### Push Notifications

- Admin moderation routes can send direct Expo push through `lib/admin-push.ts`.
- Database triggers can invoke the push edge function for message/deal events.
- Milestone dispatcher can send milestone pushes.
- Stale Expo tokens are cleared by edge function logic.

### Account Deletion

- User self-delete sets `profiles.deleted_at`.
- Database triggers close listings and handle deals.
- Hard-delete dispatcher later deletes eligible auth users after grace period.
- Permanent admin bans use `permanently_banned`, not `deleted_at`.

## Important Inconsistencies and Risks

- `README.md` and `BANTLE_WEB_PROJECT_DUMP.md` still contain "no backend/no auth/no database" language.
- `app/(marketing)/opengraph-image.tsx` says "trusted neighbours", which conflicts with the household-only positioning.
- `components/admin/ReportActionModal.tsx` still describes permanent ban as soft-delete / 7-day grace behavior.
- `app/admin/api/reports/[id]/resolve/route.ts` comments still mention old soft-delete permanent-ban behavior.
- Permanent-ban audit entries use `user_soft_deleted` as action type in report and user ban routes.
- `components/ui/button.tsx` declares `asChild`, but does not implement Radix Slot behavior.
- `app/admin/api/users/[id]/deals/route.ts` comments say counterparty UUID is excluded, but response still includes `host_id` and `buyer_id`.
- `components/admin/UserDetailTabs.tsx` hardcodes audit tab count as `0`.
- `listings.status` has no database check constraint; code correctly renders unknown statuses defensively in some surfaces, but future code must preserve that habit.
- `listings.platform` is not FK-constrained to `platforms.id`; platform admin must avoid destructive rename/delete behavior unless a migration/backfill is intentionally done.
- `platforms` has no `updated_at`; audit log is the only modification history.
- `admin_actions` has RLS enabled with no policies. That is acceptable for service-role-only use but should be intentionally documented.
- Security-definer functions and the `public_profiles` view need careful privilege review before expanding client access.
- Database webhook trigger metadata includes a bearer token in schema text. Rotate/move out of schema-managed text if possible.
- Supabase Auth leaked password protection is disabled.
- Several FK indexes are missing according to advisor output.
- Several RLS policies could be optimized by wrapping auth calls in initplans.
- `idx_user_reports_status` partial condition appears stale because it checks `status = 'open'`.

## Future Work Guidance

- For admin route handlers:
  - Call `requireAdmin(request)` first.
  - Use service-role client only after admin authorization.
  - Validate all request bodies server-side.
  - Log material admin changes to `admin_actions`.
  - Avoid exposing service-role operations to client components.
- For database changes:
  - Make migrations in the actual migration-owning repo/process.
  - Inspect constraints and policies before adding enum-like values.
  - Never assume text columns have a fixed enum unless a check constraint exists.
  - Add/adjust RLS policies with advisor review.
- For public pages:
  - Keep household coordination framing consistent.
  - Use constants for legal/support contact values.
  - Preserve noindex on auth helper routes.
- For platform catalog:
  - Treat `platforms.id` as an immutable slug.
  - Deactivate instead of deleting.
  - Remember existing listings may reference inactive or unknown platform slugs.
- For moderation:
  - Distinguish self-delete `deleted_at` from admin permanent ban `permanently_banned`.
  - Do not route permanent bans through self-delete recovery behavior.
  - Keep push, notification row, report status update, and audit log behavior observable.
- For listing moderation:
  - Phase 5 shipped admin search/detail/force-close routes and UI.
  - Force-close sets `listings.status = 'closed'` plus `closed_reason`, `closed_by`, and `closed_at`.
  - Force-close does not archive/delete listings and does not mutate deal status, deal dates, conversations, or messages.
  - Only the listing host receives `listing_closed` in-app notification and best-effort transactional push.
  - Saved-only users, all users, and deal participants are not notified in Phase 5.
  - `listings.status` remains unconstrained text; render unknown statuses defensively.

## Verification Performed

- Local repository file inventory was generated with `rg --files`.
- Line counts were generated with `wc -l`.
- Source, config, route, component, lib, and documentation files in the coverage ledger were read.
- Supabase MCP project listing confirmed access to project ref `fpoviccitrraonvvgont`.
- Supabase MCP table/schema inspection read public/auth/storage metadata.
- Supabase MCP migration, extension, edge-function, and advisor data were inspected.
- Read-only SQL metadata was used for policies, indexes, triggers, functions, views, constraints, and RLS state.
- No build or lint run was performed as part of this documentation-only scan.
- No database write, migration, restore, or destructive action was performed.
