# Bantle repository handoff for ChatGPT

Generated at: 2026-05-22 22:25:35 IST
Repo path: /Users/syedejazahammed/Documents/GitHub/bantle-web
Git branch: main
Latest commit: d6fa8b1 docs: add deep project understanding
Working tree status: dirty. Pre-existing changed/untracked files, excluding ignored files: `.gitignore` modified; `PROJECT_CONTEXT_FOR_AI.md` untracked; `database-backups/.env.example`, `database-backups/README.md`, `database-backups/backup_supabase.sh`, and `database-backups/restore_supabase.sh` untracked. This task adds `CHATGPT_REPO_HANDOFF.md`.

## 1. Executive summary

This repo is `bantle-web`, the Next.js web surface for Bantle. It is not the React Native/Expo mobile app. The mobile app is a separate repo; this repo supplies public web pages, Supabase auth helper pages, and the admin panel.

Current web surfaces:

- Public marketing/legal/support site under `app/(marketing)/`: landing page, about, how-it-works, safety, FAQ, support, privacy, terms, refund policy, and community guidelines.
- Supabase auth helper pages:
  - `/verify` confirms that a verification link was opened and offers a `bantle://` deep link back to the mobile app. It does not call Supabase directly.
  - `/reset-password` consumes Supabase recovery tokens, sets a temporary recovery session, updates the password, strips tokens from the URL, and globally signs out.
- Admin panel under `/admin`: protected dashboard, reports queue, user management, and platform catalog management.
- Admin API routes under `/admin/api`: service-role route handlers for reports, user moderation, platform catalog changes, and logout.

Admin auth model:

- Browser admin login uses Supabase email/password with cookie persistence.
- Middleware gates every `/admin/*` route with the user JWT and `profiles.is_admin`.
- Admin API routes re-check admin status via `requireAdmin()`.
- After authorization, privileged admin reads/writes use a service-role Supabase client. The service role key is private and must never be exposed to browser code.

Supabase usage in this repo is real and current. Older docs that describe this repo as static-only, no-auth, or no-backend are stale.

## 2. Tech stack and package scripts

Package name: `bantle-web`.

Framework/runtime:

- Next.js `14.2.35`, App Router.
- React `18`.
- TypeScript `5`, strict mode enabled.
- Vercel-oriented deployment; `next.config.mjs` is currently an empty config object.

Styling and UI:

- Tailwind CSS `3.4.1`.
- Fonts via `next/font/google`: Inter for body, Lora for headings.
- Radix Dialog via `@radix-ui/react-dialog` for sheets/modals.
- `lucide-react` icons.
- Local shadcn-style primitives in `components/ui/button.tsx` and `components/ui/sheet.tsx`.
- `class-variance-authority`, `clsx`, and `tailwind-merge` for class composition.

State management:

- No Zustand or global client store in this web repo.
- Admin and auth helper flows use local React state and `AdminToastProvider`.
- Docs mention Zustand stores in the separate mobile repo, not here.

Backend/auth:

- `@supabase/supabase-js` for anon browser auth flows and service-role route clients.
- `@supabase/ssr` for cookie-backed browser/server clients in admin auth.
- Direct HTTPS call to Expo push API in `lib/admin-push.ts` for admin-triggered moderation pushes.

Analytics/crash tools:

- No analytics or crash SDK is initialized in this web repo.
- Public privacy copy references PostHog and Bugsnag for the mobile app.

Key dependencies:

- `next`, `react`, `react-dom`, `typescript`
- `@supabase/supabase-js`, `@supabase/ssr`
- `@radix-ui/react-dialog`
- `lucide-react`
- `tailwindcss`, `postcss`, `eslint`, `eslint-config-next`
- `class-variance-authority`, `clsx`, `tailwind-merge`

Scripts from `package.json`:

| Script | Command | Meaning |
| --- | --- | --- |
| `dev` | `next dev` | Starts the local development server. |
| `build` | `next build` | Builds production Next.js output and runs type validity checks. |
| `start` | `next start` | Serves a previously built production bundle. |
| `lint` | `next lint` | Runs Next's ESLint config. |

No `typecheck` script exists in `package.json`.

## 3. Environment variables

Only variable names are listed. Real values were not read or copied.

