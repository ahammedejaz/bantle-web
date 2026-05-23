# Phase 8 Incident Broadcast Implementation

Date: 2026-05-24

## What Changed

Phase 8 added incident-only manual broadcast push support for Bantle admins.

- Added service-role-only `broadcasts` and `broadcast_recipients` tables in Supabase.
- Added notification kind `broadcast_incident`.
- Added mobile notification rendering, tap fallback, and Android channel `incident_broadcast`.
- Added dedicated Supabase Edge Function `broadcast_push_dispatcher`.
- Added admin APIs:
  - `GET /admin/api/broadcasts`
  - `POST /admin/api/broadcasts`
  - `GET /admin/api/broadcasts/preview`
  - `POST /admin/api/broadcasts/[id]/retry`
- Added `/admin/broadcasts` UI and Broadcasts nav item.

This feature is incident-only. It does not support marketing, re-engagement, promotions, discounts, retention nudges, or arbitrary all-user messaging.

## Files Changed

Mobile/Supabase repo:

- `app/_layout.tsx`
- `app/notifications.tsx`
- `lib/push.ts`
- `stores/notifications.ts`
- `supabase/config.toml`
- `supabase/functions/broadcast_push_dispatcher/index.ts`
- `supabase/migrations/20260524000345_phase_8_incident_broadcasts.sql`
- `supabase/migrations/rollback_20260524000345_phase_8_incident_broadcasts.sql`
- `types/database.ts`

Web/admin repo:

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

## Migration Applied

Production Supabase migration applied:

- `20260524000345_phase_8_incident_broadcasts.sql`

It adds:

- `public.broadcasts`
- `public.broadcast_recipients`
- `broadcast_incident` to `notifications_kind_check`
- Supporting indexes and RLS with no user policies

Rollback file created but not run:

- `rollback_20260524000345_phase_8_incident_broadcasts.sql`

## Edge Function

Deployed:

- `broadcast_push_dispatcher`

Dispatcher behavior:

- Accepts POST `{ "broadcast_id": "uuid" }` and retry POST `{ "broadcast_id": "uuid", "retry": true }`.
- Requires the broadcast row to be `status = 'sending'`, or `failed` / `partial_failure` when retrying.
- Resolves `test_syed` server-side from `BANTLE_BROADCAST_TEST_USER_ID` or the server-only fallback UUID.
- Resolves `all_eligible` by excluding deleted, permanently banned, and currently temp-banned users.
- Inserts or reuses persistent `broadcast_incident` notifications.
- Sends Expo pushes one recipient/token per request only to recipients with `push_token`.
- Uses the Android channel `incident_broadcast`.
- Clears stale push tokens when Expo returns `DeviceNotRegistered`.
- Updates broadcast and recipient counts/status.
- Does not write `admin_actions`; the web route owns audit logging.

## Safety Rules Implemented

- Default audience is `test_syed`.
- `all_eligible` requires the same typed confirmation phrase as test sends.
- Exact confirmation phrase: `SEND INCIDENT BROADCAST`.
- Mandatory admin-only reason.
- User-visible title/body are URL-free and single-line.
- User-visible title/body reject obvious marketing and re-engagement wording.
- `all_eligible` is not blocked by a 24-hour cooldown. Admin may send repeated incident updates when operationally necessary.
- `test_syed` is for smoke verification only.
- Broadcast notification payloads do not include admin id, internal reason, email, push token, or recipient list.
- Analytics consent is not used as a gate because these are transactional incident notices, not analytics or marketing.
- Codex did not send an all-user broadcast.
- Codex did not send a `test_syed` broadcast.

## Phase 8 Adjustment - 2026-05-24

Syed corrected the broadcast product behavior after initial Phase 8 shipment:

- Removed the 24-hour all-user restriction from API, UI, and docs.
- Removed all-user rate-limit fields from broadcast GET/preview responses.
- Removed the POST 429 path for recent all-user broadcasts.
- Changed `/admin/broadcasts` to default to `All eligible users`.
- Kept `Test only: Syed` as an explicit smoke-test option.
- Added clearer all-user copy: all eligible users receive in-app notifications, and users with push tokens also receive pushes.
- Kept all incident-only safeguards: admin-only auth, mandatory reason, exact confirmation phrase, URL blocking, marketing/re-engagement wording block, idempotency, audit logging, persistent notifications, push-token-only push delivery, deleted/banned exclusion, and dispatcher duplicate protection.
- No migration was needed. The existing all-user helper index is harmless and does not enforce a cooldown.
- No broadcast was sent during this adjustment.

## Broadcast Reliability Fix - 2026-05-24

