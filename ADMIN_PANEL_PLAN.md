# Bantle Admin Panel — Implementation Plan

**Repository**: bantle-web (`~/Documents/GitHub/bantle-web/`)
**Status**: Phase 5 verified; Phase 6 verified; Phase 7 verified; Phase 8 shipped, awaiting Syed verification after cooldown removal
**Last updated**: 2026-05-24
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

Applied in mobile/Supabase repo migration
`20260523091059_phase_5_listing_close_admin_fields.sql`:

```sql
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS closed_reason text,
  ADD COLUMN IF NOT EXISTS closed_by uuid,
  ADD COLUMN IF NOT EXISTS closed_at timestamptz;

ALTER TABLE public.listings
  ADD CONSTRAINT listings_closed_by_fkey
  FOREIGN KEY (closed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
```

The same migration extends `notifications.kind` to include `listing_closed`
and adds supporting admin/search indexes on listings. It deliberately does
not add a `listings.status` CHECK constraint because production status values
are free text and admin UI must render unknown values defensively.

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

**Schema clarification**: During Phase 2 smoke testing, it was discovered that `user_reports.status` had already existed in the production schema with a different enum than what this plan originally specified. The actual schema is `('pending', 'reviewed', 'actioned', 'dismissed')` — 4 values, not 3. Phase 2's `IF NOT EXISTS` column add was a no-op for the status column. Phase 2.1 (below) aligns the admin panel with the existing 4-value schema, which is a richer model than originally planned.

---

### Phase 2.1 — Reports queue schema alignment + action buttons fix

**Status**: SHIPPED

**Goal**: Align Phase 2 admin code with the actual production `user_reports.status` schema (4 values instead of the 3 assumed in the original Phase 2 prompt). Also fix the missing action buttons on the detail page (they were gated on the never-true `status === 'open'` check).

**Status semantics** (canonical for admin panel):
- `pending` — new, untriaged (default for all new reports)
- `reviewed` — admin looked, no action needed
- `actioned` — admin took action (warned, banned_temp, banned_perm)
- `dismissed` — report was bad-faith or invalid

**Action → status mapping**:
- Click "Resolve" → status='reviewed', resolution_action='none'
- Click "Dismiss" → status='dismissed', resolution_action='dismissed'
- Click "Warn" → status='actioned', resolution_action='warned'
- Click "Ban 7 days" → status='actioned', resolution_action='banned_temp'
- Click "Ban permanent" → status='actioned', resolution_action='banned_perm'

**bantle-web changes**:
- New: `components/admin/reportStatus.ts` — shared status constants, display helpers, filter options, validation set, `isStatusOpen()` predicate
- Modified: `app/admin/api/reports/route.ts` — default filter changes from `'open'` to `'pending'`, validates against the 4 real status values
- Modified: `app/admin/api/reports/[id]/route.ts` — "other reports" subquery now selects `status` + `resolution_action`
- Modified: `app/admin/api/reports/[id]/resolve/route.ts` — writes the correct status value per action per the mapping above; "already resolved" check now compares against `pending` and returns "Report already triaged"
- Modified: `app/admin/reports/ReportsListClient.tsx` — default filter, filter dropdown imports `STATUS_FILTER_OPTIONS`
- Modified: `components/admin/ReportRow.tsx` — uses `getStatusDisplay`; local status-icon function removed
- Modified: `app/admin/reports/[id]/ReportDetailClient.tsx` — uses `getStatusDisplay` for main badge + other-reports badges, `getResolutionLabel` for the resolved-action text, CRITICAL FIX: action buttons now render when `isStatusOpen(status)` is true (i.e. `status === 'pending'`), "Already triaged" notice shown when status is anything else; 409 from API now refreshes the page so the action buttons disappear and reflect new state

**Smoke tests** (user runs):
1. ⏳ /admin/reports default view → shows pending reports with proper "Pending" badges (not "Dismissed")
2. ⏳ Filter dropdown → 5 options (All / Pending / Reviewed / Actioned / Dismissed)
3. ⏳ Filter by "Actioned" → empty list if no actions taken yet
4. ⏳ Click a pending report → detail page shows 5 action buttons at the bottom
5. ⏳ "Other reports against this user" shows proper badges (not raw "pending" text)
6. ⏳ Click "Resolve" → modal appears, confirm, report status updates to "reviewed", redirected to list. Re-open the report → action buttons gone, "Already triaged" notice visible.

**Out of scope**: actual ban enforcement end-to-end test (still deferred from Phase 2). Push notification delivery (still deferred from Phase 2). These need a second test user device.

---

### Phase 2.2 — Persistent moderation notifications + permaban-restore fix

**Status**: SHIPPED

**Bugs fixed**:
1. **Persistent moderation notifications**: warn / ban_temp / ban_perm now insert rows into `public.notifications` (mobile inbox renders them via three new `NotificationKind` values). Previously the OS push was the only signal, and the record was lost once the push faded.
2. **Permaban-restore bypass (CRITICAL)**: admin permanent bans were reversible — Phase 2's `ban_perm` set `profiles.deleted_at`, which routed the user through the self-delete `account-recovery` screen with a "Restore my account" button. A banned user could simply tap Restore and clear `deleted_at`, undoing the ban. Phase 2.2 introduces `profiles.permanently_banned` (boolean, no self-clear) which is what `ban_perm` now sets instead.

**Schema change**:
- `profiles.permanently_banned boolean NOT NULL DEFAULT false` — admin-imposed permanent ban. No self-restore path. Distinct from `deleted_at` (user self-delete with 7-day grace).
- Partial index `idx_profiles_permanently_banned` on `WHERE permanently_banned = true`.