| Variable name | Required where | Purpose | Public/private | Notes |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser reset page, admin browser client, middleware/route clients, admin server components, service-role client factory | Supabase project URL used by anon and service-role clients | Public | Referenced in code but no root `.env.example` exists. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser reset page, admin browser client, middleware/route clients, admin server components | Public anon key used for browser auth and user-JWT cookie checks | Public | Referenced in code but no root `.env.example` exists. |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/admin-supabase-server.ts`, admin layout, admin dashboard, all admin API routes through `requireAdmin()` | Privileged Supabase service-role key for admin reads/writes after admin authorization | Private, risky | Must not have `NEXT_PUBLIC_`; server-only runtime guard exists. Missing from the only `.env.example` file. |
| `SUPABASE_DB_URL` | `database-backups/backup_supabase.sh`, `database-backups/restore_supabase.sh` | PostgreSQL connection URL for local backup/restore scripts | Private, risky | Present in `database-backups/.env.example` as a placeholder only. Do not commit real values. |

Environment notes:

- The only `.env.example` present is `database-backups/.env.example`; there is no root web `.env.example` for the Next/Supabase variables.
- `.gitignore` ignores `.env`, `.env*.local`, database SQL dumps, and dump files.
- No real `.env` values were printed or included.

## 4. Repository map

Important top-level files:

- `package.json` - dependencies and scripts.
- `package-lock.json` - npm lockfile; not inspected internally.
- `next.config.mjs` - empty Next config.
- `tsconfig.json` - strict TS, `@/*` path alias.
- `tailwind.config.ts` - Bantle design tokens.
- `postcss.config.mjs` - Tailwind PostCSS plugin.
- `.eslintrc.json` - Next ESLint presets.
- `.gitignore` - env/build/backup ignores; currently modified in the working tree.
- `middleware.ts` - `/admin/:path*` auth gate.
- `README.md` - useful but stale in places.
- `ADMIN_PANEL_PLAN.md` - canonical admin roadmap/status document.
- `PHASE_3_RECON.md` - read-only users/listings/deals schema recon.
- `PHASE_4_RECON.md` - read-only platforms schema/mobile/web recon.
- `PROJECT_CONTEXT_FOR_AI.md` - current AI context doc, untracked.
- `PROJECT_DEEP_UNDERSTANDING.md` - deep repo/database understanding from a prior scan.
- `BANTLE_WEB_PROJECT_DUMP.md` - historical project dump, stale for current admin/auth state.

Important folders:

- `app/` - Next App Router tree, global CSS, icons, public route group, admin pages, and admin API routes.
- `app/(marketing)/` - public marketing/legal/support/auth-helper route group. Parentheses do not appear in URLs.
- `app/admin/` - admin layout, dashboard, admin pages, and route handlers.
- `app/admin/api/` - service-role-backed admin route handlers.
- `components/` - public marketing components and admin UI components.
- `components/admin/` - admin rows, modals, tabs, nav, toasts, and status helpers.
- `components/ui/` - local button and sheet primitives.
- `lib/` - constants, Supabase clients, admin auth/actions/push helpers, TOS metadata, utilities.
- `database-backups/` - untracked local backup/restore scripts and docs. These are operational scripts, not app runtime code.

Folders not present in this repo:

- No `stores/`.
- No `types/`.
- No root `supabase/`.
- No `supabase/functions/`.
- No `supabase/migrations/`.
- No Expo, Android, or iOS app config in this repo.

## 5. Routing and screens/pages

This is a web app. Route list is from the Next.js `app/` tree.

### Public marketing and auth helper routes

| Path | Purpose | Server/client component split | Auth/admin requirement | Supabase tables/functions touched |
| --- | --- | --- | --- | --- |
| `/` | Landing page explaining Bantle and showing coming-soon store badges. | Server component `app/(marketing)/page.tsx`; uses server components `HeroSection`, `FeatureCard`, `ComingSoonBadges`. | Public. | None. |
| `/about` | About/story/principles page. | Server component. | Public. | None. |
| `/how-it-works` | Six-step household subscription coordination explanation. | Server component. | Public. | None. |
| `/safety` | Trust and safety copy for verification, blocking, reporting, and UPI/payment limits. | Server component. | Public. | None. |
| `/faq` | FAQ for sign-in, household coordination, safety, account deletion, and devices. | Server component using `<details>`. | Public. | None. |
| `/support` | Support and feedback contacts plus troubleshooting checklist. | Server component. | Public. | None. |
| `/privacy` | DPDP-oriented privacy policy. | Server component. | Public. | None. |
| `/terms` | Terms of service v2.0. | Server component using `lib/tos.ts`. | Public. | None. |
| `/refund-policy` | Explains Bantle does not charge or hold money. | Server component. | Public. | None. |
| `/community-guidelines` | User conduct and moderation consequences. | Server component. | Public. | None. |
| `/verify` | Landing after Supabase email verification links; detects query/hash auth params and offers app deep link. | Server wrapper `page.tsx` with Suspense; client `VerifyClient.tsx` uses `useSearchParams()` and `window.location.hash`. | Public, `noindex`. | No Supabase calls; only detects URL params. |
| `/reset-password` | Supabase recovery page; validates token, accepts new password, signs user out globally. | Server wrapper is dynamic/no-store; client `ResetPasswordClient.tsx` handles token/session/password state. | Public recovery link only, `noindex`, `no-referrer`. | Supabase Auth: `setSession`, `verifyOtp`, `updateUser`, `signOut`. |
| `/opengraph-image` metadata route | Dynamic Open Graph image. | Edge runtime in `app/(marketing)/opengraph-image.tsx`. | Public metadata route. | None. |

Shared public layout:

- `app/layout.tsx` loads fonts and metadata only.
- `app/(marketing)/layout.tsx` adds skip link, `Header`, `Footer`, and public `<main>`.

### Admin routes

All `/admin/*` routes are matched by `middleware.ts`. `/admin/login` is allowed for signed-out users; other admin pages require signed-in `profiles.is_admin = true`.

| Path | Purpose | Server/client component split | Auth/admin requirement | Supabase tables/functions touched |
| --- | --- | --- | --- | --- |
| `/admin` | Dashboard and admin landing. | Server component. | Requires admin; middleware plus server defensive checks. | `profiles` via cookie client and service-role client. |
| `/admin/login` | Admin sign-in form. | Server wrapper with client `LoginClient.tsx`. | Signed-out users allowed; signed-in admins redirected to `/admin`. | Supabase Auth `signInWithPassword`; middleware checks `profiles.is_admin` after login. |
| `/admin/reports` | Reports queue with status/category filters and pagination. | Server page plus client `ReportsListClient.tsx`. | Requires admin. | Client calls `/admin/api/reports`; API reads `user_reports` joined to `profiles`. |
| `/admin/reports/[id]` | Single report detail with reporter/reported profiles, optional conversation context, other reports, and action modal. | Server page plus client `ReportDetailClient.tsx`. | Requires admin. | Client calls `/admin/api/reports/[id]` and `/resolve`; APIs read/write `user_reports`, `messages`, `profiles`, `notifications`, `admin_actions`. |
| `/admin/users` | User search/list page. | Server page plus client `UsersListClient.tsx`. | Requires admin. | Client calls `/admin/api/users`; API reads `profiles`. |
| `/admin/users/[id]` | User detail, counts, moderation action panel, listings/deals/reports/audit tabs. | Server page plus client `UserDetailClient.tsx` and tab components. | Requires admin. | APIs read/write `profiles`, `listings`, `deals`, `user_reports`, `admin_actions`, `notifications`. |
| `/admin/platforms` | Platform catalog management. | Server page plus client `PlatformsListClient.tsx`, `PlatformEditorDialog.tsx`. | Requires admin. | APIs read/write `platforms`; counts `listings`; audit writes `admin_actions`. |

### Admin API routes

| Route | Method(s) | Purpose | Auth/admin requirement | Supabase tables/functions touched |
| --- | --- | --- | --- | --- |
| `/admin/api/logout` | `POST` | Server-side Supabase sign-out and cookie clearing. | Requires current cookies; no service role. | Supabase Auth `signOut`. |
| `/admin/api/reports` | `GET` | List reports with status/category/page filters. | `requireAdmin()`. | `user_reports`, joins `profiles`. |
| `/admin/api/reports/[id]` | `GET` | Fetch report detail, conversation messages, and other reports. | `requireAdmin()`. | `user_reports`, `messages`, joins `profiles`. |
| `/admin/api/reports/[id]/resolve` | `POST` | Resolve/dismiss/warn/temp-ban/perma-ban a report. | `requireAdmin()`. | `user_reports`, `profiles`, `notifications`, `admin_actions`; Expo push via `sendAdminPush()`. |
| `/admin/api/users` | `GET` | Search users by email/name/UUID, paginated. | `requireAdmin()`. | `profiles`. |
| `/admin/api/users/[id]` | `GET` | Full profile plus activity counts. | `requireAdmin()`. | `profiles`, `listings`, `deals`, `user_reports`. |
| `/admin/api/users/[id]/listings` | `GET` | Paginated listings owned by user. | `requireAdmin()`. | `listings`. |
| `/admin/api/users/[id]/deals` | `GET` | Paginated deals where user is host or buyer. | `requireAdmin()`. | `deals`, joins `profiles`. |
| `/admin/api/users/[id]/reports` | `GET` | Reports filed by and against a user. | `requireAdmin()`. | `user_reports`, joins `profiles`. |
| `/admin/api/users/[id]/audit` | `GET` | Admin actions targeting this user. | `requireAdmin()`. | `admin_actions`, joins `profiles`. |
| `/admin/api/users/[id]/ban` | `POST` | Temp or permanent user ban with reason. | `requireAdmin()`, rejects self-ban/admin targets. | `profiles`, `notifications`, `admin_actions`; Expo push via `sendAdminPush()`. |
| `/admin/api/users/[id]/restore` | `POST` | Clear ban state or restore self-deleted account by clearing `deleted_at`. | `requireAdmin()`. | `profiles`, `admin_actions`. |
| `/admin/api/platforms` | `GET`, `POST` | List platforms with listing counts; create platform. | `requireAdmin()`. | `platforms`, `listings`, `admin_actions` on create. |
| `/admin/api/platforms/[id]` | `PATCH` | Update platform fields or active flag. Slug immutable. | `requireAdmin()`. | `platforms`, `admin_actions`. |

Routes planned but not implemented:

- No `/admin/listings`, `/admin/deals`, top-level `/admin/audit`, or `/admin/broadcasts` pages.
- No `/admin/api/listings`, `/admin/api/deals`, `/admin/api/audit`, or broadcast routes.

## 6. Data model used by the app

The web code directly touches a subset of the Supabase model. Broader table/function details below come from local recon docs (`PHASE_3_RECON.md`, `PHASE_4_RECON.md`, `PROJECT_DEEP_UNDERSTANDING.md`) and were not revalidated against the live database in this run.

| Table/view/function | Used by files | Purpose | Important columns/fields | RLS/security notes | Known risks/TODOs |
| --- | --- | --- | --- | --- | --- |
| `profiles` | `middleware.ts`, `lib/admin-auth.ts`, `lib/admin-push.ts`, `app/admin/layout.tsx`, `app/admin/page.tsx`, user/report APIs | One row per auth user plus public profile, moderation, admin, push, compliance state. | `id`, `email`, `display_name`, `bio`, `avatar_url`, `is_verified`, `rating_avg`, `rating_count`, `deleted_at`, `last_seen_at`, `show_last_seen`, `push_token`, TOS/age/analytics fields, `is_admin`, `banned_until`, `banned_reason`, `banned_by`, `permanently_banned`. | Normal clients use RLS. Admin routes first verify `is_admin`, then use service role. | Nullable `display_name` is real; use fallbacks. `phone` column exists in docs but public copy says phone numbers are not collected. Permanent ban must use `permanently_banned`, not `deleted_at`. |
| `public_profiles` view | Referenced in docs only, not web code directly. | Safe public profile projection. | Display/profile/rating/conditional presence fields. | Docs say it is security-definer and advisor flags risk. | Review privileges before expanding client access. |
| `platforms` | `app/admin/api/platforms/*`, `app/admin/platforms/*`, `components/admin/Platform*` | Admin-managed platform catalog used by mobile picker. | `id` text slug, `label`, `category`, `default_monthly_price`, `brand_color`, `brand_initials`, `is_active`, `display_order`, `created_at`. | Normal clients can read catalog per docs; admin writes are service role only. | No `updated_at`. Category constrained to `music`, `video`, `cloud`, `work`. Slug is immutable in admin UI. |
| `listings` | `app/admin/api/platforms/route.ts`, `app/admin/api/users/[id]/route.ts`, `app/admin/api/users/[id]/listings/route.ts`, `components/admin/UserListingsTab.tsx` | Subscription listing records owned by users. | `id`, `user_id`, `platform`, `category`, `title`, `description`, `monthly_price`, `slots_total`, `duration_months`, `status`, `created_at`, `updated_at`, `archived_at`. | RLS documented for owner manage and active/own reads. Admin reads via service role. | `status` has no DB check constraint. `platform` is text with no FK to `platforms.id`; user listings tab displays raw slug. Phase 5 listings management not started. |
| `listings_with_availability` view | Docs only. | Computed available slots and host/profile projection for listing feed. | Listing fields plus availability and host rating/profile data. | View/policies documented in prior scan, not live-verified here. | Not used by this web repo. |
| `conversations` | Report detail API through report `conversation_id`; docs. | Chat thread between listing host/buyer. | `id`, listing/host/buyer relation, `last_message_at`. | Participants only under RLS; admin uses service role for report context. | Direct web admin only reads conversation messages when report has `conversation_id`. |
| `messages` | `app/admin/api/reports/[id]/route.ts` | Conversation context on report detail. | `id`, `conversation_id`, `text`, `kind`, `created_at`, `sender_id`; docs mention `deal_id`, `client_id`, `read_at`. | Participants under RLS; admin reads via service role. | Report detail caps displayed messages at 100. Admin can see reported conversation context. |
| `deals` | `app/admin/api/users/[id]/route.ts`, `app/admin/api/users/[id]/deals/route.ts`, `components/admin/UserDealsTab.tsx` | Agreements between host and buyer. | `id`, `listing_id`, `host_id`, `buyer_id`, `status`, `agreed_price`, `started_at`, `ends_at`, `created_at`, `conversation_id`, `duration_months`, `terminated_at`. | Participant RLS for mobile; admin reads service role. | `host_id`/`buyer_id` can be null after profile hard delete. Comment says counterparty UUID excluded, but API response includes `host_id`/`buyer_id`. Phase 6 not started. |
| `ratings` | Docs and legal/FAQ copy; not web code directly. | Deal milestone ratings and profile rating aggregates. | Deal/rater/rated user, stars, milestone/comment. | Participant-scoped under RLS per docs. | Not administered in current web routes. |
| `notifications` | `app/admin/api/reports/[id]/resolve/route.ts`, `app/admin/api/users/[id]/ban/route.ts` | In-app notification inbox rows. | `user_id`, `kind`, `payload`, `read_at`, timestamps. Moderation kinds include `moderation_warning`, `moderation_ban_temp`, `moderation_ban_perm`. | Own rows under RLS; admin inserts via service role. | Insert failures are logged but do not fail the primary moderation action. |
| `saved_listings` | Docs only. | Per-user saved listing join table. | User/listing composite state. | Own rows only under RLS. | Not used by this web repo. |
| `hidden_listings` | Docs only. | Per-user hidden listing state. | User/listing composite state. | Own rows only under RLS. | Not used by this web repo. |
| `user_blocks` | Docs only. | Blocker/blocked relationships. | Blocker id, blocked id. | Own block relationships; docs say service role can bypass. | Docs flag RLS/policy details for review. |
| `user_reports` | Reports APIs, user detail reports tab, report status helpers. | User-filed moderation reports. | `id`, `reporter_id`, `reported_id`, `category`, `details`, `conversation_id`, `message_id`, `status`, `resolved_at`, `resolved_by`, `resolution_action`. | Admin service role. Reporter/report target access under mobile RLS per docs. | Current statuses are `pending`, `reviewed`, `actioned`, `dismissed`; older docs used `open/resolved`. |
| `admin_actions` | `lib/admin-actions.ts`, user audit API/tab, platform/report/user mutation APIs | Append-only admin audit log. | `admin_id`, `action_type`, `target_user_id`, `target_resource_id`, `target_resource_type`, `reason`, `payload`, `created_at`. | RLS enabled with no normal-client policies; service-role only in practice. | `logAdminAction()` swallows errors. Permanent ban currently logs action type `user_soft_deleted`, which is semantically stale. Top-level audit viewer not started. |
| `deal_archives` | Docs only. | Per-user archived deals. | User/deal archive state. | Own rows only under RLS. | Not used by this web repo. |
| `conversation_archives` | Docs only. | Per-user archived conversations. | User/conversation archive state. | Own rows only under RLS. | Not used by this web repo. |
| Database functions/triggers | Docs only. | User/profile creation, age-attestation guards, listing edit lock, slots availability, conversation metadata, message guards, notification/rating triggers, soft-delete side effects, RLS auto-enable. | Notable names: `handle_new_user`, `enforce_age_attested`, `enforce_listing_edit_lock`, `listing_slots_available`, `get_conversations_with_meta`, `messages_update_guard`, `notify_deal_completed`, `update_profile_rating_aggregates`, `close_listings_on_delete`, `handle_soft_delete_deals`, `is_user_blocked_by`. | Prior scan says several functions are security-definer or have mutable `search_path` warnings. | Not live-verified here; review before schema/security changes. |
| Edge Function `milestone_checkin_dispatcher` | Docs only. | Milestone notifications and deal cleanup/archive jobs. | Reads `deals_pending_milestones`, inserts notifications, sends pushes. | Service-role/cron style per docs. | Not invoked by this web repo. |
| Edge Function `account_hard_delete_dispatcher` | Docs only. | Hard-deletes users after self-delete grace window. | Reads `profiles.deleted_at`, deletes auth users via admin API. | Service-role/cron style per docs. | Not invoked by this web repo. |
| Edge Function `send_push_notification` | Docs only. | Push delivery for DB webhook payloads and direct invocations. | Handles message/deal push flows and stale push tokens. | Docs mention webhook trigger metadata contains a bearer token, redacted in docs. | This web repo uses direct Expo API instead of invoking this function. |
| Edge Function `export_user_data` | Docs only. | User data export under RLS. | Exports profile, listings, deals, ratings, sent messages, conversations, blocks, hidden/saved listings, notifications, and filed reports; updates `last_data_export_at`. | Runs as requesting user under RLS per docs. | Not invoked by this web repo. |

## 7. Supabase integration

Client/setup files:

- `lib/supabase.ts`
  - Browser anon Supabase client for `/reset-password`.
  - Uses `persistSession: false`, `autoRefreshToken: false`, `detectSessionInUrl: false`.
  - Tokens are handled in memory and then stripped from URL by `ResetPasswordClient.tsx`.
- `lib/admin-supabase-browser.ts`
  - Browser cookie client for admin login using `createBrowserClient`.
  - Persists admin session cookies for middleware/server components.
- `lib/admin-supabase-route.ts`
  - Server-side anon client using request/response cookies via `createServerClient`.
  - Used by `middleware.ts`, `requireAdmin()`, and logout.
  - Runs as the signed-in user under RLS.
- `lib/admin-supabase-server.ts`
  - Server-only service-role client factory.
  - Uses private `SUPABASE_SERVICE_ROLE_KEY`.
  - Has a browser runtime guard.
- `lib/admin-auth.ts`
  - `requireAdmin(request)` verifies user session and `profiles.is_admin`, then returns service-role client for privileged work.

Auth/session persistence:

- Public password reset uses a temporary in-memory recovery session and globally signs out after success.
- Admin login persists a Supabase cookie session via `@supabase/ssr`.
- Middleware enforces `/admin` access before page render.
- Admin layout and dashboard defensively re-check profile/admin state server-side.

Realtime channels:

- No realtime subscriptions or Supabase channels exist in this web repo.

Edge Function calls:

- No `supabase.functions.invoke()` calls exist in this web repo.
- Docs describe mobile/backend Edge Functions, but the web admin push helper calls Expo directly over HTTPS.

Storage usage:

- No Supabase Storage client calls in this web repo.
- Privacy copy mentions Supabase file storage for mobile avatar/file use.
- Prior docs say storage tables were empty at scan time, but this run did not inspect live storage.

RLS assumptions from code:

- User-JWT clients are used only for auth checks and cookie handling.
- Admin privileged data access intentionally bypasses RLS only after server-side admin verification.
- `admin_actions` is intended service-role-only.
- Normal mobile/web clients should never receive the service-role key.

Service-role usage:

- `app/admin/layout.tsx` uses service role to fetch admin identity after user session exists.
- `app/admin/page.tsx` uses service role for admin profile check after cookie auth.
- Every state-changing admin API route uses the service-role client returned by `requireAdmin()`.

Database triggers/webhooks referenced in docs:

- Profile creation trigger from `auth.users`.
- Age-attestation guards on inserts.
- Listing edit-lock guards.
- Message insert/update conversation guards.
- Deal completion notification trigger.
- Rating aggregate trigger.
- Soft-delete side-effect triggers for listings/deals.
- Database webhooks for deal/message push notifications.
- Prior docs warn one webhook trigger stores a bearer token in schema metadata; this was not inspected live here and no token is reproduced.

## 8. State management

No Zustand or Redux store exists in this web repo. State is local React state in client components. The separate mobile repo has Zustand stores according to docs.

| Store/file | State owned | Main actions | Supabase calls | Realtime subscriptions | Reset/sign-out behavior |
| --- | --- | --- | --- | --- | --- |
| `app/(marketing)/verify/VerifyClient.tsx` | Whether auth params/hash tokens are present. | Reads query/hash, chooses verified vs neutral state. | None. | None. | None. |
| `app/(marketing)/reset-password/ResetPasswordClient.tsx` | Validation phase, password fields/errors, Supabase client ref. | Establish recovery session, validate password, update password, global sign-out. | Supabase Auth `setSession`, `verifyOtp`, `updateUser`, `signOut`. | None. | Clears password fields and signs out globally on success. |
| `app/admin/login/LoginClient.tsx` | Email/password fields, submit phase, generic error. | Admin sign in, route to `/admin`. | Supabase Auth `signInWithPassword`. | None. | Session persists in cookies; sign-out handled elsewhere. |
| `components/admin/AdminToastProvider.tsx` | Single toast message/variant/id. | `show()`, dismiss. | None. | None. | Dismiss clears local toast. |
| `app/admin/reports/ReportsListClient.tsx` | Filters, page, reports, total/page size/loading. | Fetch reports, set filters, paginate. | Calls `/admin/api/reports`. | None. | None. |
| `app/admin/reports/[id]/ReportDetailClient.tsx` | Report detail, loading/error, active action modal, show/hide messages. | Fetch detail, submit resolve/dismiss/warn/ban through modal, refresh/redirect. | Calls report detail and resolve API routes. | None. | None. |
| `components/admin/ReportActionModal.tsx` | Reason and submitting state for report actions. | Validate reason, POST action. | Calls `/admin/api/reports/[id]/resolve`. | None. | Resets when action changes/closes. |
| `app/admin/users/UsersListClient.tsx` | Search, debounced search, page, users, counts/loading. | Debounced fetch and pagination. | Calls `/admin/api/users`. | None. | None. |
| `app/admin/users/[id]/UserDetailClient.tsx` | User detail data, loading/error. | Fetch profile/counts and refresh after actions. | Calls `/admin/api/users/[id]`. | None. | None. |
| `components/admin/UserActionPanel.tsx` and `UserActionModal.tsx` | Active moderation action, reason, submitting. | Temp/permanent ban, restore ban, restore self-delete. | Calls `/admin/api/users/[id]/ban` and `/restore`. | None. | Resets modal state on action change. |
| `components/admin/UserDetailTabs.tsx` | Active tab. | Switch listings/deals/reports/audit tabs. | Child tabs call APIs. | None. | None. |
| `components/admin/UserListingsTab.tsx` | Listings, total, page, loading. | Fetch paginated user listings. | Calls `/admin/api/users/[id]/listings`. | None. | None. |
| `components/admin/UserDealsTab.tsx` | Deals, total, page, loading. | Fetch paginated user deals. | Calls `/admin/api/users/[id]/deals`. | None. | None. |
| `components/admin/UserReportsTab.tsx` | Filed/received reports and loading. | Fetch report lists. | Calls `/admin/api/users/[id]/reports`. | None. | Cancels state updates on unmount. |
| `components/admin/UserAuditTab.tsx` | Audit actions, loading, per-row payload open state. | Fetch audit rows, expand payload. | Calls `/admin/api/users/[id]/audit`. | None. | Cancels state updates on unmount. |
| `app/admin/platforms/PlatformsListClient.tsx` | Platforms, loading, editor open/mode/target. | Fetch platforms, open create/edit, toggle active, refetch after save. | Calls `/admin/api/platforms` and `/admin/api/platforms/[id]`. | None. | None. |
| `components/admin/PlatformEditorDialog.tsx` | Form fields, validation errors, submitting, slug touched. | Create/update platform with client validation. | Calls platform API routes. | None. | Resets form when dialog opens. |
| `components/admin/AdminNav.tsx`, `AdminMobileHeader.tsx`, `LogoutConfirmDialog.tsx` | Drawer/logout dialog state and signing out state. | Open/close nav, confirm logout. | Calls `/admin/api/logout`. | None. | Hard-navigates to `/admin/login` after logout. |

## 9. Main user/admin flows

### Public marketing/legal pages

Files:

- `app/(marketing)/layout.tsx`
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
- `components/Header.tsx`, `Footer.tsx`, `MobileNav.tsx`, `PageHeader.tsx`, `HeroSection.tsx`, `ComingSoonBadges.tsx`
- `lib/constants.ts`, `lib/tos.ts`

Flow:

1. Public visitor lands on `/` or a linked content/legal page.
2. Marketing layout renders header/footer and skip link.
3. Pages use static server components and constants for copy, metadata, legal identity, and contact emails.
4. Store badges are disabled coming-soon controls.

### Verify page

Files:

- `app/(marketing)/verify/page.tsx`
- `app/(marketing)/verify/VerifyClient.tsx`
- `lib/constants.ts`

Flow:

1. User clicks a Supabase verification email link that lands on `/verify`.
2. Server page sets noindex metadata and renders Suspense.
3. Client checks query params and hash fragment for auth-ish params.
4. If present, verified state tells user to open the app via `bantle://`.
5. If absent, neutral state explains the page and links to the public site/app badges.

### Reset password

Files:

- `app/(marketing)/reset-password/page.tsx`
- `app/(marketing)/reset-password/ResetPasswordClient.tsx`
- `lib/supabase.ts`

Flow:

1. User opens Supabase recovery link at `/reset-password`.
2. Client reads recovery tokens from hash or query.
3. URL tokens are stripped with `history.replaceState`.
4. Client establishes a recovery session via `setSession` or `verifyOtp`.
5. User enters a new password; client validates length, uppercase, lowercase, and number.
6. Client calls `supabase.auth.updateUser({ password })`.
7. On success, client clears password state and calls `signOut({ scope: "global" })`.
8. Success copy tells the user to return to the mobile app and sign in.

### Admin login

Files:

- `middleware.ts`
- `app/admin/login/page.tsx`
- `app/admin/login/LoginClient.tsx`
- `lib/admin-supabase-browser.ts`
- `lib/admin-supabase-route.ts`

Flow:

1. Non-authenticated admin visits `/admin`; middleware redirects to `/admin/login`.
2. Login client calls Supabase email/password sign-in.
3. On success, the browser routes to `/admin`.
4. Middleware re-checks session and `profiles.is_admin`.
5. Non-admin users are redirected to `/` without a specific admin error.

### Reports list/detail/resolve

Files:

- `app/admin/reports/page.tsx`
- `app/admin/reports/ReportsListClient.tsx`
- `app/admin/reports/[id]/page.tsx`
- `app/admin/reports/[id]/ReportDetailClient.tsx`
- `components/admin/ReportRow.tsx`
- `components/admin/ReportActionModal.tsx`
- `components/admin/reportStatus.ts`
- `app/admin/api/reports/route.ts`
- `app/admin/api/reports/[id]/route.ts`
- `app/admin/api/reports/[id]/resolve/route.ts`
- `lib/admin-auth.ts`, `lib/admin-actions.ts`, `lib/admin-push.ts`

Flow:

1. Admin opens `/admin/reports`.
2. Client fetches `/admin/api/reports` with status/category/page filters.
3. API checks admin and reads `user_reports` joined to reporter/reported profiles.
4. Admin opens a detail page; client fetches report detail and optional conversation messages.
5. Pending reports show actions: resolve, dismiss, warn, ban 7 days, ban permanently.
6. Warn/temp-ban/perma-ban require reason.
7. API performs primary action, inserts moderation notification rows where applicable, updates report status/resolution fields, and logs `admin_actions`.
8. Admin push attempts use Expo directly; failed push does not fail the primary moderation action.

### User search/detail/ban/restore/soft delete

Files:

- `app/admin/users/page.tsx`
- `app/admin/users/UsersListClient.tsx`
- `app/admin/users/[id]/page.tsx`
- `app/admin/users/[id]/UserDetailClient.tsx`
- `components/admin/UserRow.tsx`
- `components/admin/UserActionPanel.tsx`
- `components/admin/UserActionModal.tsx`
- `components/admin/UserDetailTabs.tsx`
- `components/admin/UserListingsTab.tsx`
- `components/admin/UserDealsTab.tsx`
- `components/admin/UserReportsTab.tsx`
- `components/admin/UserAuditTab.tsx`
- `components/admin/userStatus.ts`
- `app/admin/api/users/*`

Flow:

1. Admin opens `/admin/users`.
2. Client searches users by email substring, display name substring, or exact UUID.
3. Detail page fetches full profile plus counts for listings, deals, and reports.
4. Tabs lazily fetch listings, deals, reports, and user-targeted admin audit rows.
5. Active non-admin users can be temp-banned or permanently banned with reason.
6. Temp ban sets `banned_until`, `banned_reason`, and `banned_by`.
7. Permanent ban sets `permanently_banned`, `banned_reason`, and `banned_by`.
8. Ban actions insert notifications, attempt Expo push, and log admin actions.
9. Banned users can be restored by clearing ban fields.
10. Self-deleted users can be restored by clearing `deleted_at`.
11. There is no current admin endpoint to initiate a user soft-delete; only restore-from-self-delete exists.
12. API rejects self-ban and banning another admin.

### Platform create/edit/delete

Files:

- `app/admin/platforms/page.tsx`
- `app/admin/platforms/PlatformsListClient.tsx`
- `components/admin/PlatformRow.tsx`
- `components/admin/PlatformEditorDialog.tsx`
- `app/admin/api/platforms/route.ts`
- `app/admin/api/platforms/[id]/route.ts`
- `lib/admin-actions.ts`

Flow:

1. Admin opens `/admin/platforms`.
2. Client fetches all platform rows with listing counts and groups by category.
3. Create modal validates slug, label, category, default monthly price, brand color, initials, and display order.
4. API re-validates server-side, inserts `platforms`, handles duplicate slug with `409`, and logs `platform_created`.
5. Edit modal disables slug because existing listings reference platform slugs by text.
6. PATCH updates allowed fields and logs `platform_updated`.
7. Delete is not implemented. Admin removal is activate/deactivate through `is_active`.

### Audit log

Files:

- `components/admin/UserAuditTab.tsx`
- `app/admin/api/users/[id]/audit/route.ts`
- `lib/admin-actions.ts`

Flow:

1. On a user detail page, admin opens the Audit log tab.
2. Client fetches admin actions where `target_user_id` matches that user.
3. Rows show action type, admin display name, reason, timestamp, and expandable JSON payload.

Top-level audit feed is planned but not implemented.

### Broadcast push

Broadcast push is not implemented. `ADMIN_PANEL_PLAN.md` lists Phase 8 as not started and sensitive. Re-engagement pushes are permanently out of scope; only incident broadcasts are contemplated.

## 10. Design system

Brand:

- Brand name: Bantle.
- Tagline: "Share subscription costs."
- Current positioning: household subscription coordination for roommates, family, and partners in India. Do not describe current product direction as a stranger marketplace.
- Voice: direct, India-aware, plain language, warm but not hype-heavy.

Colors from `tailwind.config.ts`:

- `teal-900` `#04342C` - primary brand/headings/buttons.
- `teal-600` `#0A7C7C` - accents/eyebrows/links.
- `cream` `#FAF5EC` - page background.
- `cream-card` `#FFFDF7` - card/surface.
- `ink` `#1A1A1A` - primary text.
- `ink-muted` `#6B6B6B` - secondary text.
- `line` `#E5E0D5` - borders.
- `positive` `#1A7B5C`, `negative` `#B94A3C` - reserved/semantic.

Typography:

- Body: Inter, weights 400 and 500.
- Headings: Lora, weights 400 and 500, often italic on hero/page titles.
- `tailwind.config.ts` defines `tracking.tightish = -0.01em`; README says sentence case and no all-caps except small eyebrows.

Spacing/radius/layout:

- `.container-x`: max width 1200px with responsive padding.
- `rounded-card`: 14px.
- `rounded-button`: 12px.
- Long-form content uses `.prose-bantle`.

Component patterns:

- Public layout: header/footer, static content sections, disabled store badges.
- Admin layout: desktop sidebar, mobile drawer, toasts, Radix dialogs, dense data cards/tables.
- Buttons and badges use borders and flat color fills.
- Icons are Lucide except store badge glyphs, which are custom SVGs.

UI constraints from docs:

- Flat design, border-based depth.
- Avoid gradients, blur, and decorative shadows.
- Sentence case.
- Prefer constants for contact/legal copy.

Observed mismatches:

- README says no shadows, but admin modals/drawers use `shadow-xl`/`shadow-lg`.
- README says no `font-semibold`/`font-bold`, but brand tiles in platform/badge mockups use `font-bold`.
- `components/ui/button.tsx` exposes `asChild?: boolean` but does not implement Slot/asChild behavior.
- `app/(marketing)/opengraph-image.tsx` still says "trusted neighbours" and "Play Store & App Store", which conflicts with household-only and Android-first copy elsewhere.
- `app/(marketing)/support/page.tsx` still mentions OTP/SMS/phone-number troubleshooting despite email-only/no-phone positioning.

## 11. Config and build/deployment

Next/Vercel:

- `next.config.mjs` exports an empty config object.
- README and historical dump assume Vercel deployment on `main` with public domain `bantle.in`.
- No staging environment is defined in repo.

Middleware:

- `middleware.ts` matches `/admin/:path*`.
- It redirects unauthenticated users to `/admin/login`.
- It redirects authenticated non-admins to `/`.
- It redirects already-signed-in admins away from `/admin/login` to `/admin`.

TypeScript:

- `tsconfig.json` uses strict mode, `noEmit`, `moduleResolution: "bundler"`, `jsx: "preserve"`, `skipLibCheck`, and `@/*` path alias.
- `.next/types/**/*.ts` is included, so builds/type checks depend on generated Next types.

Tailwind/PostCSS:

- `tailwind.config.ts` scans `./app/**/*.{ts,tsx}` and `./components/**/*.{ts,tsx}`.
- `postcss.config.mjs` enables Tailwind.

Expo/native/mobile:

- No Expo config, EAS config, Android package, iOS bundle, Babel config, Metro config, or NativeWind config exists in this repo.
- `bantle://` is used as a web-to-mobile deep link on `/verify`.
- Admin push assumes the mobile app has an Android notification channel named `moderation`, documented in `lib/admin-push.ts`.

