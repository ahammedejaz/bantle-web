# Bantle Admin Panel — Implementation Plan

**Repository**: bantle-web (`~/Documents/GitHub/bantle-web/`)
**Status**: Planning complete; Phase 1 ready to execute
**Last updated**: 2026-05-15
**Scope**: Tier 1 (reports, users, platforms) + Tier 2 (listings, deals, audit log viewer, manual broadcast push)
**Out of scope, permanently**: Re-engagement push notifications. This is a positioning decision, not a deferral. See Section 2 for reasoning.

---

## Status legend (used by every phase)

- **NOT STARTED** — Phase has not begun.
- **IN PROGRESS** — Phase is being implemented in the current session.
- **SHIPPED** — Implementation complete, code committed and pushed, awaiting user smoke test.
- **VERIFIED** — User has run the smoke tests in this doc and confirmed they pass.

When Claude Code completes a phase, it MUST update the phase header to `SHIPPED` (not `VERIFIED`). The user is the only person who marks a phase `VERIFIED`. This separation is intentional — code can ship without being correctly verified, and the doc must reflect that distinction.

---

## 1. Architectural overview

The admin panel is a set of authenticated routes inside the existing `bantle-web` Next.js application. It is not a separate repo, not a mobile feature, and not a separate domain.

Four decisions are locked. These are not subject to revision without a new design conversation.

### Decision A — Location

Admin panel lives at `/admin/*` routes inside `bantle-web`. Reasoning: bantle-web already has the Next.js setup, design system, Vercel deployment, and DNS pointing at it. A separate repo would duplicate this infrastructure for no benefit. The mobile app is fundamentally a consumer product; admin work needs a real keyboard and a real screen.

### Decision B — Authentication model

Admin status is tracked via a single boolean column: `profiles.is_admin`. There is no separate admins table, no roles, no permissions matrix. The only admin currently is Syed (`b0103e79-885f-4ea8-a353-5a91c2db007c`). If a second admin is ever added, we revisit and either add another row or migrate to a roles system. Until then, simplicity wins.

### Decision C — RLS strategy

Admin queries do not use modified RLS policies. Instead:

1. A Next.js API route receives the request with the user's JWT.
2. The route's server-side code verifies the JWT and checks `profiles.is_admin = true` for that user.
3. If admin, the route uses a service-role Supabase client to execute the privileged query. Service role bypasses all RLS.
4. If not admin, the route returns 403.

This means RLS hardening from Phase 1 (mobile repo) remains intact. The service role key lives in `SUPABASE_SERVICE_ROLE_KEY` (NOT `NEXT_PUBLIC_*`) and is never exposed to the browser.

### Decision D — Audit log

Every admin action writes a row to `admin_actions`. The table is append-only. No `UPDATE` policy, no `DELETE` policy. Even though Syed is the only admin today, the audit log establishes a paper trail from day one. Compliance-relevant and operationally invaluable when (not if) something goes wrong.

---

## 2. Permanent scope exclusion: re-engagement push notifications

This section is here because the user originally asked for "where have you been"-style greeting pushes. After discussion, this was excluded permanently. The reasoning is documented here so future-Claude (in any session) knows not to slip this back into scope.

**Why it's out:**

- Bantle's brand is the non-spammy alternative to attention-extraction apps. Re-engagement pushes are the canonical example of attention extraction.
- Indian users uninstall apps that nag them. Every Bantle user who chose this app over Swiggy/Zomato is choosing a non-extractive tool. Building this feature breaks that promise.
- Solo dev can't win an attention-extraction race against Swiggy's growth team. Bantle's edge is being trustworthy, not being a slightly nicer attention vampire.

**What stays in scope:**

- Transactional pushes (deal accepted, deal completed) — already shipped.
- Functional pushes (new message) — already shipped.
- Commitment-based pushes (milestone check-ins at day 30/60/90) — already shipped.
- Manual incident broadcasts (e.g., "Service maintenance Sunday 2am") — IN scope, Phase 8.

If a future session proposes adding re-engagement pushes, point to this section first.

