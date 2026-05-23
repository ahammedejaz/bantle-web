# Phase 6 Deals Management Implementation

Generated: 2026-05-23

## What changed

- Phase 5 was marked VERIFIED after Syed confirmed smoke tests passed.
- Phase 6 was implemented and marked SHIPPED, awaiting Syed verification.
- Admin can search deals, open deal detail, and force-terminate pending/active deals with a reason.
- Force-termination is represented as `status = 'cancelled'` plus admin termination metadata.
- Existing listings, ratings, conversations, archives, started/ends dates, and unrelated deals are not mutated.
- Host and buyer receive transactional `deal_terminated` in-app notifications and best-effort pushes.
- A best-effort system chat event is inserted with existing `messages.kind = 'deal_cancelled'`.

## Supabase migration applied

Applied to production project `fpoviccitrraonvvgont` via Supabase MCP:

- `bantle/supabase/migrations/20260523182659_phase_6_deal_admin_termination.sql`
- Rollback file created: `bantle/supabase/migrations/rollback_20260523182659_phase_6_deal_admin_termination.sql`

The migration is additive:

- Added nullable `deals.terminated_by uuid` with FK to `profiles(id) ON DELETE SET NULL`.
- Added nullable `deals.termination_reason text`.
- Added nullable `deals.termination_source text`.
- Added `deal_terminated` to `notifications_kind_check`.
- Added admin read-path indexes for deal status, listing, host, and buyer.

Read-only MCP verification confirmed:

- `deals.terminated_by`, `termination_reason`, and `termination_source` exist.
- `notifications_kind_check` includes `deal_terminated`.
- `deals_admin_status_created_idx`, `deals_admin_listing_created_idx`, `deals_admin_host_created_idx`, and `deals_admin_buyer_created_idx` exist.
- `send_push_notification` was deployed as version 9 with `deal_terminated` support.

## Files changed

Mobile/Supabase repo commit `b651188`:

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

Web/admin commits:

- `fc64990` — `docs(admin): start phase 6`
- `320a957` — `feat(admin): add deal management APIs`
- `f721792` — `feat(admin): add deals management UI`

Web/admin files:

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
- `ADMIN_PANEL_PLAN.md`
- `PROJECT_CONTEXT_FOR_AI.md`
- `PROJECT_DEEP_UNDERSTANDING.md`
- `PHASE_6_DEALS_IMPLEMENTATION.md`

## Commands run

Mobile repo:

- `supabase gen types typescript --linked > types/database.ts` — passed after rerun outside sandbox for DNS/network access.
- `npm run typecheck` — passed.
- `git diff --check` — passed.
- `npm run lint` — failed due pre-existing repo lint debt unrelated to Phase 6.
- `git status --short` — untracked handoff/recon/build files remain intentionally uncommitted.

Web/admin repo:

- `npm run build` — passed.
- `npm run lint` — passed.
- `git diff --check` — passed.
- `git status --short` — `.gitignore`, `CHATGPT_WEB_REPO_HANDOFF.md`, and `database-backups/` remain intentionally uncommitted/unrelated.

## Production notes

- Production database migration was applied.
- Edge Function `send_push_notification` was deployed with `deal_terminated` support.
- Web/admin changes were committed and pushed.
- Mobile changes were committed and pushed, but users still need a mobile app release/install to receive first-class `deal_terminated` UI and admin-terminated deal copy.

## Smoke test checklist

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

## Rollback notes

- Disable the terminate button/UI first if issue is UI/API only.
- Revert web route/UI commits if necessary.
- Do not bulk-reactivate or rewrite deals.
- Any accidental deal correction must be manual and audited.
- Roll back `notifications_kind_check` only after deleting/remapping `deal_terminated` rows.
- Drop admin termination columns only if no deployed code depends on them.
- Edge Function can be redeployed to the previous version if push copy breaks; persistent notifications remain readable by fallback clients.

## Pending

- Syed must run Phase 6 smoke tests and then mark Phase 6 VERIFIED in `ADMIN_PANEL_PLAN.md` if they pass.
- A mobile release/install is required before relying broadly on first-class `deal_terminated` notification rendering and admin-termination deal UI.