Backup scripts:

- `database-backups/backup_supabase.sh` and `restore_supabase.sh` are untracked local operational scripts.
- Restore script prompts for exact `RESTORE`; it was not run.
- Backup script was not run.

Safe command results from this run:

| Command | Result |
| --- | --- |
| `git status --short --untracked-files=all` | Dirty: `.gitignore` modified; `PROJECT_CONTEXT_FOR_AI.md` and `database-backups/*` untracked before this file. |
| `git branch --show-current` | `main` |
| `git log -1 --oneline` | `d6fa8b1 docs: add deep project understanding` |
| `npm run typecheck` | Not run; no `typecheck` script exists. |
| `npm run lint` | Passed: "No ESLint warnings or errors." |
| `npm run build` | Passed. Warning: using edge runtime on a page disables static generation for that page. Build route table included all public/admin/API routes. |

## 12. Security, privacy, and compliance notes

| Item | Status | Notes |
| --- | --- | --- |
| PII handled | Implemented in app/docs | Web admin displays user email, display name, report details, conversation messages, listing/deal data, and moderation state. Public docs describe profile, chat, ratings, reports, push tokens, and analytics/crash data. |
| Auth boundaries | Implemented | Middleware gates `/admin`; `requireAdmin()` re-checks API routes; admin layout/dashboard defensively re-check. |
| Service-role boundary | Implemented with risk | `lib/admin-supabase-server.ts` has browser guard. Service role is used after admin verification. Mis-importing private client remains a high-impact risk, but guard helps. |
| RLS assumptions | Implemented/partly inferred | Admin routes bypass RLS by design after authorization. Normal mobile RLS details come from docs, not live inspection in this run. |
| Audit logging | Implemented, best-effort | `logAdminAction()` writes `admin_actions` after primary changes. It logs and swallows audit failures, so primary actions can succeed without audit rows. |
| Account deletion | Implemented in mobile/backend per docs; web admin can restore self-delete | Docs describe `deleted_at` grace flow and hard-delete dispatcher. This repo has no route to initiate user self-delete. |
| Data export | Implemented in backend per docs; not web | Docs describe `export_user_data` Edge Function and `last_data_export_at`. No web invocation. |
| Analytics consent | Implemented in schema/docs; no web analytics code | `profiles.analytics_consent` exists per docs. Public privacy page references PostHog for mobile. |
| Push notification privacy | Implemented for admin moderation; no re-engagement | Admin push only for warnings/bans. Re-engagement pushes are permanently out of scope. |
| Admin notifications | Implemented | Warn/temp-ban/perma-ban insert in-app `notifications` rows and attempt Expo push. Insert/push failures do not fail primary action. |
| Admin permanent ban vs self-delete | Implemented but stale text remains | Code sets `permanently_banned`; some comments/modal copy/audit action names still imply soft-delete/7-day grace. |
| Security advisor blockers | Planned/unknown from current run | Prior docs mention security-definer view risk, mutable `search_path`, leaked password protection disabled, missing FK indexes, stale `idx_user_reports_status`, and bearer token in webhook metadata. This run did not inspect live advisors. |
| Play Store/App Store policy | Partly implemented, copy cleanup still needed | Terms v2.0 and most public copy emphasize household-only use. OG image, support page, refund/guideline wording, and stale docs still contain marketplace/deal/SMS language. |
| DPDP/privacy/TOS | Implemented, needs review | Privacy/TOS pages exist and use constants. Historical dump recommends lawyer review before production launch. |
| Secrets handling | Implemented in this handoff | No `.env` values, keys, DB passwords, tokens, or certificates included. |

