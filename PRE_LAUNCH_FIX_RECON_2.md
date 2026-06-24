# Pre-Launch Fix Recon 2

## 1. Executive Summary

| Observation | Status | Severity | Recommended next action | Safe to implement now? |
| --- | --- | --- | --- | --- |
| 1. Platform activate/deactivate shows "Some notifications failed" | Confirmed from web UI code, admin action summaries, and Edge Function logs | P1 / Medium | Fix `send_push_notification` Expo ticket parsing and improve admin toast copy to distinguish push failures from persisted in-app notification failures | Yes for parser/UI wording; dynamic staging smoke still required |
| 2. Broadcast works | Confirmed by user report and no related regression found in code/logs | No action | Leave broadcast unchanged except optionally reusing its proven Expo ticket parser pattern | No implementation needed |
| 3. Deal cancellation / admin termination / listing warning context | Confirmed UI/data gap | P1 / Medium | Add lifecycle-aware deal/listing UI and decide whether listing closure context should be exposed through deal queries/RPC/snapshots | Partly safe; exact warning/copy and listing-closure behavior need Syed decision |
| 4. Admin-closed listing can be reopened by same user | Confirmed by code and live RLS/trigger inspection | P0 / High | Add DB-level protection for admin-closed listings, then hide/disable mobile Reopen for admin-closed listings | Yes; migration required |
| 5. Soft-deleted account display in deals shows "DELETED USER" and "Listing Unavailable" | Confirmed by code/schema/RLS behavior | P1 / Medium | Decide 7-day recovery product/privacy behavior, then implement UI/data access/snapshot strategy | Needs Syed decision before implementation |
| 6. Report actions from admin | No direct issue found | No action | Leave unchanged unless a new dynamic failure appears | No implementation needed |
| 7. User ban from admin users board | No direct issue found | No action | Leave unchanged unless a new dynamic failure appears | No implementation needed |

Top confirmed root causes:

- Platform partial failure is not supported by evidence as an internal-secret auth regression. The admin route passed internal headers, `send_push_notification` returned HTTP 200, in-app notification rows were inserted, and admin summaries recorded `push_failed:no_ticket`.
- `send_push_notification` currently reads Expo response tickets as `json.data?.[0]`, while `broadcast_push_dispatcher` already handles both object and array ticket shapes. That mismatch is the strongest evidence for the platform push failure.
- Admin-closed listings can be reopened because the live owner update policy allows owners to update their listing rows, the edit-lock trigger allows `status` changes, and no trigger protects `closed_by`, `closed_at`, or `closed_reason` from non-admin mutation.
- Deal lifecycle UI can distinguish admin-terminated deals when `termination_source='admin'`, but deal list/detail queries do not select listing closure fields and closed listings may be hidden by RLS, so the app loses "listing closed by Bantle" context.
- Soft-deleted users are masked immediately by `formatDisplayName`, and soft-deleted hosts' closed listings are hidden from counterparties by listing RLS. This explains `DELETED USER` plus `Listing Unavailable` during the recovery window.

## 2. Commands Run

| Repo | Command | Result | Notes |
| --- | --- | --- | --- |
| Mobile/Supabase | `git status --short` | Completed | Existing untracked files only: `CHATGPT_MOBILE_REPO_HANDOFF.md`, recon/audit docs, `builds/`. |
| Mobile/Supabase | `npm run typecheck` | Passed | No typecheck failures. |
| Mobile/Supabase | `npm run lint` | Failed | 39 problems: 12 errors, 27 warnings. Errors are pre-existing lint issues such as `react/no-unescaped-entities` in auth/listing/chat/components files. |
| Mobile/Supabase | `git diff --check` | Passed | No whitespace errors. |
| Mobile/Supabase | `rg -n "closed_by\|closed_at\|closed_reason\|Reopen\|reopen\|terminated_by\|termination_reason\|termination_source\|deleted_at\|deletion\|DELETED USER\|Listing Unavailable\|send_push_notification\|broadcast_push_dispatcher\|milestone_checkin_dispatcher\|account_hard_delete_dispatcher" app components stores lib supabase --glob '!node_modules' \|\| true` | Completed | Located listing reopen, deal lifecycle, account deletion, and Edge Function code paths. |
| Mobile/Supabase | `rg -n "router\\.push\|router\\.replace\|getLastNotificationResponse\|addNotificationResponseReceivedListener" app lib stores \|\| true` | Completed | Reviewed notification navigation paths; no direct finding for this recon. |
| Web/admin | `git status --short` | Completed | Existing changes/untracked files only: `.gitignore`, handoff/audit docs, `database-backups/`. |
| Web/admin | `npm run build` | Passed | Next 14.2.35 build passed. One warning about Edge Runtime disabling static generation for one page. |
| Web/admin | `npm run lint` | Passed | No ESLint warnings or errors. |
| Web/admin | `git diff --check` | Passed | No whitespace errors. |
| Web/admin | `rg -n "closed_by\|closed_at\|closed_reason\|terminated_by\|termination_reason\|termination_source\|send_push_notification\|broadcast_push_dispatcher\|BANTLE_INTERNAL_FUNCTION_SECRET\|Some notifications failed\|Platform activated\|Platform deactivated\|deleted_at\|DELETED USER\|Listing Unavailable" app components lib --glob '!node_modules' \|\| true` | Completed | Located platform toast, internal function helper, admin close/terminate routes, and deleted/listing fallback UI. |
| Supabase MCP | `list_projects`, `list_tables`, targeted SQL on policies, triggers, columns, constraints, admin action summaries, notification aggregates | Completed | Read-only schema/policy/log inspection only. No migrations or writes. |
| Supabase MCP | Edge Function logs for recent calls | Completed | Read-only log inspection. Secrets were not printed in this report. |