**bantle-web changes**:
- Modified: `app/admin/api/reports/[id]/resolve/route.ts` — `ban_perm` now sets `permanently_banned=true` (not `deleted_at`); all three actioned variants (warn / ban_temp / ban_perm) insert a `public.notifications` row AFTER the primary action succeeds.

**bantle changes**:
- New: `supabase/migrations/20260515143524_phase_2_2_perm_ban.sql` + rollback
- Modified: `types/database.ts` (regenerated)
- Modified: `stores/notifications.ts` — `NotificationKind` extended with `moderation_warning | moderation_ban_temp | moderation_ban_perm`
- Modified: `app/notifications.tsx` — three new `renderVisual` / `renderCopy` / `handleNotificationPress` cases (mark-read only, no navigation)
- Modified: `app/_layout.tsx` — `isBanned` now considers both `banned_until` (temp) and `permanently_banned` (perma); both route to `/(auth)/banned`
- Modified: `app/(auth)/banned.tsx` — top-level `isPermanent` branch renders different copy (no expiry date, "permanently removed", final-decision wording) and a different sign-out confirmation
- Modified: `app/(auth)/account-recovery.tsx` — defensive guard on `handleRestore` that bails out if `permanently_banned=true` (shouldn't reach this screen for permabans after the routing fix, but the guard prevents any future flow from accidentally clearing `deleted_at` for a permaban'd user)

**Smoke tests** (user runs after APK install):
1. ⏳ Warn a test user → user receives push AND a row appears in their in-app notifications inbox with "Account warning" + reason
2. ⏳ Temp-ban a test user → user receives push AND a row appears with "Account suspended until <date>" + reason
3. ⏳ Perma-ban a test user → user receives push, row appears with "Account permanently removed" + reason, AND on next app open they see the banned.tsx perma variant with NO restore button (sign-out only)
4. ⏳ Same user as test 3: verify in Supabase that `permanently_banned=true` and `deleted_at IS NULL` (NOT both set)

**Build verification (new requirement going forward)**: the APK is actually rebuilt with `npx expo run:android --variant release` and the device's `lastUpdateTime` confirmed via `adb shell dumpsys package in.bantle.app | grep lastUpdateTime` to prove this session's code is on the device. Phase 2 shipped without this verification — flagged in retro.

---

### Phase 2.3 — Notifications kind constraint fix + defensive logging

**Status**: SHIPPED

**Goal**: Fix the silent failure of Phase 2.2's moderation notifications. The `notifications.kind` column had a CHECK constraint restricting kind to 7 transactional values. The three new `moderation_*` kinds introduced in Phase 2.2 violated the constraint, so INSERTs were rejected. The admin API didn't check the INSERT error, so the failure was invisible. Push notifications still delivered (separate code path via Expo), but inbox entries never landed.

**Mobile repo migration**:
- `supabase/migrations/20260515154214_phase_2_3_notifications_kind.sql` (+ rollback) drops and recreates `notifications_kind_check` with the three new values added: `moderation_warning`, `moderation_ban_temp`, `moderation_ban_perm`.
- Total kinds allowed: **10** (7 existing + 3 moderation).

**Web admin change**:
- The three notification INSERT calls in `app/admin/api/reports/[id]/resolve/route.ts` now capture the returned error and log via `console.error` with greppable prefixes (`[admin warn] notifications insert failed:`, `[admin ban_temp]`, `[admin ban_perm]`). Logs include `.code`, `.message`, and `.details` so any future failure (constraint violation, RLS denial, network error) is diagnosable from Vercel logs without another patch cycle.
- Insert failures are logged but **do not** fail the admin action — the moderation primary action and the notification row are independent. Degraded UX (missing inbox row) is preferable to a false-failed admin action that already updated the report status and audit log.

**Smoke tests** (user runs):
1. ⏳ Warn a test user → user receives push AND a row appears in `public.notifications` with `kind = 'moderation_warning'` (verifies the constraint fix)
2. ⏳ On the test user's device, in-app notifications inbox shows the warning entry with "Account warning" + reason
3. ⏳ `SELECT * FROM notifications WHERE kind LIKE 'moderation_%'` returns rows after warn / temp-ban / perma-ban tests

**Lessons recorded**: anytime a column governed by a CHECK constraint on an enum-like set needs new values, the constraint must be ALTERed in the same phase that introduces the new values. Phase 2.2 missed this check; Phase 2.3 adds it. **Going forward**: when designing a new column or schema action with enum-like values, explicitly query `information_schema.check_constraints` for any CHECK definitions on the column FIRST.

---

### Phase 3 — Users management

**Status**: SHIPPED

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

**Schema clarification (Phase 3 recon, 2026-05-15)**: `profiles` has no CHECK constraints. `listings.status` has no CHECK constraint (could be any text — defensive rendering required). `deals.host_id` and `buyer_id` are `ON DELETE SET NULL` (deals survive a profile hard-delete with null counterparties). `profiles.display_name` is nullable and 2/10 sample profiles have NULL — every render must use the `getUserDisplayName()` fallback. Recorded in `PHASE_3_RECON.md`.

**Implementation note**: Phase 3's user ban / restore actions reuse the Phase 2 ban_temp / ban_perm / restore semantics (banned_until + permanently_banned columns). No schema migration needed for this phase; all required columns were added in Phase 2 + 2.2. The new admin API endpoints just expose the same actions outside the report-resolution flow.