## 13. Known bugs, blockers, stale docs, and open work

| Priority | Item | Evidence file(s) | Current status | Recommended next action |
| --- | --- | --- | --- | --- |
| P0 | Permanent-ban semantics are partly stale in copy/comments/audit naming. | `components/admin/ReportActionModal.tsx`, `app/admin/api/reports/[id]/resolve/route.ts`, `app/admin/api/users/[id]/ban/route.ts`, `PROJECT_CONTEXT_FOR_AI.md`, `PROJECT_DEEP_UNDERSTANDING.md` | Code uses `permanently_banned`, but modal/comment/audit action `user_soft_deleted` can mislead operators and future agents. | Rename/correct copy and audit action semantics in a planned migration-compatible cleanup. |
| P0 | Prior docs say a database webhook trigger metadata contains an embedded bearer token. | `PROJECT_DEEP_UNDERSTANDING.md` | Not live-verified here; no token included. | Rotate/move secret out of schema-managed text if still present. |
| P1 | Support page contradicts email-only/no-phone positioning with OTP/SMS text. | `app/(marketing)/support/page.tsx`, `PROJECT_CONTEXT_FOR_AI.md` | Stale copy. | Replace OTP/SMS/phone troubleshooting with email verification wording. |
| P1 | OG image copy conflicts with household-only and Android-first messaging. | `app/(marketing)/opengraph-image.tsx`, `PROJECT_CONTEXT_FOR_AI.md` | Stale copy. | Update OG copy to household coordination and Android-first/coming soon wording. |
| P1 | `components/ui/button.tsx` declares `asChild` but ignores it. | `components/ui/button.tsx`, `PROJECT_CONTEXT_FOR_AI.md` | Potential bug if future code expects shadcn Slot behavior. | Implement Slot or remove `asChild` prop. |
| P1 | Comment says deal counterparty UUID is excluded, but API returns `host_id` and `buyer_id`. | `app/admin/api/users/[id]/deals/route.ts`, `PROJECT_DEEP_UNDERSTANDING.md` | Privacy/comment mismatch. | Either remove IDs from response or correct the comment and document why admin can see IDs. |
| P1 | No root `.env.example` for actual web runtime variables. | `database-backups/.env.example`, env usage in `lib/*` and `app/admin/*` | Web env names are documented in code/docs but not in root example. | Add a root env example in a future docs-only change if desired. |
| P2 | `listings.platform` has no FK to `platforms.id`. | `PHASE_4_RECON.md`, platform APIs | Known schema design. | Keep slug immutable and deactivate instead of delete unless migration/backfill is planned. |
| P2 | User listings tab shows raw platform slug. | `components/admin/UserListingsTab.tsx`, `PROJECT_CONTEXT_FOR_AI.md` | UI polish gap. | Resolve slug to platform label/tile after adding a safe catalog lookup. |
| P2 | `platforms` has no `updated_at`. | `PHASE_4_RECON.md`, `PROJECT_DEEP_UNDERSTANDING.md` | Audit log is only modification history. | Add `updated_at` only via migration-owning process if needed. |
| P2 | `UserDetailTabs` audit count hardcoded to zero. | `components/admin/UserDetailTabs.tsx`, `PROJECT_DEEP_UNDERSTANDING.md` | UI count mismatch. | Fetch or omit count for audit tab. |
| P2 | Top-level Listings, Deals, Audit, Broadcast admin phases not started. | `ADMIN_PANEL_PLAN.md`, `PROJECT_CONTEXT_FOR_AI.md` | Planned roadmap. | Implement phases 5-8 only after reading plan and confirming schema. |
| P2 | `admin_actions` writes are best-effort. | `lib/admin-actions.ts` | Primary action can succeed without audit row if insert fails. | Decide whether audit failures should block sensitive actions or surface stronger admin warning. |
| P2 | README and historical dump stale about "no backend/no auth/no database". | `README.md`, `BANTLE_WEB_PROJECT_DUMP.md` | Stale docs. | Trust current code and `PROJECT_CONTEXT_FOR_AI.md`; update old docs if they are still used. |
| P3 | No unit/integration tests. | `package.json` | Only lint/build scripts exist. | Add tests around admin auth helpers and API validation if making risky changes. |