## 3. Files and Areas Reviewed

| Area | Files | Coverage | Notes |
| --- | --- | --- | --- |
| Pre-launch/audit context | `BANTLE_PRE_LAUNCH_BUG_TRACKER.md`, `QA_SECURITY_AUDIT_MOBILE.md`, `QA_SECURITY_AUDIT_WEB_ADMIN.md`, `QA_SECURITY_AUDIT_COMBINED_SUMMARY.md`, `DEEP_UNDERSTANDING.md`, `PROJECT_DEEP_UNDERSTANDING.md`, `PROJECT_CONTEXT_FOR_AI.md`, `ADMIN_PANEL_PLAN.md` | Reviewed relevant findings and status language | Tracker already covers Edge Function auth and listing/deal lifecycle classes. |
| Phase docs | `PHASE_5_LISTINGS_IMPLEMENTATION.md`, `PHASE_6_DEALS_IMPLEMENTATION.md`, `PHASE_8_BROADCAST_IMPLEMENTATION.md`, `PHASE_9_DASHBOARD_ANALYTICS.md` | Reviewed implementation intent | Phase 5 says admin force-close removes discovery but leaves deals/chats unchanged. Phase 6 says admin terminate writes termination metadata while leaving unrelated data unchanged. |
| Platform admin UI/API | `bantle-web/app/admin/platforms/PlatformsListClient.tsx`, `bantle-web/app/admin/api/platforms/[id]/route.ts`, `bantle-web/lib/admin-internal-functions.ts` | Reviewed full activate/deactivate notification path | Exact toast and summary interpretation found. |
| Push Edge Functions | `bantle/supabase/functions/send_push_notification/index.ts`, `bantle/supabase/functions/broadcast_push_dispatcher/index.ts`, `bantle/supabase/functions/_shared/internalAuth.ts` | Reviewed auth guard and Expo response handling | Broadcast has safer ticket parsing than send_push. |
| Listing close/reopen | `bantle-web/app/admin/api/listings/[id]/close/route.ts`, `bantle-web/app/admin/listings/[id]/ListingDetailClient.tsx`, `bantle/app/listing/edit/[id].tsx`, listing migrations | Reviewed admin close, mobile reopen, DB fields, RLS, triggers | Confirmed DB and mobile gaps. |
| Deal lifecycle | `bantle/stores/deals.ts`, `bantle/app/(tabs)/deals.tsx`, `bantle/app/deal/[id].tsx`, `bantle/app/chat/[conversationId].tsx`, `bantle-web/app/admin/api/deals/[id]/terminate/route.ts`, notifications UI | Reviewed user cancel, admin terminate, list/detail/chat display | Admin termination metadata exists; listing closure context is not reliably available. |
| Account deletion | `bantle/stores/auth.ts`, `bantle/components/DeleteAccountModal.tsx`, `bantle/app/(auth)/account-recovery.tsx`, `bantle/lib/profile.ts`, `bantle/supabase/functions/account_hard_delete_dispatcher/index.ts`, deletion migrations | Reviewed soft-delete, recovery, hard-delete, display masking | Current behavior masks profile immediately and may hide listing details from counterparties. |
| Database live state | `profiles`, `listings`, `deals`, `notifications`, RLS policies, triggers, constraints | Targeted read-only inspection | No broad PII query was used. Counts/status summaries only. |

## 4. Observation 1 - Platform notification partial failure

### Current flow

1. Admin toggles a platform in `bantle-web/app/admin/platforms/PlatformsListClient.tsx:71-124`.
2. The page receives a response from the platform route and shows:
   - success when no notification or push failures exist
   - `Platform activated. Some notifications failed.` or `Platform deactivated. Some notifications failed.` when `notification_failed_count + push_failure_count > 0` at `bantle-web/app/admin/platforms/PlatformsListClient.tsx:90-99`.
3. The API route updates platform status, inserts persistent notifications, and calls `send_push_notification` from `sendPlatformPushes` in `bantle-web/app/admin/api/platforms/[id]/route.ts:222-299`.
4. Internal auth headers are created in `bantle-web/lib/admin-internal-functions.ts:1-10` and passed to `send_push_notification` at `bantle-web/app/admin/api/platforms/[id]/route.ts:267-277`.
5. `send_push_notification` enforces the new internal guard at `bantle/supabase/functions/send_push_notification/index.ts:126-129`; the shared helper accepts either `x-bantle-internal-secret` or service-role bearer compatibility in `bantle/supabase/functions/_shared/internalAuth.ts:5-24`.