---

## 3. Schema additions

Three migrations across the project. All run against the production Supabase project (`fpoviccitrraonvvgont`). All have rollback files.

### Migration 1 — admin foundation (Phase 1)

```sql
-- Adds the admin flag and the audit log table.

BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.is_admin IS
  'True for users with admin panel access. Set via SQL, never via app.';

CREATE TABLE IF NOT EXISTS public.admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  action_type text NOT NULL,
  target_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_resource_id text,
  target_resource_type text,
  reason text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX idx_admin_actions_target_user_id ON public.admin_actions(target_user_id);
CREATE INDEX idx_admin_actions_created_at ON public.admin_actions(created_at DESC);
CREATE INDEX idx_admin_actions_action_type ON public.admin_actions(action_type);

-- Append-only RLS: no one (not even service role through user JWT context)
-- can update or delete. Inserts allowed only via service role.
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- No SELECT policy by default — service role bypasses RLS. Users cannot
-- read this table. The audit log viewer (Phase 7) uses service role.
-- Explicitly: no INSERT/UPDATE/DELETE policies are added. Service role
-- ignores RLS; user JWT contexts cannot write here.

COMMENT ON TABLE public.admin_actions IS
  'Append-only audit log of admin actions. Service role inserts only.';

-- Seed: mark Syed as admin.
UPDATE public.profiles
  SET is_admin = true
  WHERE id = 'b0103e79-885f-4ea8-a353-5a91c2db007c';

COMMIT;
```

Rollback file removes the column, the table, and all indexes/policies.

### Migration 2 — listings audit fields (Phase 5)

May be needed depending on existing schema. To be confirmed at Phase 5 start:

```sql
-- Conditional: only run if these columns don't exist already.
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS closed_reason text,
  ADD COLUMN IF NOT EXISTS closed_by uuid REFERENCES public.profiles(id);
```

### Migration 3 — platforms soft delete (Phase 4)

```sql
ALTER TABLE public.platforms
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_platforms_deleted_at
  ON public.platforms(deleted_at) WHERE deleted_at IS NULL;
```

The partial index makes "active platforms only" queries fast.

---

## 4. Auth flow specification

### Sign-in (admin)

1. Admin visits `/admin` or any `/admin/*` route.
2. `middleware.ts` checks for an active Supabase session via cookie.
3. If no session: redirect to `/admin/login`.
4. If session exists: middleware passes through; the server component on the destination page calls `requireAdmin()` which checks `profiles.is_admin = true`.
5. If not admin: redirect to `/` (homepage). NO error message — security through obscurity; don't reveal admin panel exists.
6. If admin: render the requested page.

### Sign-in form

`/admin/login` uses the same Supabase auth as the mobile app. Email + password. After successful auth:

- Middleware re-checks on next navigation.
- The `LoginClient.tsx` immediately calls a server action that verifies admin status and either redirects to `/admin` or to `/` with no error.

### Session persistence

Admin sessions persist across page loads via cookie-based storage. This requires a separate Supabase client config (`lib/admin-supabase-browser.ts`) with `persistSession: true`. The existing `lib/supabase.ts` (used by `/reset-password`) is unaffected.

### Service role usage

`lib/admin-supabase-server.ts` exports a function that returns a Supabase client initialized with `SUPABASE_SERVICE_ROLE_KEY`. This file MUST NOT be imported by any client component (`"use client"`). Only API routes and server components import it.

To enforce this, the file includes a runtime check:

```ts
if (typeof window !== 'undefined') {
  throw new Error('admin-supabase-server.ts must never run in the browser');
}
```

---

## 5. Cross-cutting patterns

These patterns are established in Phase 1 and reused across every subsequent phase. They are not feature-specific.

### Pattern 1 — Server-side admin verification

Every API route under `/api/admin/*` begins with:

```ts
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const { admin, supabase, error } = await requireAdmin(request);
  if (error) return error; // already a Response with 401/403
  // ...admin logic, using `supabase` (service-role client)
}
```