Contradictions between docs/code:

| Topic | Older/stale claim | Newer/current claim | Which source should be trusted |
| --- | --- | --- | --- |
| Backend/auth | README/dump say no backend, no database, no auth. | Code has admin middleware, Supabase auth, service-role API routes, reset-password flow. | Current code and `PROJECT_CONTEXT_FOR_AI.md`. |
| Route structure | Older dump lists pages directly under `app/` and says root layout has Header/Footer. | Current app uses `app/(marketing)/layout.tsx`; root layout has no Header/Footer. | Current code. |
| Admin API paths | Plan examples use `/api/admin/...`. | Current route handlers are under `/admin/api/...`. | Current code. |
| Report statuses | Older plan assumed `open/resolved/dismissed`. | Current status helper/API use `pending/reviewed/actioned/dismissed`. | `components/admin/reportStatus.ts` and current APIs. |
| Permanent ban | Older comments/modal text say soft-delete/7-day cron. | Current APIs set `profiles.permanently_banned = true`. | Current API behavior. |
| Platform delete | Plan mentions DELETE/soft-delete. | Current code uses PATCH `is_active` toggle; no delete route. | Current code and Phase 4 clarification. |
| Product positioning | Older docs/pages mention marketplace, discovery, neighbours, listings/deals. | Current canonical positioning is household-only coordination. | Terms v2.0, current landing/about/how-it-works, `PROJECT_CONTEXT_FOR_AI.md`. |
| Phone/SMS | Some stale support copy mentions OTP/SMS/phone. | Privacy/terms/FAQ say no phone numbers and email-only verification. | Privacy/terms/FAQ and current auth flow. |
| Policy date | Older dump references 11 May 2026. | `lib/constants.ts` and `lib/tos.ts` use 14 May 2026. | Current code. |
| Design rules | README says no shadows/bold. | Admin components use shadows and some `font-bold`. | Current code for actual UI; README for original intent. |