### Exact source of message

`bantle-web/app/admin/platforms/PlatformsListClient.tsx:90-99` calculates `notificationFailures` from the API summary and sets the toast to:

- `Platform activated. Some notifications failed.`
- `Platform deactivated. Some notifications failed.`

The UI combines persistent notification failures and push delivery failures into the same message, so the copy is broader than what happened in the observed case.

### Evidence

- Recent platform admin action summaries showed successful persistent notification inserts:
  - `recipient_count=3`
  - `notification_inserted_count=3`
  - `notification_failed_count=0`
  - `push_success_count=0`
  - `push_skipped_count=2`
  - `push_failure_count=1`
  - warning included `push_failed:no_ticket`
- Notification aggregate checks confirmed rows were created for recent platform events. Persistent in-app notifications were not failing.
- Edge Function logs showed recent `send_push_notification` calls returning HTTP 200. The 401 logs observed nearby matched unauthorized hardening checks, not the platform toggle failure path.
- The route definitely attempts to pass the new internal secret header through `getInternalFunctionHeaders()` and `supabase.functions.invoke(..., { headers: internalHeaders })`.

### Likely root cause

`send_push_notification` likely mishandles Expo's successful ticket response shape for single-message sends.

Evidence:

- `bantle/supabase/functions/send_push_notification/index.ts:116-124` types Expo response `data` as an array only.
- `bantle/supabase/functions/send_push_notification/index.ts:431-448` reads the ticket as `json.data?.[0]`; if that is absent, it returns `{ error: 'no_ticket' }`.
- `bantle/supabase/functions/broadcast_push_dispatcher/index.ts:57-59` and `bantle/supabase/functions/broadcast_push_dispatcher/index.ts:455-472` already handle both `ExpoPushTicket` and `ExpoPushTicket[]`:
  - `Array.isArray(json.data) ? json.data[0] : json.data`
- Live admin action summaries recorded `push_failed:no_ticket`, matching the exact failure branch in `send_push_notification`.

This is not confirmed as an Expo provider failure from static inspection alone because the raw provider response body was not printed. It should still be marked `Needs dynamic staging test` to verify with one known-good Expo token. The code/log/schema evidence is strong enough to make a safe parser fix now.

### Was Bug Fix 1 the cause?

Not based on the available evidence.

Bug Fix 1's internal auth path appears to be working:

- the web route passes the internal header,
- the Edge Function authorizes and returns HTTP 200,
- persistent notification rows are inserted,
- the failure is recorded downstream as `push_failed:no_ticket`.

The hardening likely made this path more visible during smoke testing, but the likely bug is Expo ticket parsing in `send_push_notification`, not missing internal auth.

### Are in-app notifications still created?

Yes. Recent platform action summaries and notification aggregates showed notification rows were created for each recipient. The failure was limited to push delivery/reporting, not persistent in-app notification creation.

### Recommended fix

1. Update `send_push_notification` to parse Expo ticket `data` as either an object or array, matching the already working broadcast dispatcher pattern.
2. Preserve existing handling for Expo ticket `status='error'`.
3. Consider logging a sanitized shape-only provider response on unexpected shapes, without tokens or personal data.
4. Update admin toast copy so persistent notification failures and push failures are distinct:
   - persistent insert failure: `Platform activated, but some in-app notifications failed.`
   - push-only failure: `Platform activated. In-app notifications were sent, but push failed for some users.`
5. Keep broadcast unchanged unless this parser is extracted into a shared helper after tests.

### Required smoke tests

- Admin activates and deactivates a platform with:
  - one valid Expo token,
  - one stale/invalid token,
  - one user with no token.
- Confirm summary separates:
  - notification inserted count,
  - push success,
  - push skipped,
  - push failure.
- Confirm app notification center receives the platform notification even if push fails.
- Confirm unauthorized calls to `send_push_notification` still return 401.
- Confirm broadcast still sends after the `send_push_notification` parser fix.

## 5. Observation 2 - Broadcast works

Broadcast should not be changed for this pass unless new direct evidence appears.

Evidence reviewed:

- User reported broadcast sending works as expected.
- Broadcast dispatcher already has object-or-array Expo ticket parsing in `bantle/supabase/functions/broadcast_push_dispatcher/index.ts:455-472`.
- Broadcast paths were updated to use internal function headers during Bug Fix 1.
- Edge Function logs showed recent broadcast dispatcher calls returning HTTP 200.

Recommendation:

- Leave broadcast behavior unchanged.
- If a shared Expo parser is introduced, keep the broadcast behavior byte-for-byte equivalent from a product perspective and regression-test broadcast separately.

## 6. Observation 3 - Deal cancellation / termination / listing warning context

### Current flow matrix