`requireAdmin()` lives in `lib/admin-auth.ts` and:
1. Extracts the user's JWT from cookies.
2. Verifies the JWT and gets the user ID.
3. Checks `profiles.is_admin = true` for that user.
4. Returns `{ admin: { id, email }, supabase: serviceRoleClient }` on success.
5. Returns `{ error: NextResponse(...) }` on failure.

### Pattern 2 — Audit log writing

Every state-changing admin action calls:

```ts
import { logAdminAction } from '@/lib/admin-actions';

await logAdminAction(supabase, {
  admin_id: admin.id,
  action_type: 'user_banned',
  target_user_id: targetUserId,
  reason: 'Repeated spam reports',
  payload: { ban_duration_days: 7 },
});
```

The helper lives in `lib/admin-actions.ts`. It is called AFTER the primary action succeeds — never before. If the primary action fails, we don't log. If the audit log write fails, we log to console and surface a warning toast to the admin but allow the response to succeed (the action did happen; the audit log being missing is a soft failure).

### Pattern 3 — Toast notifications

bantle-web currently has no toast system. Phase 1 introduces one:

- `components/admin/AdminToast.tsx` — toast component
- `components/admin/AdminToastProvider.tsx` — context provider mounted in admin layout
- `lib/admin-toast.ts` — convenience helpers (`toast.success`, `toast.error`)

Uses the same design tokens as the mobile toast: success-bg/success-fg for green, danger-bg/danger-fg for red, with a 2.5s success / 4s error dwell.

### Pattern 4 — Forms and mutations

Following the existing `ResetPasswordClient.tsx` pattern:

- Server component (`page.tsx`) for metadata + layout.
- Client component (`*Client.tsx`) for state and interactivity.
- API routes for mutations (NOT server actions — easier to test, easier to reason about).
- Loading state during fetch.
- Toast feedback on success/error.

### Pattern 5 — Error handling

API routes return:
- `200` with JSON body on success.
- `400` for validation failures (with `{ error: 'Reason' }`).
- `401` for unauthenticated (with `{ error: 'Unauthorized' }`).
- `403` for non-admin (with `{ error: 'Forbidden' }`).
- `404` for missing resources (with `{ error: 'Not found' }`).
- `429` for rate limits (with `{ error: 'Rate limited', retry_after_seconds: N }`).
- `500` for internal errors (with `{ error: 'Server error' }`).

Client components convert these to user-friendly toast messages.

---

## 6. Phase breakdown

Eight phases. Each is independently shippable. Phases 2–8 depend on Phase 1 but are otherwise parallel (could be shipped in different orders).

Recommended order matches the list below — it prioritizes operationally urgent capabilities (reports, users) over mechanical ones (platforms, audit viewer).

---

### Phase 1 — Foundation: schema, auth, middleware, admin shell

**Status**: SHIPPED

**Goal**: Admin can sign in and navigate the admin shell. No actions work yet — every sub-page is a placeholder.

**Mobile repo changes**:
- New migration `{timestamp}_admin_panel_foundation.sql` (see Migration 1 above)
- Rollback file
- No code changes in mobile repo