## 14. File inventory and coverage ledger

| File | Lines | Purpose | Read status |
| --- | ---: | --- | --- |
| `.eslintrc.json` | 3 | ESLint config. | Read fully. |
| `.gitignore` | 42 | Ignore rules for env/build/backups. | Read fully. |
| `package.json` | 33 | Scripts/dependencies. | Read fully. |
| `package-lock.json` | n/a | npm lockfile. | Present; internals intentionally skipped. |
| `next.config.mjs` | 4 | Next config. | Read fully. |
| `tsconfig.json` | 26 | TypeScript config. | Read fully. |
| `tailwind.config.ts` | 53 | Design tokens/content paths. | Read fully. |
| `postcss.config.mjs` | 8 | PostCSS/Tailwind config. | Read fully. |
| `middleware.ts` | 68 | Admin route gating. | Read fully. |
| `README.md` | 201 | Public repo docs/design/deploy notes. | Read fully. |
| `ADMIN_PANEL_PLAN.md` | 913 | Admin roadmap/schema/status. | Targeted read plus headings/search. |
| `PROJECT_CONTEXT_FOR_AI.md` | 1163 | Current AI context doc. | Targeted read plus headings/search. |
| `PROJECT_DEEP_UNDERSTANDING.md` | 1001 | Prior deep repo/database scan. | Targeted read plus risk/data sections. |
| `PHASE_3_RECON.md` | 235 | Users/listings/deals schema recon. | Read fully. |
| `PHASE_4_RECON.md` | 400 | Platforms schema/admin/mobile recon. | Read fully. |
| `BANTLE_WEB_PROJECT_DUMP.md` | 320 | Historical project dump/change log. | Read fully. |
| `database-backups/.env.example` | 3 | Backup env placeholder. | Read fully; no real values. |
| `database-backups/README.md` | 82 | Backup/restore workflow docs. | Read fully. |
| `database-backups/backup_supabase.sh` | 68 | Local backup script. | Read fully; not run. |
| `database-backups/restore_supabase.sh` | 96 | Manual restore script. | Read fully; not run. |
| `lib/supabase.ts` | 33 | Public reset-password Supabase client. | Read fully. |
| `lib/admin-auth.ts` | 65 | Admin API authorization helper. | Read fully. |
| `lib/admin-supabase-server.ts` | 43 | Server-only service-role client. | Read fully. |
| `lib/admin-supabase-route.ts` | 37 | Cookie-aware route/middleware client. | Read fully. |
| `lib/admin-supabase-browser.ts` | 26 | Admin browser auth client. | Read fully. |
| `lib/admin-actions.ts` | 54 | Admin audit helper. | Read fully. |
| `lib/admin-push.ts` | 77 | Admin-triggered Expo push helper. | Read fully. |
| `lib/constants.ts` | 33 | Brand/legal/contact constants. | Read fully. |
| `lib/tos.ts` | 21 | TOS version metadata. | Read fully. |
| `lib/utils.ts` | 6 | `cn()` utility. | Read fully. |
| `app/layout.tsx` | 71 | Root layout/fonts/metadata. | Read fully. |
| `app/globals.css` | 77 | Global CSS and utilities. | Read fully. |
| `app/icon.svg` | 4 | Favicon SVG. | Read fully. |
| `app/apple-icon.svg` | 4 | Apple icon SVG. | Read fully. |
| `app/(marketing)/layout.tsx` | 32 | Public layout wrapper. | Read fully. |
| `app/(marketing)/page.tsx` | 207 | Landing page. | Read fully. |
| `app/(marketing)/about/page.tsx` | 129 | About page. | Read fully. |
| `app/(marketing)/how-it-works/page.tsx` | 124 | Workflow page. | Read fully. |
| `app/(marketing)/safety/page.tsx` | 180 | Safety page. | Read fully. |
| `app/(marketing)/faq/page.tsx` | 355 | FAQ page. | Read fully. |
| `app/(marketing)/support/page.tsx` | 115 | Support page. | Read fully. |
| `app/(marketing)/privacy/page.tsx` | 321 | Privacy page. | Read fully. |
| `app/(marketing)/terms/page.tsx` | 432 | Terms page. | Read fully. |
| `app/(marketing)/refund-policy/page.tsx` | 110 | Refund policy page. | Read fully. |
| `app/(marketing)/community-guidelines/page.tsx` | 177 | Community guidelines page. | Read fully. |
| `app/(marketing)/verify/page.tsx` | 34 | Verify wrapper/metadata. | Read fully. |
| `app/(marketing)/verify/VerifyClient.tsx` | 156 | Verify client state. | Read fully. |
| `app/(marketing)/reset-password/page.tsx` | 53 | Reset wrapper/security metadata. | Read fully. |
| `app/(marketing)/reset-password/ResetPasswordClient.tsx` | 374 | Reset-password client flow. | Read fully. |
| `app/(marketing)/opengraph-image.tsx` | 87 | Dynamic OG image. | Read fully. |
| `app/admin/layout.tsx` | 92 | Admin shell layout. | Read fully. |
| `app/admin/page.tsx` | 59 | Admin dashboard. | Read fully. |
| `app/admin/login/page.tsx` | 15 | Login wrapper. | Read fully. |
| `app/admin/login/LoginClient.tsx` | 155 | Admin login client. | Read fully. |
| `app/admin/reports/page.tsx` | 28 | Reports page wrapper. | Read fully. |
| `app/admin/reports/ReportsListClient.tsx` | 150 | Reports list state/UI. | Read fully. |
| `app/admin/reports/[id]/page.tsx` | 32 | Report detail wrapper. | Read fully. |
| `app/admin/reports/[id]/ReportDetailClient.tsx` | 387 | Report detail/action UI. | Read fully. |
| `app/admin/users/page.tsx` | 29 | Users page wrapper. | Read fully. |
| `app/admin/users/UsersListClient.tsx` | 151 | Users list/search UI. | Read fully. |
| `app/admin/users/[id]/page.tsx` | 23 | User detail wrapper. | Read fully. |
| `app/admin/users/[id]/UserDetailClient.tsx` | 241 | User detail UI. | Read fully. |
| `app/admin/platforms/page.tsx` | 30 | Platforms page wrapper. | Read fully. |
| `app/admin/platforms/PlatformsListClient.tsx` | 176 | Platform catalog client UI. | Read fully. |
| `app/admin/api/logout/route.ts` | 15 | Logout route. | Read fully. |
| `app/admin/api/reports/route.ts` | 63 | Reports list API. | Read fully. |
| `app/admin/api/reports/[id]/route.ts` | 91 | Report detail API. | Read fully. |
| `app/admin/api/reports/[id]/resolve/route.ts` | 302 | Report action API. | Read fully. |
| `app/admin/api/users/route.ts` | 59 | User search API. | Read fully. |
| `app/admin/api/users/[id]/route.ts` | 73 | User detail/counts API. | Read fully. |
| `app/admin/api/users/[id]/listings/route.ts` | 43 | User listings API. | Read fully. |
| `app/admin/api/users/[id]/deals/route.ts` | 49 | User deals API. | Read fully. |
| `app/admin/api/users/[id]/reports/route.ts` | 57 | User reports API. | Read fully. |
| `app/admin/api/users/[id]/audit/route.ts` | 36 | User audit API. | Read fully. |
| `app/admin/api/users/[id]/ban/route.ts` | 191 | User ban API. | Read fully. |
| `app/admin/api/users/[id]/restore/route.ts` | 96 | User restore API. | Read fully. |
| `app/admin/api/platforms/route.ts` | 175 | Platform list/create API. | Read fully. |
| `app/admin/api/platforms/[id]/route.ts` | 149 | Platform update API. | Read fully. |
| `components/Header.tsx` | 34 | Public header. | Read fully. |
| `components/Footer.tsx` | 86 | Public footer. | Read fully. |
| `components/MobileNav.tsx` | 68 | Public mobile nav. | Read fully. |
| `components/HeroSection.tsx` | 124 | Landing hero/phone mock. | Read fully. |
| `components/FeatureCard.tsx` | 19 | Landing feature cards. | Read fully. |
| `components/PageHeader.tsx` | 27 | Public page header. | Read fully. |
| `components/ComingSoonBadges.tsx` | 97 | Disabled store badges. | Read fully. |
| `components/ui/button.tsx` | 49 | Button primitive. | Read fully. |
| `components/ui/sheet.tsx` | 94 | Sheet primitive. | Read fully. |
| `components/admin/AdminNav.tsx` | 91 | Admin sidebar/drawer nav. | Read fully. |
| `components/admin/AdminMobileHeader.tsx` | 71 | Mobile admin drawer header. | Read fully. |
| `components/admin/AdminToast.tsx` | 65 | Toast visual. | Read fully. |
| `components/admin/AdminToastProvider.tsx` | 53 | Toast context. | Read fully. |
| `components/admin/LogoutConfirmDialog.tsx` | 109 | Logout confirmation. | Read fully. |
| `components/admin/ReportRow.tsx` | 140 | Report list row. | Read fully. |
| `components/admin/ReportActionModal.tsx` | 232 | Report action dialog. | Read fully. |
| `components/admin/reportStatus.ts` | 118 | Report status helpers. | Read fully. |
| `components/admin/UserRow.tsx` | 79 | User list row. | Read fully. |
| `components/admin/UserActionPanel.tsx` | 128 | User action panel. | Read fully. |
| `components/admin/UserActionModal.tsx` | 231 | User action dialog. | Read fully. |
| `components/admin/UserDetailTabs.tsx` | 86 | User detail tabs. | Read fully. |
| `components/admin/UserListingsTab.tsx` | 185 | User listings tab. | Read fully. |
| `components/admin/UserDealsTab.tsx` | 240 | User deals tab. | Read fully. |
| `components/admin/UserReportsTab.tsx` | 192 | User reports tab. | Read fully. |
| `components/admin/UserAuditTab.tsx` | 128 | User audit tab. | Read fully. |
| `components/admin/userStatus.ts` | 87 | User status helpers. | Read fully. |
| `components/admin/PlatformRow.tsx` | 131 | Platform row. | Read fully. |
| `components/admin/PlatformEditorDialog.tsx` | 488 | Platform create/edit dialog. | Read fully. |