| Scenario | Current data written | Current mobile display | Gap |
| --- | --- | --- | --- |
| User cancels/declines a deal | `stores/deals.ts:554-598` updates `status`, sets `terminated_at`, inserts a system message with the user as sender | Deal detail infers actor from system messages at `app/deal/[id].tsx:128-172` and shows cancelled/declined copy | No structured `terminated_by`, `termination_reason`, or `termination_source` for user-originated cancellation |
| Admin terminates a deal | `bantle-web/app/admin/api/deals/[id]/terminate/route.ts:101-124` writes `status='cancelled'`, `terminated_at`, `terminated_by`, `termination_reason`, `termination_source='admin'` | Deal list/detail can show `Terminated by Bantle` using `isAdminTerminatedDeal` in `stores/deals.ts:46-50`, `app/(tabs)/deals.tsx:402-484`, and `app/deal/[id].tsx:421-499` | Some chat/list/card surfaces still depend on text parsing or limited embedded deal state |
| Admin closes a listing | `bantle-web/app/admin/api/listings/[id]/close/route.ts:97-110` writes listing `status='closed'`, `closed_reason`, `closed_by`, `closed_at`; only host notification is sent | Admin UI says deals/chats continue unchanged at `bantle-web/app/admin/listings/[id]/ListingDetailClient.tsx:251-260` | Mobile deal list/detail do not select listing closure fields, and closed listings can be hidden by RLS from counterparties |
| Deal on admin-closed listing | Deals remain unchanged by design per Phase 5 docs and admin UI copy | Existing deals may show no Bantle closure warning; if listing relation is hidden/null, fallback is `Listing unavailable` | App lacks enough query data to distinguish "listing unavailable" from "listing closed by Bantle" |

### Data fields available

Deals live schema includes:

- `status`
- `terminated_at`
- `terminated_by`
- `termination_reason`
- `termination_source`

Listings live schema includes:

- `status`
- `closed_reason`
- `closed_by`
- `closed_at`
- `archived_at`

Notifications include kinds:

- `deal_terminated`
- `listing_closed`
- `platform_activated`
- `platform_deactivated`

### Where UI loses context

- Deal list query in `bantle/stores/deals.ts:134-140` embeds listing fields but not `closed_at`, `closed_by`, or `closed_reason`.
- Deal detail query in `bantle/app/deal/[id].tsx:114-120` embeds listing fields but not closure metadata.
- Deal list fallback text at `bantle/app/(tabs)/deals.tsx:248-340` uses `deal.listing?.title ?? 'Listing unavailable'`.
- Deal detail has good admin-termination warning copy at `bantle/app/deal/[id].tsx:480-499`, but no equivalent listing-closed-by-Bantle warning because it does not have the listing closure fields.
- Chat maps admin termination by system-message text at `bantle/app/chat/[conversationId].tsx:491-508`, then handles proposal/event card labels at `bantle/app/chat/[conversationId].tsx:1502-1505`, `bantle/app/chat/[conversationId].tsx:1573-1577`, and `bantle/app/chat/[conversationId].tsx:1879-1891`.
- Admin termination inserts a system message with `kind='deal_cancelled'` and text `Deal terminated by Bantle: ${reason}` at `bantle-web/app/admin/api/deals/[id]/terminate/route.ts:376-390`. The app compensates by text-prefix parsing, but structured event kind would be safer later.

### Current notification copy

- Admin deal termination uses `deal_terminated` notifications in `bantle-web/app/admin/api/deals/[id]/terminate/route.ts:266-347`.
- Listing close notification uses `listing_closed` and targets the host only in `bantle-web/app/admin/api/listings/[id]/close/route.ts:221-309`.
- App notification UI handles `deal_terminated` at `bantle/app/notifications.tsx:362-366` and `bantle/app/notifications.tsx:565-575`.
- App notification UI handles `listing_closed` at `bantle/app/notifications.tsx:422-426` and `bantle/app/notifications.tsx:551-563`.

### Recommended state/copy matrix

| State | Primary label | Supporting copy | Surfaces |
| --- | --- | --- | --- |
| User cancelled | `Cancelled` | `Cancelled by you` or `Cancelled by {counterparty}` when inferable | Deal list, detail, chat event |
| User declined | `Declined` | `Declined by you` or `Declined by {counterparty}` when inferable | Deal list, detail, chat event |
| Admin terminated | `Terminated by Bantle` | Show `termination_reason` when present | Deal list, detail, chat banner/event, notifications |
| Listing admin-closed but deal not terminated | `Listing closed by Bantle` | Show listing closure reason if Syed approves exposing it to deal counterparties | Deal detail, listing detail existing deals section, possibly deal list badge |
| Listing unavailable for privacy/deletion reasons | `Listing unavailable` or more specific recovery copy | Needs Syed decision, especially during 7-day account recovery | Deal list/detail/chat |

### Required mobile changes

- Extend deal list/detail data model to carry listing closure metadata, but only after deciding whether current RLS should expose those fields to deal counterparties.
- Add lifecycle warning component shared by deal list/detail/chat where possible.
- Stop relying on admin system-message text prefixes long term; use structured event kinds or deal termination metadata when available.
- Add tests for user cancellation, admin termination, and deal-on-admin-closed-listing display.