**bantle-web changes**:
- New env var in Vercel: `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix). User adds this manually in Vercel dashboard before deployment.
- `middleware.ts` at repo root — gates `/admin/*` routes
- `lib/admin-supabase-server.ts` — service role client factory
- `lib/admin-supabase-browser.ts` — browser client with persistSession=true
- `lib/admin-auth.ts` — `requireAdmin()` helper for API routes
- `lib/admin-actions.ts` — `logAdminAction()` helper
- `lib/admin-toast.ts` — toast helpers
- `app/admin/layout.tsx` — admin shell with nav + toast provider
- `app/admin/page.tsx` — dashboard placeholder ("Welcome, [name]")
- `app/admin/login/page.tsx` — server component
- `app/admin/login/LoginClient.tsx` — sign-in form
- `app/admin/reports/page.tsx` — placeholder ("Coming in Phase 2")
- `app/admin/users/page.tsx` — placeholder
- `app/admin/platforms/page.tsx` — placeholder
- `components/admin/AdminNav.tsx` — sidebar nav
- `components/admin/AdminToast.tsx` — toast component
- `components/admin/AdminToastProvider.tsx` — toast context

**Smoke tests** (user runs):
1. Set `SUPABASE_SERVICE_ROLE_KEY` in Vercel. Deploy.
2. Visit `https://bantle.in/admin` while signed out → redirected to `/admin/login`. ✅/❌
3. Sign in at `/admin/login` with Syed's credentials → redirected to `/admin` showing "Welcome, Syed". ✅/❌
4. Click each nav item (reports, users, platforms) → renders placeholder. ✅/❌
5. Sign in as a non-admin test user → redirected to `/` homepage with no error. ✅/❌
6. Visit `/admin` while signed in as non-admin → redirected to `/` immediately. ✅/❌

**Out of scope**: any functional admin actions. They come in Phases 2–8.

**Commit SHAs**:
- `944682f` (bantle) — feat(db): admin panel foundation — is_admin + admin_actions
- `0981ab3` (bantle) — chore(types): regenerate after admin_actions + is_admin
- `ecfc123` (bantle-web) — chore(deps): add @supabase/ssr for admin session persistence
- `49e5031` (bantle-web) — feat(admin): foundation — middleware, auth, service-role client
- `a952c7a` (bantle-web) — feat(admin): shell — nav, layout, toast system, dashboard
- `0482c8a` (bantle-web) — feat(admin): sign-in page and placeholder routes
- `4c881bc` (bantle-web) — docs(admin): phase 1 shipped

**Files modified**:
- bantle: `supabase/migrations/20260514165354_admin_panel_foundation.sql` (new)
- bantle: `supabase/migrations/rollback_admin_panel_foundation.sql` (new)
- bantle: `types/database.ts` (regenerated)
- bantle-web: `middleware.ts` (new)
- bantle-web: `lib/admin-supabase-server.ts` (new)
- bantle-web: `lib/admin-supabase-browser.ts` (new)
- bantle-web: `lib/admin-supabase-route.ts` (new)
- bantle-web: `lib/admin-auth.ts` (new)
- bantle-web: `lib/admin-actions.ts` (new)
- bantle-web: `components/admin/AdminNav.tsx` (new)
- bantle-web: `components/admin/AdminToast.tsx` (new)
- bantle-web: `components/admin/AdminToastProvider.tsx` (new)
- bantle-web: `app/admin/layout.tsx` (new)
- bantle-web: `app/admin/page.tsx` (new)
- bantle-web: `app/admin/login/page.tsx` (new)
- bantle-web: `app/admin/login/LoginClient.tsx` (new)
- bantle-web: `app/admin/reports/page.tsx` (new — placeholder)
- bantle-web: `app/admin/users/page.tsx` (new — placeholder)
- bantle-web: `app/admin/platforms/page.tsx` (new — placeholder)
- bantle-web: `package.json` + `package-lock.json` (added @supabase/ssr ^0.10.3)
- bantle-web: `ADMIN_PANEL_PLAN.md` (status update)

**Known issues**: none.

**Manual step required before smoke testing**: set `SUPABASE_SERVICE_ROLE_KEY` in Vercel as a private (non-public) environment variable, no `NEXT_PUBLIC_` prefix. The variable is read by `lib/admin-supabase-server.ts` and is the only thing standing between a deployed admin route and a working admin panel.

---

### Phase 1.1 — Closeout: logout, mobile responsive, identity

**Status**: SHIPPED

**Goal**: Address gaps surfaced during Phase 1 smoke testing — the missing logout button (which blocked tests 1, 4, 5), the lack of mobile responsiveness, and the missing admin identity indicator in nav.

**bantle-web changes**:
- New: `app/admin/api/logout/route.ts` — server-side sign-out endpoint
- New: `components/admin/LogoutConfirmDialog.tsx` — confirm before signOut
- New: `components/admin/AdminMobileHeader.tsx` — hamburger drawer for small screens, opens a Radix Dialog containing the existing AdminNav
- Modified: `components/admin/AdminNav.tsx` — adds admin identity block at the bottom (name + email + sign out button), accepts an optional `onItemClick` prop so the mobile drawer can close itself on navigation
- Modified: `app/admin/layout.tsx` — fetches admin identity once at the layout level via service role, passes name + email to nav components, shows desktop sidebar OR mobile header based on viewport (md breakpoint)
- Modified: `app/admin/page.tsx` + 3 placeholders — responsive padding and heading sizes

**Smoke tests** (user runs):
1. Desktop view: sidebar visible on left, admin identity at bottom, logout button works → confirms logout works
2. Resize browser to ~400px wide: sidebar disappears, hamburger appears at top right
3. Tap hamburger: drawer slides in from left with same nav + identity
4. Tap a nav item from inside drawer: drawer closes AND navigates
5. Logout confirmation dialog: tap "Sign out" button → dialog appears
6. Cancel dialog: returns to current page without signing out
7. Confirm sign out: redirects to /admin/login, session cleared, visiting /admin while signed out redirects back to /admin/login
8. After sign out, visit /admin as a non-admin user: redirected to /
9. Sign back in as admin: visit /admin/login while signed in → bounces to /admin (Phase 1 smoke test #5 — now testable)

**Out of scope**: design tweaks to data tables/forms (none exist yet — those come per-phase starting with Phase 2 Reports).

---

### Phase 1.2 — Route group restructure (marketing layout isolation)

**Status**: SHIPPED

**Goal**: Fix admin pages rendering inside the marketing site's layout chrome. Surfaced during Phase 1.1 mobile smoke testing — admin pages showed the marketing Header at top AND admin's own header below, plus the marketing Footer. Root cause: Next.js App Router layouts compose by nesting, so admin/layout.tsx rendered inside layout.tsx (which contained Header + Footer).

**bantle-web changes**:
- Created `app/(marketing)/` route group containing every existing marketing route (about, community-guidelines, faq, how-it-works, privacy, refund-policy, reset-password, safety, support, terms, verify) plus the homepage (page.tsx, opengraph-image.tsx)
- New: `app/(marketing)/layout.tsx` — holds Header + Footer + skip-to-content link + the min-h-screen flex-col wrapper exclusively for marketing pages
- Modified: `app/layout.tsx` — stripped to bare html/body/fonts/globals/site-wide metadata. No Header/Footer rendered here. Every route now lives under one of two layouts (marketing OR admin), never both
- All marketing URLs unchanged (route group parentheses are excluded from URLs by Next.js)
- Admin layout untouched

**Smoke tests** (user runs):
1. Visit https://bantle.in/ → still works, looks unchanged
2. Visit https://bantle.in/about → still works, header + footer intact
3. Visit https://bantle.in/faq → still works
4. Visit https://bantle.in/admin (signed in) → renders ONLY the admin shell, no marketing Header, no marketing Footer
5. Resize admin to mobile width → ONLY one hamburger menu visible (the admin one); no marketing hamburger above it
6. Visit https://bantle.in/admin/login (signed out) → renders ONLY the login form; no marketing Header above

**Out of scope**: Re-running Phase 1.1's smoke tests — those will now succeed because the layout pollution is gone.

---

### Phase 2 — Reports queue

**Status**: SHIPPED

**Goal**: Admin can view all reports filed by users and take action on each.

**Schema check at phase start**: Does `user_reports` have a `status` column (open/resolved/dismissed)? Does it have `resolved_at`, `resolved_by`, `resolution_action`? If not, this phase includes a migration to add them.

**API routes**:
- `GET /api/admin/reports` — list with pagination, filter by status
- `POST /api/admin/reports/[id]/resolve` — mark resolved
- `POST /api/admin/reports/[id]/dismiss` — mark dismissed
- `POST /api/admin/reports/[id]/warn` — send warning notification to reported user, mark resolved
- `POST /api/admin/reports/[id]/ban` — soft-delete or banned_until the reported user, mark resolved

**Pages**:
- `app/admin/reports/page.tsx` — list view
- `app/admin/reports/ReportsClient.tsx` — interactive list with filters
- `app/admin/reports/ReportRow.tsx` — single report with action buttons
- `app/admin/reports/[id]/page.tsx` — single report detail (with full chat context if applicable)

**Smoke tests**:
1. Visit `/admin/reports` → list of reports appears.
2. Click a report → detail page shows reporter, reported user, conversation context.
3. Click "Resolve" → toast confirms, report disappears from default view.
4. Click "Ban 7 days" on a different report → reported user gets `banned_until = now() + 7 days`, audit log entry created.
5. Check `admin_actions` in Supabase → entries match the actions taken.

**Commit SHAs**:
- `8cedceb` (bantle) — feat(db): phase 2 — user_reports status + tracking columns
- `d645bb7` (bantle) — feat(db): phase 2 — user ban fields on profiles
- `42ed3b3` (bantle) — chore(types): regenerate after phase 2 migrations
- `918d974` (bantle) — feat(auth): enforce temporary bans via banned_until check
- `525da03` (bantle-web) — feat(admin): push notification helper for moderation actions
- `1ed7cb2` (bantle-web) — feat(admin): reports API routes (list, detail, resolve)
- `c5e5382` (bantle-web) — feat(admin): reports list page with filters and pagination
- `3f42048` (bantle-web) — feat(admin): report detail page with action modals
- docs commit follows this entry

**Files modified**:
- bantle: `supabase/migrations/20260515050833_phase_2_reports_status.sql` (new)
- bantle: `supabase/migrations/rollback_phase_2_reports_status.sql` (new)
- bantle: `supabase/migrations/20260515050834_phase_2_user_bans.sql` (new)
- bantle: `supabase/migrations/rollback_phase_2_user_bans.sql` (new)
- bantle: `types/database.ts` (regenerated)
- bantle: `stores/auth.ts` — refreshProfile() + AppState resume hook
- bantle: `app/_layout.tsx` — banned gate + /(auth)/banned target
- bantle: `app/(auth)/banned.tsx` — new screen
- bantle: `lib/push.ts` — moderation Android notification channel
- bantle-web: `lib/admin-push.ts` (new)
- bantle-web: `app/admin/api/reports/route.ts` (new)
- bantle-web: `app/admin/api/reports/[id]/route.ts` (new)
- bantle-web: `app/admin/api/reports/[id]/resolve/route.ts` (new)
- bantle-web: `app/admin/reports/page.tsx` (rewrote placeholder)
- bantle-web: `app/admin/reports/ReportsListClient.tsx` (new)
- bantle-web: `app/admin/reports/[id]/page.tsx` (new)
- bantle-web: `app/admin/reports/[id]/ReportDetailClient.tsx` (new)
- bantle-web: `components/admin/ReportRow.tsx` (new)
- bantle-web: `components/admin/ReportActionModal.tsx` (new)
- bantle-web: `ADMIN_PANEL_PLAN.md` (status + open-questions update)

**Known issues**: none. The expo-router typed-routes generator will catch up with the new mobile `/(auth)/banned` screen on the next dev/build cycle; the `_layout.tsx` call site casts through `Parameters<typeof router.replace>[0]` to keep typecheck green ahead of the regen.

---

### Phase 3 — Users management

**Status**: NOT STARTED

**Goal**: Admin can search users and take account-level actions.

**Schema check at phase start**: Does `profiles` have a `banned_until timestamptz` column? If not, add it via migration. This is for temporary bans (vs permanent which is soft-delete).

**API routes**:
- `GET /api/admin/users` — search by email/UUID/display_name, paginated
- `GET /api/admin/users/[id]` — full user profile with listings, deals, reports filed, reports received counts
- `POST /api/admin/users/[id]/soft-delete` — triggers 7-day grace period (existing flow)
- `POST /api/admin/users/[id]/restore` — clears `deleted_at`
- `POST /api/admin/users/[id]/ban` — temporary ban via `banned_until`

**Pages**:
- `app/admin/users/page.tsx` — search interface
- `app/admin/users/UsersClient.tsx` — search results
- `app/admin/users/[id]/page.tsx` — user detail

**Smoke tests**:
1. Search for "yaazfashions" → Syed's profile appears.
2. Click profile → detail shows all user's listings, deals, reports.
3. Soft-delete a test user → user has `deleted_at` set, scheduled for hard delete in 7 days.
4. Restore the same user before 7 days → `deleted_at` cleared, user can sign in again.

---

### Phase 4 — Platforms management

**Status**: NOT STARTED

**Goal**: Admin can CRUD the platform catalog without writing SQL.

**Schema migration**: Add `platforms.deleted_at` (see Migration 3).

**API routes**:
- `GET /api/admin/platforms` — list all (including soft-deleted, with flag)
- `POST /api/admin/platforms` — create new
- `PATCH /api/admin/platforms/[id]` — update
- `DELETE /api/admin/platforms/[id]` — soft-delete

**Pages**:
- `app/admin/platforms/page.tsx` — list with "Add platform" button
- `app/admin/platforms/PlatformsClient.tsx` — list + create/edit modal

**Smoke tests**:
1. Add a new platform (e.g., "Test Platform") → appears in list.
2. Edit the platform → changes persist.
3. Soft-delete → platform marked deleted but still visible in admin list with "Deleted" badge.
4. Check mobile app → deleted platform no longer appears in the platform picker.

---

### Phase 5 — Listings management

**Status**: NOT STARTED

**Goal**: Admin can search listings and force-close abusive/stale ones with a reason.

**Schema migration**: Add `listings.closed_reason` and `listings.closed_by` if not present (see Migration 2).

**API routes**:
- `GET /api/admin/listings` — search by user, platform, status
- `GET /api/admin/listings/[id]` — detail
- `POST /api/admin/listings/[id]/close` — force-close with reason

**Pages**:
- `app/admin/listings/page.tsx`
- `app/admin/listings/ListingsClient.tsx`
- `app/admin/listings/[id]/page.tsx`

**Smoke tests**:
1. Search listings by user → Syed's listings appear.
2. Click a listing → detail shows current state, active deals if any.
3. Force-close with reason "Test closure" → listing status = closed, audit log entry created, host receives a notification.

---

### Phase 6 — Deals management

**Status**: NOT STARTED

**Goal**: Admin can view deals and force-terminate them for dispute resolution.

**API routes**:
- `GET /api/admin/deals` — search by user, status, listing
- `GET /api/admin/deals/[id]` — detail
- `POST /api/admin/deals/[id]/terminate` — force-terminate with reason

**Pages**:
- `app/admin/deals/page.tsx`
- `app/admin/deals/DealsClient.tsx`
- `app/admin/deals/[id]/page.tsx`

**Smoke tests**:
1. Search deals → Syed's active deals appear.
2. Click a deal → shows host, buyer, listing, status.
3. Force-terminate → `terminated_at` set, both parties notified, audit log entry created.

---

### Phase 7 — Audit log viewer

**Status**: NOT STARTED

**Goal**: Admin can view a read-only feed of all admin actions, filterable.

**API routes**:
- `GET /api/admin/audit` — paginated list, filterable by admin/action_type/date

**Pages**:
- `app/admin/audit/page.tsx`
- `app/admin/audit/AuditClient.tsx`

**Smoke tests**:
1. Visit `/admin/audit` → list of all admin actions taken to date appears (should include every action from Phases 2–6).
2. Filter by action_type "user_banned" → only ban actions appear.
3. Filter by date range → only actions in that window appear.

---

### Phase 8 — Manual broadcast push

**Status**: NOT STARTED

**Goal**: Admin can send a one-off push notification to all users for genuine incidents only. Rate-limited, audit-logged.

**This phase is the most sensitive.** It exposes the ability to push to every user. The constraints are:

- Rate limit: 1 broadcast per 24 hours.
- Mandatory reason field, stored in audit log.
- Confirmation modal: "Send to N users? This action is irreversible."
- Banner above the broadcast form: "Broadcasts are for incidents only — service outages, security notices. Do not use for marketing or re-engagement."

**Schema**:
- New `broadcasts` table (id, admin_id, title, body, audience_filter jsonb, sent_at, recipient_count).

**API routes**:
- `POST /api/admin/broadcasts` — send a broadcast (calls Supabase Edge Function or direct expo-server-sdk call)
- `GET /api/admin/broadcasts` — recent broadcasts

**Pages**:
- `app/admin/broadcasts/page.tsx`
- `app/admin/broadcasts/BroadcastsClient.tsx`

**Smoke tests**:
1. Visit `/admin/broadcasts` → see banner + form + last-sent list.
2. Send a test broadcast to a filtered audience (only Syed's UUID) → confirms rate-limit not hit, push received on device, audit log entry created.
3. Try to send a second broadcast within 24h → 429 error, friendly message in toast.

---

## 7. Update instructions for Claude Code

When working on this admin panel in any future session, follow these rules:

1. **Before starting a phase**, read this entire document.
2. **At the start of a phase**, update the phase's `Status:` from `NOT STARTED` to `IN PROGRESS`.
3. **Commit that doc-only change as its own commit** with the message `docs(admin): start phase N`.
4. **At the end of a phase implementation** (after all files committed and pushed):
   - Update the phase's status to `SHIPPED`.
   - Add a `Commit SHAs:` subsection listing every commit in the phase.
   - Add a `Files modified:` subsection listing every file touched.
   - Commit this doc update with the message `docs(admin): phase N shipped`.
5. **Never mark a phase `VERIFIED`** — only the user does that after running smoke tests.
6. **If a phase's smoke tests fail**, leave status as `SHIPPED` and add a `Known issues` subsection. The user will decide whether to roll back or fix forward.
7. **If a phase reveals an unanticipated schema dependency**, add it to this doc's Section 3 (Schema Additions) BEFORE writing the migration. Document the reasoning.
8. **Never silently expand scope.** If a feature seems to need an extra capability not in the phase brief, surface it to the user and either defer or update this plan.

---

## 8. Open questions

These must be answered before the listed phase starts:

### Before Phase 2 (Reports) [RESOLVED]
- Does `user_reports` have `status`, `resolved_at`, `resolved_by`, `resolution_action`? **Resolved 2026-05-15**: did not exist; Phase 2 migration `20260515050833_phase_2_reports_status.sql` added them.

### Before Phase 3 (Users) [RESOLVED IN PHASE 2]
- Does `profiles` have `banned_until timestamptz`? **Resolved 2026-05-15**: did not exist; Phase 2's second migration `20260515050834_phase_2_user_bans.sql` added `banned_until`, `banned_reason`, `banned_by`. Phase 3 will use these existing columns directly.

### Before Phase 5 (Listings)
- Does `listings` have `closed_reason`, `closed_by`? If not, Phase 5 migration adds them.

### Before Phase 8 (Broadcasts)
- Are expo push tokens stored on profiles already? (Yes — `profiles.push_token` exists per the data export from Phase 4.3.) Good.
- Do we need a separate `broadcasts` table, or is `admin_actions` with `action_type = 'broadcast_sent'` enough? Recommendation: separate table for the broadcast-specific data (recipient count, audience filter) plus audit_action entry.

---

## 9. Reference

### Mobile repo
Path: `~/Documents/GitHub/bantle/`
Implementation plan: `PRE_LAUNCH_IMPLEMENTATION_PLAN.md`
Supabase project: `fpoviccitrraonvvgont`

### Web repo (this codebase)
Path: `~/Documents/GitHub/bantle-web/`
Project dump: `BANTLE_WEB_PROJECT_DUMP.md`
Production URL: `https://bantle.in`

### Admin identity
Syed Ejaz Ahammed — user UUID `b0103e79-885f-4ea8-a353-5a91c2db007c`, email `yaazfashions99@gmail.com`. Sole admin until further notice.

---

**End of plan.**