Syed observed an all-user incident broadcast with 20 eligible recipients that finished as `partial_failure` because Expo rejected a push request containing tokens from different Expo projects/builds.

Production state observed before the fix:

- Latest broadcast id: `29f165e4-efaf-4eb2-b1de-6d2896588dbe`.
- Status: `partial_failure`.
- Recipients: 20.
- Persistent in-app notifications: 20 distinct `broadcast_incident` rows existed.
- Recipient statuses: 5 `failed`, 15 `skipped_no_token`.
- Push counts: 0 success, 5 failure, 15 skipped.
- Error summary: Expo mixed-project token error.

Fix shipped:

- `broadcast_push_dispatcher` now sends Expo pushes one recipient/token per request, avoiding mixed-project batch rejection.
- Persistent in-app notification creation is independent from push delivery.
- Existing notification rows are reused on retry; the dispatcher checks for a notification by user and broadcast id before inserting.
- Existing `broadcast_recipients` rows are reused on retry; retry does not create a new broadcast row and does not expand an old broadcast to newly eligible users.
- Push failures affect only that recipient and produce `partial_failure`, not a total dispatcher failure.
- `DeviceNotRegistered` still clears only that specific profile push token.
- Error summaries are non-secret and scrub Expo push token strings.
- Web/admin added `POST /admin/api/broadcasts/[id]/retry` and a Retry failed delivery button for `failed` / `partial_failure` rows.
- Retry audit uses existing `broadcast_sent` action type with payload `{ retry: true }`.
- Codex did not retry the existing partial-failure broadcast automatically; Syed can retry it from `/admin/broadcasts`.

## Commands Run

Mobile/Supabase:

- `supabase gen types typescript --linked > types/database.ts` - passed.
- `npm run typecheck` - passed.
- `npm run lint` - failed on pre-existing unrelated lint debt outside Phase 8 files.
- `git diff --check` - passed.

Web/admin:

- `npm run build` - passed.
- `npm run lint` - passed.
- `git diff --check` - passed.

Supabase MCP:

- Applied production migration `phase_8_incident_broadcasts`.
- Verified `broadcasts` and `broadcast_recipients` exist.
- Verified RLS is enabled and no user policies exist on both new tables.
- Verified `notifications_kind_check` includes `broadcast_incident`.
- Deployed and verified active Edge Function `broadcast_push_dispatcher`.

## Commits

- `5e67e6c` - `docs(admin): start phase 8`
- `f03c230` - `feat(mobile): support incident broadcasts`
- `e5ad933` - `feat(supabase): add incident broadcast dispatcher`
- `f51c9de` - `feat(admin): add incident broadcast APIs`
- `a948263` - `feat(admin): add incident broadcast UI`

## Production Notes

- The migration has already been applied to production.
- The Edge Function has already been deployed.
- No all-user broadcast was sent by Codex.
- Syed can use `test_syed` for smoke verification.
- All-user broadcast capability exists in code and should be used only for genuine incident updates.

## Smoke Test Checklist

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
13. Confirm notification tap routes to `/notifications`.
14. Confirm `broadcasts` row summary.
15. Confirm `broadcast_recipients` row for test user.
16. Confirm `admin_actions.action_type = broadcast_sent`.
17. Confirm recent broadcasts list shows the send and counts.
18. Confirm all-user option requires typed confirmation.
19. Confirm `Test only: Syed` is clearly labeled as smoke-test-only.
20. Confirm no all-user 24-hour cooldown messaging appears.
21. Do not send all-user unless Syed explicitly decides to after reviewing the implementation.
22. Confirm non-admin cannot access `/admin/broadcasts`.
23. Confirm non-admin cannot access `/admin/api/broadcasts` or `/admin/api/broadcasts/preview`.

## Rollback Notes

- Broadcasts cannot be unsent.
- If issue is UI-only, remove the Broadcasts nav item first.
- If issue is API-side, temporarily return 503 from `POST /admin/api/broadcasts` while leaving GET visible for audit.
- If issue is dispatcher-side, disable POST route invocation or redeploy the previous function state.
- Do not delete audit records casually.
- Restore `notifications_kind_check` only after deleting or remapping `broadcast_incident` notification rows.
- Drop broadcast tables only after confirming no deployed code depends on them and after retaining any audit data Syed needs.
- If a mistaken all-user broadcast is sent, document and audit it. Do not try to delete history; send a corrective incident notice only if truly necessary.

## Pending

- Syed smoke verification.
- Syed decision on if/when to use an all-user incident broadcast.
- Mobile lint cleanup remains separate pre-existing work.