### Required web/admin changes

- No required change for admin deal termination data writes; the route already writes structured metadata.
- Optional: insert a more specific system message kind for admin termination in the future instead of overloading `deal_cancelled`.
- Optional: when closing listing, decide whether to add participant-facing deal warnings or notifications for existing active/pending deals.

### DB changes

Needs Syed decision.

Options:

1. No DB change: only show listing closure warning to the listing owner, because only the owner can reliably read closed listing metadata under current RLS.
2. Add a security-definer RPC/view that exposes limited listing closure fields to active/past deal participants.
3. Denormalize closure metadata onto affected deals when an admin closes a listing.
4. If admin close should terminate active/pending deals, mutate deals in the admin close route and write `termination_source='listing_admin_close'` or a similar explicit source.

## 7. Observation 4 - Admin-closed listing can be reopened

### Root cause

The bypass is confirmed.

Evidence:

- Admin close route stamps closure metadata in `bantle-web/app/admin/api/listings/[id]/close/route.ts:97-110`:
  - `status='closed'`
  - `closed_reason`
  - `closed_by`
  - `closed_at`
- Mobile edit screen allows reopening any closed, non-archived listing at `bantle/app/listing/edit/[id].tsx:217-247` by calling:
  - `.update({ status: 'active' })`
- Mobile UI renders Reopen for any non-active, non-archived listing at `bantle/app/listing/edit/[id].tsx:454-520`.
- Live RLS policy `listings_update_own` allows owners to update their own listing:
  - `USING (auth.uid() = user_id)`
  - `WITH CHECK (auth.uid() = user_id)`
- `bantle/supabase/migrations/20260507190000_phase_9_fix_listing_edit_lock.sql:14-23` explicitly treats status as editable, and the trigger at `bantle/supabase/migrations/20260507190000_phase_9_fix_listing_edit_lock.sql:43-86` locks only selected content fields when commitments exist. It does not block `closed -> active`.
- `bantle/supabase/migrations/20260523091059_phase_5_listing_close_admin_fields.sql:15-43` adds and documents admin closure metadata but does not add immutability or reopen protection.

### DB/RLS/trigger gap

The live database distinguishes admin/Bantle closure from a generic closed listing through nullable fields:

- `closed_by`
- `closed_at`
- `closed_reason`

However, non-admin clients can currently update the row through the broad owner update policy. There is no live trigger preventing an owner from:

- changing `status` from `closed` to `active` when `closed_by` or `closed_at` is set,
- clearing or altering `closed_reason`,
- clearing or altering `closed_by`,
- clearing or altering `closed_at`.

RLS alone is not enough unless it also prevents closed metadata clearing. A `WITH CHECK` such as "active rows must not have `closed_at`" can be bypassed if the same owner update also clears `closed_at`, unless a trigger protects those columns.

### Recommended DB-level protection

Migration required.

Add or extend a `BEFORE UPDATE` trigger on `public.listings` that applies to non-service-role client updates:

- If `OLD.closed_by IS NOT NULL OR OLD.closed_at IS NOT NULL`, reject transitions to `status='active'` unless the request is service-role/admin-controlled.
- Reject any non-admin mutation of `closed_by`, `closed_at`, or `closed_reason`.
- Preserve self-closed listing reopen if the row has no admin closure metadata and product wants self-closed listings to stay reopenable.
- Consider naming the trigger separately from the edit-lock trigger to make intent auditable, or extend the existing trigger with clear tests.

Recommended error wording:

- `Listings closed by Bantle cannot be reopened by the owner.`

### Recommended mobile UI update

- Select `closed_by`, `closed_at`, and `closed_reason` where My Listings/edit screens load owned listings.
- Hide or disable Reopen when `closed_by` or `closed_at` exists.
- Show a Bantle/admin closure panel with the closure reason if present.
- Provide a support/report path only if Syed wants an appeal flow now; otherwise simple explanatory copy is enough.
- Keep Reopen for self-closed listings if no admin closure metadata exists.

### Admin UI update

- No required change to make protection work.
- Optional: admin listing detail could show a clearer "Owner cannot reopen this listing" note after DB protection ships.

### Tests needed

- SQL/RLS test: owner can reopen self-closed listing with no `closed_by`/`closed_at`.
- SQL/RLS test: owner cannot reopen admin-closed listing.
- SQL/RLS test: owner cannot clear or modify `closed_reason`, `closed_by`, or `closed_at`.
- Admin route test: service-role/admin close still works.
- Mobile smoke: admin-closed listing does not show Reopen and displays reason.
- Mobile smoke: self-closed listing still shows Reopen if desired.
- Discovery smoke: admin-closed listing remains hidden from discovery.

## 8. Observation 5 - Soft-deleted account display in deals

### Current flow

When a user deletes their account from the app:

1. `bantle/components/DeleteAccountModal.tsx:86-118` presents 7-day recovery copy and explains that active listings close, pending proposals cancel, and completed/active deals, chats, and ratings remain visible.
2. `bantle/stores/auth.ts:538-558` clears the push token, updates `profiles.deleted_at=now()`, and signs out.
3. Profile triggers handle related inventory/deal state:
   - `bantle/supabase/migrations/20260507160000_phase_9_account_deletion.sql:105-125` closes active listings on soft delete.
   - `bantle/supabase/migrations/20260507180000_phase_9_fix_inventory_softdelete_v2.sql:55-110` cancels pending deals and marks active deals with `terminated_at` to release slots while keeping active deal status.
4. Recovery is available in `bantle/app/(auth)/account-recovery.tsx:7-10`, `bantle/app/(auth)/account-recovery.tsx:21-60`, and `bantle/app/(auth)/account-recovery.tsx:81-155`. Restore clears `deleted_at`; it does not reopen listings or restore prior deal state.
5. Admin restore route at `bantle-web/app/admin/api/users/[id]/restore/route.ts:72-95` can also clear `deleted_at`. Admin modal copy in `bantle-web/components/admin/UserActionModal.tsx:56-65` says listings remain in their current state.
6. Hard-delete dispatcher selects profiles older than 7 days in `bantle/supabase/functions/account_hard_delete_dispatcher/index.ts:61-72` and calls admin delete in `bantle/supabase/functions/account_hard_delete_dispatcher/index.ts:124-148`.

### Why `DELETED USER` appears

`bantle/lib/profile.ts:23-37` masks any profile with `deleted_at` set:

- null profile -> `Deleted user`
- missing display name -> `Deleted user`
- soft-deleted profile -> `Deleted user`

Deal list/detail queries embed `public_profiles` with `deleted_at`, for example:

- `bantle/stores/deals.ts:137-140`
- `bantle/app/deal/[id].tsx:117-120`

So during the 7-day recovery period, counterparties see the deleted-account label immediately.

### Why `Listing Unavailable` appears

Deal list card copy falls back to unavailable when the embedded listing relation is null:

- `bantle/app/(tabs)/deals.tsx:248-340` uses `deal.listing?.title ?? 'Listing unavailable'`.

The listing relation can be null or hidden because:

- soft delete closes the user's active listings,
- listing RLS allows public/member reads mainly for active listings with non-deleted hosts, or own listings,
- counterparties are not necessarily the listing owner,
- the deal queries embed `listings` directly instead of using a participant-authorized deal-history view/RPC.

This explains the observed combination: soft-deleted profile is masked, and the closed listing is hidden from the other participant.

### 7-day recovery behavior

Confirmed current behavior:

- `profiles.deleted_at` exists live.
- No live `deletion_scheduled_at` column was found.
- Soft-deleted users are immediately masked in app display helpers.
- Listings are closed on soft delete.
- Pending deals are cancelled by trigger.
- Active deals are not simply deleted, but trigger behavior sets `terminated_at` to release slots.
- Recovery clears `deleted_at`, but docs/UI indicate listings remain closed and proposals are not restored.

Needs Syed decision:

- Whether counterparties should see the original display name during recovery.
- Whether counterparties should see original listing title/details during recovery.
- Whether active deals should remain active, become locked, or be cancelled when deletion starts.

### Hard-delete data constraint risk

Live FK inspection found:

- `deals.host_id` and `deals.buyer_id` are `ON DELETE SET NULL`.
- `deals.conversation_id` is `ON DELETE SET NULL`.
- `deals.listing_id` is `ON DELETE CASCADE`.

This conflicts with the product idea that deal history always survives hard delete when the deleted user owned the listing. If hard-deleting the host profile cascades to listings, deals tied to those listings may be cascade-deleted through `deals_listing_id_fkey`. If the deleted user was only the buyer, deal rows can survive with `buyer_id=NULL`.

This needs an explicit product/data decision before implementation.

### Privacy/product tradeoffs

| Option | Behavior | Pros | Cons | Migration needed? |
| --- | --- | --- | --- | --- |
| A. Keep masking, improve labels | Show `Account pending deletion` during 7 days and keep listing unavailable unless currently readable | Strong privacy posture; small app change | Counterparties lose operational context | No or minimal |
| B. Show original display name during recovery | Soft-deleted profile remains named until hard delete | Best continuity during recovery | More personal data exposure after deletion request | Maybe no DB change, but policy decision required |
| C. Add deal/listing snapshots | Store listing title/platform and participant display snapshots on deal creation | Preserves deal terms after soft/hard delete; avoids live profile/listing reads | Migration/backfill complexity; snapshot privacy rules required | Yes |
| D. Add participant-authorized deal-history RPC/view | Let deal participants read limited listing fields even when listing is closed/host soft-deleted | Accurate current data with controlled field list | More RLS/security surface | Yes |
| E. Cancel or lock active deals on deletion start | Clear operational state and prevent confusing active deals | Simpler lifecycle | May surprise counterparties; must define refunds/disputes/chat behavior | Likely yes |

### Recommended implementation options

Safest staged approach:

1. Product decision first on recovery-window visibility and active-deal behavior.
2. Short-term UI improvement:
   - distinguish `Account pending deletion` from fully hard-deleted/unknown user if Syed approves,
   - replace generic `Listing unavailable` with contextual copy only when the app has reliable reason data.
3. Data model improvement:
   - add deal/listing snapshot fields if deal history must survive hard delete and remain understandable.
4. Constraint review:
   - change `deals.listing_id` hard-delete behavior to `SET NULL` only if snapshots exist or nullable listing history is acceptable.

### Tests needed

- Soft-delete host with active listing and active/pending/completed deals.
- Confirm counterparty deal list/detail copy during recovery.
- Restore user within 7 days and confirm expected profile/listing/deal state.
- Hard-delete after 7 days in staging and confirm whether host-owned deal rows survive or are intentionally removed.
- Confirm chat visibility rules after soft and hard delete.
- Confirm admin restore copy matches actual restore behavior.

## 9. Report actions and user ban

No action is recommended for report actions or admin user ban in this recon.

Evidence:

- Syed reported both are working as expected.
- The targeted searches and related admin route review did not surface a direct regression tied to Bug Fix 1 or the current smoke findings.

Recommendation:

- Leave both areas unchanged.
- Do not expand the implementation scope unless a new failing smoke test or code/log finding appears.

## 10. Tracker Update Recommendations

Do not update `BANTLE_PRE_LAUNCH_BUG_TRACKER.md` as part of this recon. Recommended later updates:

| Tracker item | Recommended status/update |
| --- | --- |
| `BANTLE-SEC-001` Edge Function privileged auth | Keep `SHIPPED`, not `VERIFIED`, until Syed marks final verification. Add note that unauthorized calls returned 401 and current platform partial failure does not appear to be internal-auth failure. |
| `BANTLE-DATA-002` Owner can reopen admin-closed listings | Keep open / `NOT_STARTED`; mark smoke-confirmed after Bug Fix 1. Severity remains high/P0. |
| `BANTLE-DATA-003` Deal/admin lifecycle metadata integrity | Keep open / `NOT_STARTED`; include admin termination vs user cancellation vs listing closure UI/context gaps. |
| New proposed `BANTLE-PUSH-019` | Platform/direct push partial failure: `send_push_notification` treats likely single Expo ticket object as `no_ticket`; in-app rows still insert. |
| New proposed `BANTLE-UX-020` | Deal lifecycle context: app lacks reliable warnings for deals affected by admin-closed listings and mixes cancellation/termination context on some surfaces. |
| New proposed `BANTLE-PRIV-021` | Soft-deleted account deal display: recovery-window users show as deleted and listing details can disappear for counterparties; product/data decision required. |
| Broadcast | No new tracker row recommended. |
| Report actions / user ban | No new tracker row recommended. |

## 11. Prioritized Implementation Plan

### Pass 1. Platform notification failure if real regression

- Scope:
  - Fix `send_push_notification` Expo ticket parsing.
  - Improve admin platform toast wording for push-only partial failure.
- Files likely changed:
  - `bantle/supabase/functions/send_push_notification/index.ts`
  - `bantle-web/app/admin/platforms/PlatformsListClient.tsx`
  - Optional shared test/helper files if the project already has Edge Function tests.
- Migration needed: No.
- Smoke tests:
  - valid token, stale token, no token;
  - platform activate/deactivate;
  - notification rows still inserted;
  - unauthorized call still 401;
  - broadcast still works.
- Regression risks:
  - Misclassifying Expo ticket errors as success.
  - Accidentally changing broadcast behavior if shared code is introduced.

### Pass 2. Admin-closed listing reopen protection

- Scope:
  - Add DB trigger protection for admin closure metadata and `closed -> active` transition.
  - Update mobile listing edit/My Listings UI to hide or disable Reopen for admin-closed listings.
- Files likely changed:
  - new Supabase migration under `bantle/supabase/migrations/`
  - `bantle/app/listing/edit/[id].tsx`
  - likely My Listings/listing data query files if they do not select closure metadata.
- Migration needed: Yes.
- Smoke tests:
  - owner cannot reopen admin-closed listing;
  - owner cannot clear closure metadata;
  - admin close still works;
  - self-closed listing remains reopenable if desired;
  - discovery remains filtered.
- Regression risks:
  - Blocking legitimate admin route updates if trigger does not correctly identify service-role/admin path.
  - Accidentally blocking self-closed listing reopen.

### Pass 3. Deal lifecycle/context UI

- Scope:
  - Add clear user-cancelled vs admin-terminated vs listing-closed warnings.
  - Decide whether listing closure metadata should be exposed to deal participants.
- Files likely changed:
  - `bantle/stores/deals.ts`
  - `bantle/app/(tabs)/deals.tsx`
  - `bantle/app/deal/[id].tsx`
  - `bantle/app/chat/[conversationId].tsx`
  - optional web/admin route changes if listing close should write deal events.
- Migration needed:
  - No if only using existing visible data.
  - Yes if adding participant-authorized RPC/view, deal denormalization, or new lifecycle source enum values.