## 15. Recommended files to upload to ChatGPT next

Architecture questions:

1. `package.json`
2. `app/layout.tsx`
3. `app/(marketing)/layout.tsx`
4. `app/admin/layout.tsx`
5. `middleware.ts`
6. `lib/admin-auth.ts`
7. `lib/admin-supabase-route.ts`
8. `lib/admin-supabase-server.ts`
9. `PROJECT_CONTEXT_FOR_AI.md`
10. `ADMIN_PANEL_PLAN.md`

Safe code changes:

1. The exact route/component/API file being changed.
2. `lib/constants.ts`
3. `lib/tos.ts` if legal/terms copy changes.
4. `lib/utils.ts`
5. `tailwind.config.ts`
6. `app/globals.css`
7. Relevant `components/admin/*` status/helper/modal files.

Security/audit review:

1. `middleware.ts`
2. `lib/admin-auth.ts`
3. `lib/admin-supabase-server.ts`
4. `lib/admin-actions.ts`
5. `lib/admin-push.ts`
6. `app/admin/api/**/*.ts`
7. `PROJECT_DEEP_UNDERSTANDING.md`
8. `PHASE_3_RECON.md`
9. `PHASE_4_RECON.md`

UI/design review:

1. `tailwind.config.ts`
2. `app/globals.css`
3. `components/Header.tsx`
4. `components/Footer.tsx`
5. `components/HeroSection.tsx`
6. `components/PageHeader.tsx`
7. `components/ComingSoonBadges.tsx`
8. `components/admin/AdminNav.tsx`
9. `components/admin/*Row.tsx`
10. `components/admin/*Modal.tsx`
11. Screenshots from local dev, if available.

## 16. Things you could not verify

- I did not inspect the live Supabase database in this run.
- I did not run migrations.
- I did not call production APIs or mutate Supabase.
- I did not run backup or restore scripts.
- I did not inspect or print real `.env` values.
- I did not inspect the separate mobile repo directly; mobile details here come from local docs and recon files.
- No `supabase/`, `supabase/functions/`, or `supabase/migrations/` folder exists in this repo, so function/migration source was not locally available.
- No `stores/` or `types/` folder exists in this repo.
- No Expo/native Android/iOS configuration exists in this repo.
- `npm run typecheck` was not available as a package script.
- `npm run lint` and `npm run build` passed locally; build emitted the standard warning that edge runtime disables static generation for that page.
- Some first shell reads of dynamic/route-group paths failed because zsh interpreted unquoted parentheses/brackets; those reads were rerun with quoted paths and succeeded.
- Schema details, row counts, advisor findings, Edge Functions, and RLS policy shapes are inferred from existing local documentation, not freshly verified live.
- The working tree was already dirty before this handoff; this task only added `CHATGPT_REPO_HANDOFF.md`.