**bantle-web changes**:
- New: `components/admin/userStatus.ts` — shared status constants (active / temp_banned / perm_banned / self_deleted / admin), `getUserDisplayName` null-safe helper, ban-state derivation, badge styling
- New: `app/admin/api/users/route.ts` — search list (email substring, display_name substring, UUID exact match), paginated 20/page
- New: `app/admin/api/users/[id]/route.ts` — user profile + 6 activity counts (parallel queries)
- New: `app/admin/api/users/[id]/listings/route.ts` — paginated owned listings
- New: `app/admin/api/users/[id]/deals/route.ts` — host OR buyer deals with counterparty display_name
- New: `app/admin/api/users/[id]/reports/route.ts` — filed + received reports
- New: `app/admin/api/users/[id]/audit/route.ts` — admin_actions targeting this user
- New: `app/admin/api/users/[id]/ban/route.ts` — POST with `type: 'temp'|'permanent'`, requires reason, defense-in-depth rejects self-ban and admin targets
- New: `app/admin/api/users/[id]/restore/route.ts` — POST with `type: 'ban'|'self_delete'`, optional reason
- Modified: `app/admin/users/page.tsx` — rewritten from Phase 1 placeholder to functional search page
- New: `app/admin/users/UsersListClient.tsx` — debounced search input, pagination, empty state
- New: `app/admin/users/[id]/page.tsx` — server component with Suspense wrapper
- New: `app/admin/users/[id]/UserDetailClient.tsx` — identity block, 6 count tiles, ban / self-delete context boxes, action panel, tabbed activity
- New: `components/admin/UserRow.tsx` — list row with name, status badge, verified pill, email, joined date, rating
- New: `components/admin/UserActionPanel.tsx` — state-aware action buttons (active → 2 ban buttons; banned → restore; self-deleted → restore; admin → notice, no buttons)
- New: `components/admin/UserActionModal.tsx` — parameterized Radix Dialog handling all 4 actions (ban_temp / ban_perm / restore_ban / restore_self_delete)
- New: `components/admin/UserDetailTabs.tsx` — 4-tab nav with count badges
- New: `components/admin/UserListingsTab.tsx` — table view with status badges, paginated
- New: `components/admin/UserDealsTab.tsx` — card list, role indicator (Host/Buyer), counterparty display name, status badge
- New: `components/admin/UserReportsTab.tsx` — filed + received lists, links to /admin/reports/[id]
- New: `components/admin/UserAuditTab.tsx` — chronological action log with expandable payload JSON

**Smoke tests** (user runs):
1. ⏳ Visit `/admin/users` → list of recent users renders with proper status badges (no "Dismissed" everywhere)
2. ⏳ Search "yaazfashions" → Syed appears with "Admin" badge
3. ⏳ Search a UUID → exact-match user appears
4. ⏳ Click a non-admin user → detail page renders with all 6 count tiles populated correctly
5. ⏳ Click each tab (Listings / Deals / Reports / Audit) → each lazily loads its content
6. ⏳ Reports tab: rows link to `/admin/reports/[id]` correctly
7. ⏳ Audit tab: existing admin_actions rows show with reason + expandable payload
8. ⏳ Click Ban 7 days → modal opens, requires reason, on confirm the user's `banned_until` updates and they get pushed/notified
9. ⏳ Re-open the same user → status is now "Temp banned", action panel shows "Restore from ban"
10. ⏳ Restore from ban → `banned_until` and `permanently_banned` clear; status returns to "Active"
11. ⏳ Edge: visit a user with `display_name = null` → renders "Unnamed user (uuid prefix)" instead of crashing
12. ⏳ Edge: visit Syed (admin) → action panel shows "Cannot action other admins" notice, no buttons; API rejects manual POST with 400 even if the UI were bypassed
13. ⏳ Edge: user with self-deleted state → shows self-delete context box + "Restore from self-deletion" button

---

### Phase 4 — Platforms management

**Status**: SHIPPED

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

**Schema clarification (Phase 4 recon, 2026-05-15)**: `platforms.id` is `text` (slug), not uuid — admin supplies the slug at create time. `platforms.category` is CHECK-constrained to `'music' | 'video' | 'cloud' | 'work'`; adding a category requires a separate migration. **No FK from `listings.platform` → `platforms.id`** — admin must not be exposed to a "hard delete" path for platforms since it would silently orphan listings. The catalog model is therefore soft-delete only (`is_active` toggle). No migration was added in this phase; `platforms.updated_at` is still absent but the `admin_actions` audit log captures every change, which covers the operational need.

**Implementation note**: zero migrations, zero mobile changes. The mobile `usePlatformsStore` already reads the catalog on auth init and caches it for the session. A new platform appears on each user's next sign-in / app cold-start. **Mobile devices already signed in won't see new platforms until they re-init the store** — flagged as a polish item: a future change could expose a manual "refresh catalog" affordance, or extend the store with a TTL.

**bantle-web changes**:
- New: `app/admin/api/platforms/route.ts` — GET (list with per-platform listing counts) + POST (create with full client+server validation, 409 on duplicate slug)
- New: `app/admin/api/platforms/[id]/route.ts` — PATCH (partial update, every field re-validated, audit log captures the change set; slug is immutable)
- Modified: `app/admin/platforms/page.tsx` — rewritten from Phase 1 placeholder to a functional page
- New: `app/admin/platforms/PlatformsListClient.tsx` — fetches GET, groups by category (4 sections), renders rows, wires the editor dialog for create + edit + activate/deactivate toggle
- New: `components/admin/PlatformRow.tsx` — brand tile + label + slug + active pill + price + listing count + display order + Edit / Activate-or-Deactivate buttons (inactive rows render at 60% opacity)
- New: `components/admin/PlatformEditorDialog.tsx` — single Radix Dialog handling create AND edit; slug auto-suggestion from label in create mode (admin can override; auto-suggest disables after manual edit); slug disabled in edit mode; live preview tile updates as you type; client-side validation mirrors server-side regexes; 409 from POST surfaces inline on the slug field

