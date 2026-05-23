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

- Accepts POST `{ "broadcast_id": "uuid" }`.
- Requires the broadcast row to be `status = 'sending'`.
- Resolves `test_syed` server-side from `BANTLE_BROADCAST_TEST_USER_ID` or the server-only fallback UUID.
- Resolves `all_eligible` by excluding deleted, permanently banned, and currently temp-banned users.
- Inserts persistent `broadcast_incident` notifications.
- Sends Expo pushes only to recipients with `push_token`.
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
- `all_eligible` is rate-limited server-side to one broadcast per rolling 24 hours.
- `test_syed` bypasses the all-user 24-hour limit.
- Broadcast notification payloads do not include admin id, internal reason, email, push token, or recipient list.
- Analytics consent is not used as a gate because these are transactional incident notices, not analytics or marketing.
- Codex did not send an all-user broadcast.
- Codex did not send a `test_syed` broadcast.

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
- Syed should run a `test_syed` smoke send before considering any all-user incident notice.
- All-user broadcast capability exists in code but should only be used for genuine incidents after manual review.

## Smoke Test Checklist

1. Visit `/admin/broadcasts`.
2. Confirm incident-only warning banner is visible.
3. Confirm default audience is `Test: Syed only`.
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
19. Confirm all-user 24-hour rate-limit display.
20. Do not send all-user unless Syed explicitly decides to after reviewing the implementation.
21. Confirm non-admin cannot access `/admin/broadcasts`.
22. Confirm non-admin cannot access `/admin/api/broadcasts` or `/admin/api/broadcasts/preview`.

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