- Smoke tests:
  - user cancels;
  - admin terminates;
  - admin closes listing with active/pending deals;
  - each participant sees intended label/copy.
- Regression risks:
  - Revealing closure reasons to users who should not see them.
  - Confusing cancelled and terminated states because admin termination currently stores `status='cancelled'`.

### Pass 4. Soft-deleted account deal display

- Scope:
  - Implement Syed's chosen 7-day recovery display behavior.
  - Decide whether deal/listing details should be snapshot-backed or RPC-backed.
  - Review hard-delete FK behavior if deal history must survive.
- Files likely changed:
  - `bantle/lib/profile.ts`
  - `bantle/stores/deals.ts`
  - `bantle/app/(tabs)/deals.tsx`
  - `bantle/app/deal/[id].tsx`
  - `bantle/app/chat/[conversationId].tsx`
  - account deletion/recovery copy if product behavior changes
  - Supabase migration if adding snapshots/RPC/FK changes.
- Migration needed:
  - No for label-only changes.
  - Yes for snapshots, participant-authorized views/RPCs, or FK changes.
- Smoke tests:
  - delete account as host and buyer;
  - verify counterparty display during recovery;
  - restore within 7 days;
  - hard-delete in staging;
  - verify deal/chat/listing history behavior.
- Regression risks:
  - Privacy regression by exposing deleted user's profile/listing data.
  - Data loss if hard-delete cascade is not aligned with desired deal history.

### Pass 5. Tracker/doc updates

- Scope:
  - Update tracker statuses after implementation and Syed verification.
  - Add new rows for platform push parser, deal lifecycle context, and soft-delete display if accepted.
- Files likely changed:
  - `BANTLE_PRE_LAUNCH_BUG_TRACKER.md`
  - optional QA audit notes.
- Migration needed: No.
- Smoke tests: Not applicable beyond ensuring docs match shipped behavior.
- Regression risks:
  - Marking items verified before Syed validates production smoke.

## 12. Questions for Syed

1. During the 7-day account recovery period, should other deal participants see the deleted user's original display name, or a label like `Account pending deletion`?
2. During the 7-day recovery period, should listing/deal details remain visible to counterparties even if the listing owner requested account deletion?
3. Should account deletion automatically cancel or lock active deals, or should active deals remain visible/active until hard delete or manual action?
4. Should an admin-closed listing automatically terminate active/pending deals, or only block discovery/reopen and show warnings while deals continue?
5. What exact user-facing copy should show for Bantle/admin-closed listings, especially when a reason exists?
6. After hard delete, must host-owned deal history survive? Current live constraints can cascade-delete deals through `deals.listing_id` when the deleted host's listings are deleted.

## 13. Recommended Next Codex Prompt Inputs

For the implementation-planning prompt, give ChatGPT these confirmed inputs:

- Platform failure evidence:
  - toast source: `bantle-web/app/admin/platforms/PlatformsListClient.tsx:90-99`;
  - platform route push path: `bantle-web/app/admin/api/platforms/[id]/route.ts:222-299`;
  - internal header helper: `bantle-web/lib/admin-internal-functions.ts:1-10`;
  - auth guard: `bantle/supabase/functions/_shared/internalAuth.ts:5-24`;
  - likely parser bug: `bantle/supabase/functions/send_push_notification/index.ts:431-448`;
  - working parser reference: `bantle/supabase/functions/broadcast_push_dispatcher/index.ts:455-472`;
  - read-only live evidence: persistent notifications inserted; push warning `push_failed:no_ticket`; Edge Function returned HTTP 200.
- Admin reopen evidence:
  - admin close route stamps closure metadata at `bantle-web/app/admin/api/listings/[id]/close/route.ts:97-110`;
  - mobile Reopen updates only `status='active'` at `bantle/app/listing/edit/[id].tsx:217-247`;
  - mobile Reopen UI is shown broadly at `bantle/app/listing/edit/[id].tsx:454-520`;
  - live RLS owner update is broad;
  - edit-lock trigger does not protect closure metadata or status reopen.
- Deal lifecycle evidence:
  - admin termination metadata writes at `bantle-web/app/admin/api/deals/[id]/terminate/route.ts:101-124`;
  - app admin termination helper at `bantle/stores/deals.ts:46-50`;
  - deal list/detail already show admin termination in some places;
  - listing closure fields are not selected in deal queries and may be hidden by RLS.
- Account deletion evidence:
  - app soft delete writes `profiles.deleted_at` at `bantle/stores/auth.ts:538-558`;
  - recovery clears `deleted_at` only;
  - `formatDisplayName` masks soft-deleted profiles at `bantle/lib/profile.ts:23-37`;
  - soft-delete triggers close listings and alter pending/active deals;
  - live `deals.listing_id` is `ON DELETE CASCADE`.
- Decisions needed before implementation:
  - recovery-window profile label;
  - recovery-window listing/deal detail visibility;
  - active deal behavior on account deletion;
  - admin-close deal behavior;
  - exact admin-closed listing copy;
  - whether hard-deleted host-owned deal history must survive.