**Smoke tests** (user runs):
1. ⏳ Visit `/admin/platforms` → existing platforms render grouped under Music / Video / Cloud / Work
2. ⏳ Each row shows listing count, price, active pill, and Edit + Deactivate buttons
3. ⏳ Click "Add platform" → editor dialog opens in create mode with empty fields
4. ⏳ Type "Spotify Family" in the Label field → slug auto-fills to `spotify_family`, initials auto-fill to `SP`
5. ⏳ Manually edit the slug → auto-suggestion stops; further label edits don't override the slug
6. ⏳ Submit with an existing slug (e.g., `spotify`) → 409 error surfaces inline on the slug field, not as a toast
7. ⏳ Submit with all valid fields → row appears in the appropriate category section, "Active" pill
8. ⏳ Click Edit on an existing platform → dialog opens, slug field is shown but disabled; other fields are editable
9. ⏳ Change the label and save → row updates with the new label
10. ⏳ Click "Deactivate" on an active platform → status flips to "Inactive", row dims; row stays in the list (not hidden)
11. ⏳ Click "Activate" on the deactivated platform → flips back
12. ⏳ Sign in on the mobile app → platform picker reflects the catalog (newly activated platforms appear, deactivated ones disappear)
13. ⏳ Edge: try invalid hex color (e.g., `#xyz`) → inline error, submit disabled

