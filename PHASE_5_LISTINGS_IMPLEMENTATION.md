# Phase 5 Listings Management Implementation

Generated: 2026-05-23

## Summary

Phase 5 adds admin listings management to `bantle-web` and the required mobile/Supabase compatibility in `bantle`.

Admins can now search listings, inspect listing detail with host/deal/audit context, and force-close active listings with a reason. Force-close removes the listing from discovery by setting `listings.status = 'closed'`, but it does not archive/delete listings, does not mutate existing deals, and does not change conversations or messages.

## Commits

- `9c18b19` (`bantle-web`) - `docs(admin): start phase 5`
- `3504dd2` (`bantle`) - `feat(mobile): support listing close notifications`
- `ff1671a` (`bantle-web`) - `feat(admin): add listing management APIs`
- `78d99a3` (`bantle-web`) - `feat(admin): add listings management UI`
- Final docs commit: see `docs(admin): phase 5 shipped`

## Supabase Changes

Production project: `fpoviccitrraonvvgont`

Applied migration:

- `bantle/supabase/migrations/20260523091059_phase_5_listing_close_admin_fields.sql`

Created rollback migration:

- `bantle/supabase/migrations/rollback_20260523091059_phase_5_listing_close_admin_fields.sql`

Schema changes:

- Added nullable `public.listings.closed_reason text`.
- Added nullable `public.listings.closed_by uuid`.
- Added nullable `public.listings.closed_at timestamptz`.
- Added `listings_closed_by_fkey` from `closed_by` to `public.profiles(id) ON DELETE SET NULL`.
- Added comments on the new close fields.
- Extended `notifications_kind_check` to include `listing_closed`.
- Added `listings_user_created_idx` on `(user_id, created_at desc)`.
- Added `listings_admin_status_created_idx` on `(status, created_at desc)`.

Read-only verification confirmed the close columns, FK, indexes, and `listing_closed` notification kind exist in production.

## Mobile/Supabase Repo Changes

Repo: `/Users/syedejazahammed/Documents/GitHub/bantle`

Changed files:

- `app/_layout.tsx`
- `app/listing/[id].tsx`
- `app/notifications.tsx`
- `stores/notifications.ts`
- `supabase/functions/send_push_notification/index.ts`
- `supabase/migrations/20260523091059_phase_5_listing_close_admin_fields.sql`
- `supabase/migrations/rollback_20260523091059_phase_5_listing_close_admin_fields.sql`
- `types/database.ts`

Implemented:

- Added `listing_closed` to mobile notification kind handling.
- Added safe notification copy and tap routing to `/listing/<id>` or `/my-listings`.
- Preserved unknown notification fallback safety.
- Added `listing_closed` push support to `send_push_notification`.
- Used the existing `moderation` Android channel for listing close push.
- Updated local Supabase types for the new listing close fields and FK.
- Kept listing detail compatible with `listings_with_availability`, which does not expose the new close fields.

Edge Function:

- `send_push_notification` was deployed with `listing_closed` support.
- Deployed function version reported by Supabase MCP: `8`.

## Web/Admin Repo Changes

Repo: `/Users/syedejazahammed/Documents/GitHub/bantle-web`

API files:

- `app/admin/api/listings/route.ts`
- `app/admin/api/listings/[id]/route.ts`
- `app/admin/api/listings/[id]/close/route.ts`

UI files:

- `app/admin/listings/page.tsx`
- `app/admin/listings/ListingsClient.tsx`
- `app/admin/listings/[id]/page.tsx`
- `app/admin/listings/[id]/ListingDetailClient.tsx`
- `components/admin/AdminNav.tsx`
- `components/admin/ListingCloseModal.tsx`
- `components/admin/ListingRow.tsx`
- `components/admin/ListingStatusBadge.tsx`

Docs:

- `ADMIN_PANEL_PLAN.md`
- `PROJECT_CONTEXT_FOR_AI.md`
- `PROJECT_DEEP_UNDERSTANDING.md`
- `PHASE_5_LISTINGS_IMPLEMENTATION.md`

Implemented APIs:

- `GET /admin/api/listings`
  - Supports `q`, `user_id`, `platform`, `status`, `archived`, `page`, and `page_size`.
  - Searches listing UUID, user UUID, title, platform, host email, and host display name.
  - Includes host summary, slots available, pending deal count, and active deal count.
- `GET /admin/api/listings/[id]`
  - Returns listing detail, host profile, active/pending deals, recent deals, audit entries targeting the listing, and host report counts.
- `POST /admin/api/listings/[id]/close`
  - Validates a 3-500 char reason.
  - Active listings are updated to `closed` with close metadata.
  - Already closed listings return idempotent success without duplicate notification, push, or audit.
  - Non-active/non-closed statuses return 409.
  - Existing deals are counted for context only and are not mutated.
  - Host receives one persistent `listing_closed` notification and best-effort push.
  - `admin_actions` receives `action_type = 'listing_closed'`.

Implemented UI:

- Added `Listings` to admin navigation.
- Added `/admin/listings` with search, status/platform/archive filters, pagination, loading/error/empty states, and listing rows.
- Added `/admin/listings/[id]` with listing summary, host card, active/pending deals warning, recent deals, audit entries, closed info, and force-close action.
- Added close modal with required reason and explicit copy that deals/chats are unchanged.

## Commands Run

Mobile repo:

- `npm run typecheck` - passed after adapting listing detail types for the unchanged `listings_with_availability` view.
- `npm run lint` - failed due pre-existing app-wide lint debt unrelated to Phase 5.
- `git diff --check` - passed.

Web/admin repo:

- `npm run build` - passed.
- `npm run lint` - passed.
- `git diff --check` - passed.

Supabase MCP:

- Applied additive migration `phase_5_listing_close_admin_fields`.
- Verified close columns, FK, notification CHECK, and indexes with read-only SQL.
- Deployed `send_push_notification` with `listing_closed` support.

## Production Notes

- Production migration was applied because there is no dev/staging project on the free tier.
- The migration is additive and does not change listing/deal lifecycle data.
- No production listing/deal data was force-closed by Codex.
- `listing_closed` notification rows are now supported by production DB and mobile code.
- Mobile release still needs to be built and distributed before relying on listing-close notifications broadly.

## Known Risks / Assumptions

- Mobile lint failures remain pre-existing and should be cleaned up separately.
- `listings.status` intentionally remains unconstrained text; admin UI renders unknown values defensively.
- `listings.platform` is not FK-constrained to `platforms.id`; admin UI shows raw platform slug.
- Push delivery is best effort. Missing/stale tokens must not roll back listing close.
- Notification insert or push failure does not roll back listing close; the API reports a summary for the admin UI.

## Smoke Test Checklist

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

## Rollback Notes

- If UI/API behavior is wrong, disable or hide the close button first.
- Revert web route/UI commits if necessary.
- Do not bulk-reopen listings. Any accidental listing reopen must be manual and audited.
- Roll back `notifications_kind_check` only after deleting/remapping `listing_closed` notification rows.
- Drop close columns only if no deployed code depends on them.
- The rollback migration in the mobile repo documents the required SQL order.

## Pending

- Syed must run the smoke tests and mark Phase 5 `VERIFIED` only after they pass.
- Mobile app release is required for production users to receive first-class `listing_closed` notification UI.
- Optional future cleanup: replace stale permanent-ban audit action naming and clean up mobile lint debt.