**Out of scope**: hard delete (would silently orphan listings since there's no FK); category management (requires a CHECK-constraint migration); reordering by drag (display_order is a number field for now — drag-and-drop is a future polish item); mobile force-refresh of the cached platforms store.

---

### Phase 4.1 — PlatformTile fallback for deactivated platforms (3-step rollout)

**Status**: SHIPPED

**Goal**: When admin deactivates a platform, existing listings of that
platform should continue rendering with their real brand tile, not a
blank gray fallback. Architectural fix at three layers (RLS, store,
component) for defense in depth.

**Rolled out across three sub-phases** with checkpoints between each
(safe step-by-step execution):

- 4.1a — RLS policy update on platforms (no app code)
  - DROP `platforms_select_active`, CREATE `platforms_select_all`
  - Authenticated users can SELECT all rows; admin writes still go
    through service role
  - Migration: `phase_4_1a_platforms_rls.sql` + rollback

- 4.1b — Mobile store + types (no APK rebuild)
  - `lib/platforms.ts` — PlatformDef gains isActive field
  - `stores/platforms.ts` — fetch drops .eq('is_active', true) filter;
    rowToDef includes isActive (defaults to true for null)
  - `app/(tabs)/post-listing.tsx` — picker filters to active-only
  - `app/listing/edit/[id].tsx` — picker filters to active-only
  - typecheck clean

- 4.1c — Picker selector hardening + PlatformTile fallback + APK
  - post-listing and edit-listing pickers wrap selectors in useShallow
    (Zustand canonical pattern; prevents fresh-array-every-render)
  - `components/ui/PlatformTile.tsx` — improved fallback renders a
    deterministic hash-derived color + slug initials instead of a
    blank gray box (defense in depth for typos / legacy / hard-deleted
    slugs)
  - APK rebuilt and verified via dumpsys lastUpdateTime

**Admin panel changes**: none (Phase 4 admin CRUD was correct).

**Smoke tests** (user runs):
1. Deactivate Netflix from /admin/platforms → existing Netflix listings
   on mobile homepage STILL render with red Netflix tile (architectural
   fix at work)
2. Open post-listing picker on mobile → Netflix does NOT appear in the
   active picker
3. Reactivate Netflix → still works in new listings; picker shows it
   again
4. Optional: temporarily mutate a listing's platform to a typo slug
   (e.g., "netflx_typo") in DB → mobile renders the listing with a
   deterministic color + initials "N", NOT a blank gray box. Restore
   slug afterward.

**Notes for future phases**:
- The PlatformTile fallback is now defensive — Phase 4 admin (or
  future Phase 5+) can introduce hard-delete behavior on platforms
  without visually breaking historical listings.
- The useShallow pattern on picker selectors is the canonical Zustand
  approach for derived state. Other Zustand selectors in the codebase
  using inline .filter() should be audited at some point (out of
  scope here).

---

### Phase 4.2 — Platform activation/deactivation discovery + notifications

**Status**: SHIPPED, pending Syed verification

**Goal**: Platform activation/deactivation changes discoverability and
communication only. It must not delete, archive, close, cancel, complete,
or date-mutate existing listings or deals.

**Implemented 2026-05-23**:

- Mobile Home uses a new discovery-only view,
  `discoverable_listings_with_availability`, so inactive-platform
  listings disappear from discovery without changing the shared
  `listings_with_availability` view.
- Mobile notification rendering now handles unknown kinds safely and
  supports `platform_deactivated` / `platform_activated`.
- Existing listing, saved, hidden, my-listings, deal, and chat surfaces
  continue to open and show discontinued-platform copy.
- Admin `PATCH /admin/api/platforms/[id]` detects activation vs
  deactivation and sends transactional in-app notifications.
- Platform-status pushes go through `send_push_notification` and the
  `platform_status` Android channel.
- Deactivation recipients: active-listing hosts plus pending/active deal
  participants.
- Activation recipients: hosts with active, unarchived listings.
- Saved-only users, all users, and re-engagement audiences are not
  notified by default.

**Files modified**:

- bantle-web:
  - `app/admin/api/platforms/[id]/route.ts`
  - `app/admin/platforms/PlatformsListClient.tsx`
  - `lib/admin-actions.ts`
- bantle mobile/Supabase:
  - migration `20260523090000_platform_status_notifications_and_discovery.sql`
  - `send_push_notification`
  - mobile notification, Home, platform store, and discontinued-copy surfaces

**Verification**:

- Web `npm run build`: passed after sandbox rerun and one TypeScript-target fix.
- Web `npm run lint`: passed after sandbox rerun.
- Mobile `npm run typecheck`: passed.
- Mobile `npm run lint`: still fails due pre-existing lint debt; see
  `PLATFORM_DEACTIVATION_IMPLEMENTATION.md` in the mobile repo.

**Deployment order**:

1. Ship mobile notification fallback support.
2. Apply Supabase migration in dev/staging first.
3. Deploy updated `send_push_notification`.
4. Deploy web/admin.
5. Apply production migration after smoke tests.

---

### Phase 5 — Listings management

**Status**: VERIFIED

**Goal**: Admin can search listings and force-close abusive/stale ones with a reason.

**Schema migration**: Production migration
`20260523091059_phase_5_listing_close_admin_fields.sql` added
`listings.closed_reason`, `listings.closed_by`, `listings.closed_at`, a
`closed_by` FK to `profiles(id) ON DELETE SET NULL`, supporting listing
indexes, and `listing_closed` in the notifications kind CHECK.

**API routes**:
- `GET /admin/api/listings` — search by listing/user UUID, host email/name, title, platform, status, archived state
- `GET /admin/api/listings/[id]` — detail with host, active/pending deals, recent deals, host report counts, and listing audit entries
- `POST /admin/api/listings/[id]/close` — idempotent force-close with reason

**Pages**:
- `app/admin/listings/page.tsx`
- `app/admin/listings/ListingsClient.tsx`
- `app/admin/listings/[id]/page.tsx`
- `app/admin/listings/[id]/ListingDetailClient.tsx`

**Behavior shipped**:

- Force-close only accepts active listings. Already closed listings return idempotent success without duplicate notification, push, or audit row.
- Force-close sets `status = 'closed'`, `closed_reason`, `closed_by`, `closed_at`, and `updated_at`.
- It leaves `archived_at` unchanged and does not mutate deals, deal dates, conversations, messages, or saved listings.
- Only the host receives the persistent `listing_closed` notification and best-effort transactional push.
- Saved-only users, deal participants, all users, and re-engagement audiences are not notified in Phase 5.
- Admin UI shows active/pending deal warnings and explicitly says existing deals and chats are unchanged.

**Commit SHAs**:

- `9c18b19` — `docs(admin): start phase 5`
- `3504dd2` — `feat(mobile): support listing close notifications`
- `ff1671a` — `feat(admin): add listing management APIs`
- `78d99a3` — `feat(admin): add listings management UI`

**Files modified**:

- bantle mobile/Supabase:
  - `app/_layout.tsx`
  - `app/listing/[id].tsx`
  - `app/notifications.tsx`
  - `stores/notifications.ts`
  - `supabase/functions/send_push_notification/index.ts`
  - `supabase/migrations/20260523091059_phase_5_listing_close_admin_fields.sql`
  - `supabase/migrations/rollback_20260523091059_phase_5_listing_close_admin_fields.sql`
  - `types/database.ts`
- bantle-web:
  - `ADMIN_PANEL_PLAN.md`
  - `PHASE_5_LISTINGS_IMPLEMENTATION.md`
  - `PROJECT_CONTEXT_FOR_AI.md`
  - `PROJECT_DEEP_UNDERSTANDING.md`
  - `app/admin/api/listings/route.ts`
  - `app/admin/api/listings/[id]/route.ts`
  - `app/admin/api/listings/[id]/close/route.ts`
  - `app/admin/listings/page.tsx`
  - `app/admin/listings/ListingsClient.tsx`
  - `app/admin/listings/[id]/page.tsx`
  - `app/admin/listings/[id]/ListingDetailClient.tsx`
  - `components/admin/AdminNav.tsx`
  - `components/admin/ListingCloseModal.tsx`
  - `components/admin/ListingRow.tsx`
  - `components/admin/ListingStatusBadge.tsx`

**Verification**:

- Production Supabase migration applied and read-only verified.
- `send_push_notification` Edge Function deployed with `listing_closed` support.
- Mobile `npm run typecheck`: passed.
- Mobile `npm run lint`: fails due pre-existing repo lint debt unrelated to Phase 5.
- Web `npm run build`: passed.
- Web `npm run lint`: passed.
- `git diff --check`: passed in both repos.

**Known issues**:

- Syed verified Phase 5 smoke and functionality tests passed without failures.
- Mobile lint still has pre-existing errors in unrelated files; do not treat this as a Phase 5 functional blocker while typecheck passes.

**Smoke tests**:
1. Visit `/admin/listings`.
2. Search listings by host email/display name/id.
3. Search listings by title/platform.
4. Filter by status/platform/archived.
5. Open a listing detail page.
6. Confirm host card, listing state, active/pending deals, and recent deals render.
7. Force-close an active listing with reason `Test closure`.
8. Confirm listing status becomes `closed`.
9. Confirm `closed_reason`, `closed_by`, and `closed_at` are populated.
10. Confirm Home no longer shows the listing.
11. Confirm direct listing detail still opens and shows inactive/closed copy.
12. Confirm My Listings shows the listing as closed.
13. Confirm existing chat/deal surfaces still work.
14. Confirm no deal status/date fields changed.
15. Confirm `admin_actions` has `listing_closed`.
16. Confirm host gets in-app `listing_closed` notification.
17. Confirm host push is received or correctly reported skipped if no token.
18. Repeat close on already closed listing and confirm no duplicate notification/push/audit.
19. Confirm notification tap routes safely to listing detail or fallback.

---

### Phase 6 — Deals management

**Status**: VERIFIED

**Goal**: Admin can view deals and force-terminate them for dispute resolution.

**Schema migration**: Production migration
`20260523182659_phase_6_deal_admin_termination.sql` added
`deals.terminated_by`, `deals.termination_reason`, and
`deals.termination_source`, a `terminated_by` FK to `profiles(id) ON DELETE
SET NULL`, supporting admin deal indexes, and `deal_terminated` in the
notifications kind CHECK.

**API routes**:
- `GET /admin/api/deals` — search by deal/listing/user UUID, participant email/name, listing title/platform, status, role, and platform
- `GET /admin/api/deals/[id]` — detail with listing, host, buyer, conversation summary, recent messages, ratings, and deal audit entries
- `POST /admin/api/deals/[id]/terminate` — idempotent admin force-termination with reason

**Pages**:
- `app/admin/deals/page.tsx`
- `app/admin/deals/DealsClient.tsx`
- `app/admin/deals/[id]/page.tsx`
- `app/admin/deals/[id]/DealDetailClient.tsx`

**Behavior shipped**:

- Force-terminate only accepts pending or active deals. Completed, disputed, and user-cancelled deals return 409.
- Already admin-terminated deals return idempotent success without duplicate notification, push, chat event, or audit row.
- Admin termination sets `status = 'cancelled'`, `terminated_at = COALESCE(existing terminated_at, now())`, `terminated_by`, `termination_reason`, and `termination_source = 'admin'`.
- It does not mutate `started_at`, `ends_at`, listings, ratings, conversations, archives, unrelated deals, or chat history.
- Both host and buyer receive persistent `deal_terminated` notifications and best-effort transactional pushes through `send_push_notification`.
- A best-effort system chat event is inserted with `messages.kind = 'deal_cancelled'`, `sender_id = NULL`, and Bantle termination copy.
- Saved-only users, unrelated users, all users, and re-engagement audiences are not notified.

**Commit SHAs**:

- `fc64990` — `docs(admin): start phase 6`
- `b651188` — `feat(mobile): support admin deal termination`
- `320a957` — `feat(admin): add deal management APIs`
- `f721792` — `feat(admin): add deals management UI`

**Files modified**:

- bantle mobile/Supabase:
  - `app/(tabs)/deals.tsx`
  - `app/_layout.tsx`
  - `app/chat/[conversationId].tsx`
  - `app/deal/[id].tsx`
  - `app/notifications.tsx`
  - `stores/deals.ts`
  - `stores/notifications.ts`
  - `supabase/functions/send_push_notification/index.ts`
  - `supabase/migrations/20260523182659_phase_6_deal_admin_termination.sql`
  - `supabase/migrations/rollback_20260523182659_phase_6_deal_admin_termination.sql`
  - `types/database.ts`
- bantle-web:
  - `ADMIN_PANEL_PLAN.md`
  - `PHASE_6_DEALS_IMPLEMENTATION.md`
  - `PROJECT_CONTEXT_FOR_AI.md`
  - `PROJECT_DEEP_UNDERSTANDING.md`
  - `app/admin/api/deals/route.ts`
  - `app/admin/api/deals/[id]/route.ts`
  - `app/admin/api/deals/[id]/terminate/route.ts`
  - `app/admin/deals/page.tsx`
  - `app/admin/deals/DealsClient.tsx`
  - `app/admin/deals/[id]/page.tsx`
  - `app/admin/deals/[id]/DealDetailClient.tsx`
  - `components/admin/AdminNav.tsx`
  - `components/admin/DealRow.tsx`
  - `components/admin/DealStatusBadge.tsx`
  - `components/admin/DealTerminateModal.tsx`

**Verification**:

- Production Supabase migration applied and read-only verified.
- `send_push_notification` Edge Function deployed with `deal_terminated` support.
- Mobile `npm run typecheck`: passed.
- Mobile `npm run lint`: fails due pre-existing repo lint debt unrelated to Phase 6.
- Mobile `git diff --check`: passed.
- Web `npm run build`: passed.
- Web `npm run lint`: passed.
- Web `git diff --check`: passed.

**Known issues**:

- Syed verified Phase 6 smoke and functionality tests passed without failures.
- Mobile lint still has pre-existing errors in unrelated files; do not treat this as a Phase 6 functional blocker while typecheck passes.

**Smoke tests**:
1. Visit `/admin/deals`.
2. Search by deal id.
3. Search by listing id/title/platform.
4. Search by host/buyer email/display name/id.
5. Filter by status.
6. Open deal detail.
7. Confirm host card, buyer card, listing card, conversation/messages, ratings, and audit sections render.
8. Force-terminate a pending test deal with reason `Test termination`.
9. Confirm status becomes `cancelled`.
10. Confirm `terminated_at` is set or preserved.
11. Confirm `terminated_by`, `termination_reason`, and `termination_source = 'admin'`.
12. Confirm both host and buyer get persistent `deal_terminated` notifications.
13. Confirm push is received or correctly reported skipped if no token.
14. Confirm system chat event appears as admin/Bantle termination.
15. Confirm `admin_actions.action_type = 'deal_terminated'`.
16. Confirm Home/listing state is not changed by deal termination.
17. Confirm ratings are not changed.
18. Confirm unrelated deals are not changed.
19. Confirm existing chat still opens.
20. Repeat terminate on already admin-terminated deal and confirm no duplicate notification/push/message/audit.
21. Try terminate completed/disputed/user-cancelled deal and confirm 409/friendly error.
22. Confirm mobile deal detail/deals tab show admin termination copy.

---

### Phase 7 — Audit log viewer

**Status**: VERIFIED

**Goal**: Admin can view a read-only feed of all admin actions, filterable.

**API routes**:
- `GET /admin/api/audit` — read-only paginated audit feed, filterable by action, admin, target user, target resource, date range, and search text

**Pages**:
- `app/admin/audit/page.tsx`
- `app/admin/audit/AuditClient.tsx`

**Components**:
- `components/admin/AuditActionBadge.tsx`
- `components/admin/AuditPayloadViewer.tsx`
- `components/admin/AuditRow.tsx`

**Behavior shipped**:

- `/admin/audit` lists `admin_actions` latest-first.
- The API is GET-only and uses `requireAdmin()` plus the service-role Supabase client on the server.
- Phase 7 does not add migrations, does not change mobile code, and does not mutate audit rows.
- Filters support action type, target resource type, date range, and text/UUID search.
- Payload JSON is collapsed by default and display-redacts suspicious keys containing token/secret/key/password/authorization/private.
- Known resource rows link safely to user, listing, deal, report, or platforms admin pages.
- Unknown action types and resource types render with neutral fallback UI.
- No edit/delete/export UI or API route exists.

**Commit SHAs**:

- `70ff8d4` — `docs(admin): start phase 7`
- `ce74c40` — `feat(admin): add audit log API`
- `b1e5865` — `feat(admin): add audit log viewer`

**Files modified**:

- `ADMIN_PANEL_PLAN.md`
- `PROJECT_CONTEXT_FOR_AI.md`
- `PROJECT_DEEP_UNDERSTANDING.md`
- `PHASE_7_AUDIT_IMPLEMENTATION.md`
- `app/admin/api/audit/route.ts`
- `app/admin/audit/page.tsx`
- `app/admin/audit/AuditClient.tsx`
- `components/admin/AdminNav.tsx`
- `components/admin/AuditActionBadge.tsx`
- `components/admin/AuditPayloadViewer.tsx`
- `components/admin/AuditRow.tsx`

**Verification**:

- Web `npm run build`: passed.
- Web `npm run lint`: passed.
- Web `git diff --check`: passed.
- Mobile repo was not changed for Phase 7.
- No Supabase migration was added or applied for Phase 7.

**Known issues**:

- Phase 7 is shipped but not verified. Syed must run the smoke tests below.

**Smoke tests**:
1. Visit `/admin/audit`.
2. Confirm audit actions appear latest-first.
3. Filter by `user_banned`.
4. Filter by `listing_closed`.
5. Filter by `deal_terminated`.
6. Filter by `platform_deactivated` or `platform_activated`.
7. Filter by date range.
8. Search by target resource id.
9. Search by action/reason text.
10. Expand and collapse payload.
11. Confirm payload renders safely and suspicious keys are redacted if present.
12. Click supported links: user, listing, deal, report, platform.
13. Confirm unknown/stale action types still render.
14. Confirm there are no edit/delete/export buttons.
15. Confirm non-admin user cannot access `/admin/audit`.
16. Confirm non-admin user cannot access `/admin/api/audit`.

---

### Phase 8 — Manual broadcast push

**Status**: SHIPPED

**Goal**: Admin can send incident updates to eligible users for genuine incidents only. Confirmed, audit-logged, and not rate-limited by a 24-hour cooldown.

**This phase is the most sensitive.** It exposes the ability to push to every user. The constraints are:

- No 24-hour cooldown. Admin may send multiple incident updates when needed, such as outage-start and outage-resolved notices.
- Mandatory reason field, stored in audit log.
- Confirmation modal: "Send to N users? This action is irreversible."
- Banner above the broadcast form: "Broadcasts are for incidents only — service outages, security notices. Do not use for marketing or re-engagement."

**Schema**:
- New `broadcasts` table tracks incident title/body, admin-only reason, audience filter, idempotency key, event id, status, counts, sent/completed timestamps, and error summary.
- New `broadcast_recipients` table tracks per-recipient notification id, push ticket/error, status, and timestamps. It does not store push token snapshots.
- Both tables have RLS enabled and no user policies; service-role admin routes and the Edge Function own access.
- `notifications_kind_check` now includes `broadcast_incident`.

**API routes**:
- `GET /admin/api/broadcasts` — recent broadcasts.
- `POST /admin/api/broadcasts` — validates and starts an incident broadcast, then invokes `broadcast_push_dispatcher`.
- `GET /admin/api/broadcasts/preview` — read-only recipient and push-token counts.
- `POST /admin/api/broadcasts/[id]/retry` — retries an existing failed/partial broadcast without creating a new broadcast row.

**Edge Function**:
- `broadcast_push_dispatcher` — dedicated dispatcher for incident broadcasts. It creates/reuses persistent `broadcast_incident` notifications, sends Expo pushes one recipient/token per request on the `incident_broadcast` channel to avoid mixed-project Expo token failures, clears stale tokens on `DeviceNotRegistered`, and updates broadcast/recipient counts.

**Pages**:
- `app/admin/broadcasts/page.tsx`
- `app/admin/broadcasts/BroadcastsClient.tsx`

**Behavior shipped**:

- `/admin/broadcasts` defaults to `All eligible users`; `Test only: Syed` remains available for smoke testing.
- The page shows the required incident-only warning banner and recent broadcast summaries.
- Failed/partial broadcasts show a Retry failed delivery action. Retry reuses the same broadcast row and is intended for recipients that failed or missed in-app notification.
- User-visible title/body reject URLs, line breaks, and obvious marketing or re-engagement wording.
- Every send requires an admin-only reason and exact confirmation phrase `SEND INCIDENT BROADCAST`.
- `all_eligible` is not rate-limited by a 24-hour cooldown. Admin may send repeated incident updates when operationally necessary.
- Eligible recipients exclude deleted users, permanently banned users, and currently temp-banned users.
- All eligible users receive persistent in-app notifications. Users with push tokens also receive a push.
- In-app notification delivery is independent from push delivery; push failures should result in `partial_failure`, not a total broadcast failure.
- Incident broadcasts are transactional/service notices, not marketing; analytics consent is not used as a gate.
- Persistent in-app notification payloads include only broadcast id, event id, title, body, audience type, and sent time. They do not expose admin id, internal reason, email, push token, or recipient list.
- User-facing broadcast push and in-app notifications display the admin-entered title/body. Fallback copy is only for malformed or missing payloads.
- In-app broadcast row taps mark read and stay on `/notifications`; push banner taps open `/notifications` without stacking when already there.
- Mobile push notification responses are consumed once with a central handler, in-memory and persisted recent response keys, and `clearLastNotificationResponseAsync()` when available, so stale broadcast push taps do not reopen `/notifications` on later app opens.
- Codex did not send an all-user broadcast during implementation, the cooldown-removal adjustment, the reliability fix, or the copy clarity fix.
- Codex did not send a `test_syed` broadcast during implementation or this cooldown-removal adjustment; Syed should run the test send manually.

**Commit SHAs**:

- `5e67e6c` — `docs(admin): start phase 8`
- `f03c230` — `feat(mobile): support incident broadcasts`
- `e5ad933` — `feat(supabase): add incident broadcast dispatcher`
- `f51c9de` — `feat(admin): add incident broadcast APIs`
- `a948263` — `feat(admin): add incident broadcast UI`
- `a6091a2` — `fix(admin): remove incident broadcast cooldown`
- `2767f50` — `fix(mobile): show broadcast notification details`

**Files modified**:

- Mobile/Supabase repo:
  - `app/_layout.tsx`
  - `app/notifications.tsx`
  - `lib/push.ts`
  - `stores/notifications.ts`
  - `supabase/config.toml`
  - `supabase/functions/broadcast_push_dispatcher/index.ts`
  - `supabase/migrations/20260524000345_phase_8_incident_broadcasts.sql`
  - `supabase/migrations/rollback_20260524000345_phase_8_incident_broadcasts.sql`
  - `types/database.ts`
- Web/admin repo:
  - `ADMIN_PANEL_PLAN.md`
  - `PROJECT_CONTEXT_FOR_AI.md`
  - `PROJECT_DEEP_UNDERSTANDING.md`
  - `PHASE_8_BROADCAST_IMPLEMENTATION.md`
  - `app/admin/api/broadcasts/route.ts`
  - `app/admin/api/broadcasts/[id]/retry/route.ts`
  - `app/admin/api/broadcasts/preview/route.ts`
  - `app/admin/broadcasts/page.tsx`
  - `app/admin/broadcasts/BroadcastsClient.tsx`
  - `components/admin/AdminNav.tsx`
  - `components/admin/AdminToast.tsx`
  - `lib/admin-broadcasts.ts`

**Verification**:

- Web `npm run build`: passed after cooldown-removal adjustment.
- Web `npm run lint`: passed after cooldown-removal adjustment.
- Web `git diff --check`: passed after cooldown-removal adjustment.
- Mobile `npm run typecheck`: passed.
- Mobile `git diff --check`: passed.
- Mobile `npm run lint`: failed on pre-existing unrelated lint debt outside Phase 8 files.
- Production Supabase migration was applied and read-only verified.
- `broadcast_push_dispatcher` was deployed and listed active.
- Reliability fix deployed `broadcast_push_dispatcher` version 2.

**Known issues**:

- Phase 8 is shipped but not verified. Syed must run the smoke tests below.
- No all-user broadcast was sent by Codex.
- No `test_syed` broadcast was sent by Codex.
- Mobile lint still has pre-existing unrelated errors in older files; Phase 8 touched files were not in the lint failure list.
- Latest all-user broadcast `29f165e4-efaf-4eb2-b1de-6d2896588dbe` has 20 in-app notifications with title/body payload fields; read-only inspection during the copy clarity fix showed it as `completed`.

**Smoke tests**:
1. Visit `/admin/broadcasts`.
2. Confirm incident-only warning banner is visible.
3. Confirm default audience is `All eligible users`.
4. Preview `test_syed`.
5. Preview `all_eligible`.
6. Confirm counts are sensible.
7. Try wrong confirmation phrase and confirm blocked.
8. Try missing reason and confirm blocked.
9. Try marketing/re-engagement wording and confirm blocked.
10. Send test broadcast to Syed only.
11. Confirm push received on Syed's device, or skipped count if no token.
12. Confirm in-app notification row appears.
13. Confirm push notification tap opens `/notifications`, and tapping the in-app broadcast row marks read without stacking another Notifications screen.
14. Confirm `broadcasts` row summary.
15. Confirm `broadcast_recipients` row for test user.
16. Confirm `admin_actions.action_type = broadcast_sent`.
17. Confirm recent broadcasts list shows the send and counts.
18. Confirm `Test only: Syed` is clearly labeled as smoke-test-only.
19. Confirm all-user option requires typed confirmation and is not blocked by any 24-hour cooldown message.
20. For a failed/partial row, click Retry failed delivery and confirm it does not create a new broadcast row.
21. Do not send all-user unless Syed explicitly decides to after reviewing the implementation.
22. Confirm non-admin cannot access `/admin/broadcasts`.
23. Confirm non-admin cannot access `/admin/api/broadcasts`, `/admin/api/broadcasts/preview`, or `/admin/api/broadcasts/[id]/retry`.

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

### Before Phase 5 (Listings) [RESOLVED]
- `listings.closed_reason`, `listings.closed_by`, and `listings.closed_at` were added by Phase 5 migration `20260523091059_phase_5_listing_close_admin_fields.sql`.

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
