# Platform deactivation / activation reconnaissance

Generated at: 2026-05-22 23:24:38 IST

Repos inspected:
- Mobile: `/Users/syedejazahammed/Documents/GitHub/bantle` (`main`, `e6af519 Add Supabase backup workflow and deep understanding doc`)
- Web/admin: `/Users/syedejazahammed/Documents/GitHub/bantle-web` (`main`, `d6fa8b1 docs: add deep project understanding`)

Working tree notes:
- Mobile had untracked `CHATGPT_MOBILE_REPO_HANDOFF.md` and `PROJECT_CONTEXT.md` before this recon.
- Web/admin had modified `.gitignore` plus untracked `CHATGPT_WEB_REPO_HANDOFF.md`, `PROJECT_CONTEXT_FOR_AI.md`, and `database-backups/` before this recon.

## 1. Current behavior confirmed from code

Mobile platform catalog:
- Mobile maps `platforms` rows into `PlatformDef`, including `isActive: row.is_active ?? true`, in `bantle/stores/platforms.ts:19-32`.
- Mobile fetches **all** platforms, not only active platforms. The comment explicitly says `.eq('is_active', true)` was removed so deactivated platform listings keep real tiles; the query is `.from('platforms').select('*')` ordered by `display_order` in `bantle/stores/platforms.ts:49-56`.
- The platform store has `fetch()` and `refresh()` only. It does not subscribe to `platforms` realtime updates in `bantle/stores/platforms.ts:35-78`.
- Auth primes the platform cache on cold session and sign-in via `primePlatformsCache()` in `bantle/stores/auth.ts:44-50`, called at `bantle/stores/auth.ts:327-329` and `bantle/stores/auth.ts:441-442`.
- The Home tab also primes the platform cache idempotently in `bantle/app/(tabs)/index.tsx:441-447`.
- Current Supabase realtime publication migrations include `notifications`, `deals`, `conversations`, and `messages`, but no `platforms`, per `bantle/supabase/migrations/20260507120000_phase_8a_ratings_verification_notifications.sql:114`, `bantle/supabase/migrations/20260506202308_phase_6a_deals_extensions.sql:50`, and `bantle/supabase/migrations/20260506202307_remote_schema.sql:895-896`.

Picker behavior:
- The mobile post-listing picker filters active platforms locally with `s.platforms.filter((p) => p.isActive)` in `bantle/app/(tabs)/post-listing.tsx:58-65`.
- The picker then filters the already-active list by selected category in `bantle/app/(tabs)/post-listing.tsx:98-102`.
- New listing creation inserts `platform: platform.id`, `title: platform.label`, and `status: 'active'` in `bantle/app/(tabs)/post-listing.tsx:152-166`.
- The picker UI renders only `platformsForCategory` in `bantle/app/(tabs)/post-listing.tsx:395-430`.
- Existing open sessions will not see a platform toggle immediately unless something calls `refresh()` or the app cold-starts/signs in again.

Home feed behavior:
- Home reads from `listings_with_availability`, which exposes derived `slots_available`, according to `bantle/app/(tabs)/index.tsx:76-100`.
- The Home query filters `status = active`, `slots_available > 0`, and `user_id != current user` in `bantle/app/(tabs)/index.tsx:288-300`.
- Home category/search/date/sort filters do not join or filter `platforms.is_active`; search matches `title` or `platform` string only in `bantle/app/(tabs)/index.tsx:324-347`.
- Home applies client-side block/hidden-listing filters only in `bantle/app/(tabs)/index.tsx:225-236`.
- Home cards render `PlatformTile platform={listing.platform}` in `bantle/app/(tabs)/index.tsx:1054-1062`.
- Therefore, active/home-feed listings for a deactivated platform currently remain discoverable in Home.

Platform rendering on non-picker surfaces:
- `PlatformTile` uses the platform store and `findPlatform()` at render time in `bantle/components/ui/PlatformTile.tsx:46-50`.
- `PlatformTile` renders brand color/initials only and does not expose `def.isActive` or any discontinued badge in `bantle/components/ui/PlatformTile.tsx:84-93`.
- `PlatformTile` has a deterministic fallback for unmatched slugs in `bantle/components/ui/PlatformTile.tsx:65-82`.
- `findPlatform()` is tolerant by slug/label and does not filter `isActive` in `bantle/lib/platforms.ts:56-82`.
- Listing detail loads one row from `listings_with_availability` and renders `PlatformTile` in `bantle/app/listing/[id].tsx:73-82` and `bantle/app/listing/[id].tsx:222-224`; it does not know platform active status.
- Saved listings embed `listings_with_availability` in `bantle/stores/saved.ts:54-68` and render `PlatformTile` in `bantle/app/saved.tsx:176-182`; inactive/closed UI is based on listing `status` or `slots_available`, not platform state, in `bantle/app/saved.tsx:166-169`.
- Hidden listings fetch `listings_with_availability` rows in `bantle/stores/hidden_listings.ts:125-131` and render `PlatformTile` in `bantle/app/hidden-listings.tsx:201-210`.
- My Listings loads `listings_with_availability` for the current user in `bantle/app/my-listings.tsx:59-69` and renders `PlatformTile` in `bantle/app/my-listings.tsx:311-321`; its pill is `Active`/`Closed`, not platform-aware, in `bantle/app/my-listings.tsx:329-332`.
- Listing edit currently uses an active-only platform selector, then `findPlatform()` against that active-only list in `bantle/app/listing/edit/[id].tsx:118-125`. That means an inactive platform may not resolve to a rich `platformDef` on the edit surface even though the store contains all platforms.

Deal/chat surfaces:
- Deals store joins `listing:listings(id, title, platform, monthly_price, duration_months)` for deal loads in `bantle/stores/deals.ts:128-134`, `bantle/stores/deals.ts:201-212`, and `bantle/stores/deals.ts:293-304`. It does not join `platforms`.
- Deals tab renders `PlatformTile` from `deal.listing?.platform` in `bantle/app/(tabs)/deals.tsx:273-288`.
- Deal detail joins base `listings`, not `platforms`, in `bantle/app/deal/[id].tsx:112-121` and renders `PlatformTile` in `bantle/app/deal/[id].tsx:334-338`.
- Chat detail joins base `listings(id, title, platform, monthly_price, duration_months)` in `bantle/app/chat/[conversationId].tsx:323-345`.
- Chat header currently shows listing title and price, not platform status, in `bantle/app/chat/[conversationId].tsx:798-805`.
- Chat deal proposal cards render `PlatformTile` using `deal.listing?.platform ?? fallbackPlatform` in `bantle/app/chat/[conversationId].tsx:1482-1501`.
- Chat list and archived chat list manually resolve platform def from the store but only use color/initials, not `isActive`, in `bantle/app/(tabs)/chat.tsx:205-209`, `bantle/app/(tabs)/chat.tsx:265-273`, `bantle/app/chat/archived.tsx:130-134`, and `bantle/app/chat/archived.tsx:165-173`.
- Rating/check-in surfaces also show deal platform: `bantle/components/CheckInModal.tsx:96-102`, `bantle/components/CheckInModal.tsx:257-260`, `bantle/app/rate/[dealId].tsx:129-156`, and `bantle/app/rate/[dealId].tsx:296-300`.

## 2. Current admin activation/deactivation flow

Admin platform page/UI:
- `/admin/platforms` is a server page rendering `PlatformsListClient` in `bantle-web/app/admin/platforms/page.tsx:9-27`.
- The page copy says deactivation hides the platform from the picker and existing listings keep working in `bantle-web/app/admin/platforms/page.tsx:18-22`.
- The client fetches `/admin/api/platforms`, stores returned rows, and displays grouped platforms in `bantle-web/app/admin/platforms/PlatformsListClient.tsx:29-50` and `bantle-web/app/admin/platforms/PlatformsListClient.tsx:104-162`.
- Toggle computes `next = !(platform.is_active !== false)`, PATCHes `{ is_active: next }`, shows a toast, then refetches platforms in `bantle-web/app/admin/platforms/PlatformsListClient.tsx:64-85`.
- `PlatformRow` treats `is_active !== false` as active, dims inactive rows, and switches button text between `Deactivate` and `Activate` in `bantle-web/components/admin/PlatformRow.tsx:33-56` and `bantle-web/components/admin/PlatformRow.tsx:110-127`.

API behavior:
- `GET /admin/api/platforms` uses `requireAdmin()` and a service-role client, selects all platforms including `is_active`, and computes listing counts by `listings.platform = platform.id` in `bantle-web/app/admin/api/platforms/route.ts:16-53`.
- `POST /admin/api/platforms` creates new platforms with `is_active: true` in `bantle-web/app/admin/api/platforms/route.ts:136-149` and logs `platform_created` in `bantle-web/app/admin/api/platforms/route.ts:166-172`.
- `PATCH /admin/api/platforms/[id]` is the only activation/deactivation route. It accepts `is_active` in the request body and copies it into `updates` in `bantle-web/app/admin/api/platforms/[id]/route.ts:101-103`.
- The PATCH route currently fetches only `id` as baseline in `bantle-web/app/admin/api/platforms/[id]/route.ts:33-39`; it does **not** fetch previous `is_active`, so it cannot detect activation vs deactivation or no-op toggles.
- The PATCH route writes `platforms` with `.update(updates).eq("id", platformId)` in `bantle-web/app/admin/api/platforms/[id]/route.ts:122-127`.
- The PATCH route logs `platform_updated` with `{ changes: updates }` in `bantle-web/app/admin/api/platforms/[id]/route.ts:137-146`.
- The PATCH route imports only admin auth and admin action logging in `bantle-web/app/admin/api/platforms/[id]/route.ts:8-10`. It does not import `sendAdminPush`, does not insert `notifications`, and does not call an Edge Function.

Admin auth/service-role model:
- `requireAdmin()` verifies the cookie-authenticated user, checks `profiles.is_admin`, then returns a service-role Supabase client in `bantle-web/lib/admin-auth.ts:26-64`.
- The service-role client reads `NEXT_PUBLIC_SUPABASE_URL` and private `SUPABASE_SERVICE_ROLE_KEY` and has a browser-context guard in `bantle-web/lib/admin-supabase-server.ts:1-43`.
- `logAdminAction()` inserts into `admin_actions` and intentionally swallows audit-log failures after logging in `bantle-web/lib/admin-actions.ts:36-54`.

Existing admin notification pattern:
- Moderation report actions send push via `sendAdminPush()` and insert `notifications` rows in `bantle-web/app/admin/api/reports/[id]/resolve/route.ts:98-129`, `bantle-web/app/admin/api/reports/[id]/resolve/route.ts:159-188`, and `bantle-web/app/admin/api/reports/[id]/resolve/route.ts:222-245`.
- Direct user ban actions follow the same push plus persistent notification pattern in `bantle-web/app/admin/api/users/[id]/ban/route.ts:93-118` and `bantle-web/app/admin/api/users/[id]/ban/route.ts:156-178`.
- Platform toggles do not currently follow that pattern.

## 3. Database constraints and notification compatibility

Platforms schema:
- Initial `platforms` columns are `id`, `label`, `category`, `default_monthly_price`, `brand_color`, `brand_initials`, `is_active`, `display_order`, and `created_at` in `bantle/supabase/migrations/20260506202307_remote_schema.sql:182-193`.
- Generated mobile types confirm those current columns and no `updated_at`, `deleted_at`, `deactivated_at`, `deactivated_by`, or similar fields in `bantle/types/database.ts:558-592`.
- `platforms` has `Relationships: []` in `bantle/types/database.ts:590-592`.
- Current RLS allows authenticated users to select all platforms after Phase 4.1a in `bantle/supabase/migrations/20260515185809_phase_4_1a_platforms_rls.sql:17-22`.

Listings/platform relationship:
- `listings.platform` is `text NOT NULL` in `bantle/supabase/migrations/20260506202307_remote_schema.sql:147-160`.
- Generated `listings` types show `platform: string` in `bantle/types/database.ts:381-410`.
- Generated `listings` relationships include only `listings_user_id_fkey` to `profiles`/`public_profiles`, not `platforms`, in `bantle/types/database.ts:427-442`.
- Migration FKs show `deals` and `conversations` reference `listings`, and `listings` references `profiles`, with no FK from `listings.platform` to `platforms.id`, in `bantle/supabase/migrations/20260506202307_remote_schema.sql:410-458`.

Views/RLS:
- `listings_with_availability` currently selects listing columns, `listing_slots_available(l.id)`, and host rating aggregates; it does not join `platforms` or expose `platform_is_active` in `bantle/supabase/migrations/20260513150000_phase11_rls_hardening.sql:439-458`.
- Generated view type also lacks `platform_is_active` in `bantle/types/database.ts:1036-1070`.
- Listing SELECT RLS allows active listings whose host is not soft-deleted, plus own listings, but does not check platform status in `bantle/supabase/migrations/20260513150000_phase11_rls_hardening.sql:297-311`.

Notifications:
- `notifications.kind` was created with a CHECK constraint for verification/rating/milestone/deal kinds in `bantle/supabase/migrations/20260507120000_phase_8a_ratings_verification_notifications.sql:83-95`.
- The latest kind CHECK migration allows:
  `verification_earned`, `verification_lost`, `rating_received`, `milestone_check_in`, `deal_proposed`, `deal_accepted`, `deal_completed`, `moderation_warning`, `moderation_ban_temp`, `moderation_ban_perm`
  in `bantle/supabase/migrations/20260515154214_phase_2_3_notifications_kind.sql:16-31`.
- Mobile `NotificationKind` mirrors those values and does not include platform status kinds in `bantle/stores/notifications.ts:11-21`.
- Generated database types leave `notifications.kind` as `string`, not a narrowed union, in `bantle/types/database.ts:516-540`.
- Adding `platform_deactivated` and `platform_activated` requires:
  - DB CHECK migration and rollback.
  - Mobile `NotificationKind` update in `bantle/stores/notifications.ts`.
  - Mobile notification icon/copy/press handling updates in `bantle/app/notifications.tsx:210-425`.
  - Push payload routing updates in `bantle/app/_layout.tsx:111-139`.
  - Edge/direct push sender support.
  - Mobile generated `types/database.ts` regeneration if the view/RPC/type surface changes, even though notification kind remains `string` there.

Push sender compatibility:
- Mobile registers Android channels for `messages`, `deals_v2`, `milestones`, and `moderation` in `bantle/lib/push.ts:260-300`.
- `send_push_notification` has a closed `PushKind` union for `message`, deal states, and `milestone` only in `bantle/supabase/functions/send_push_notification/index.ts:32-39`.
- Its direct mode accepts `{ recipient_id, kind, data }` in `bantle/supabase/functions/send_push_notification/index.ts:3-13` and `bantle/supabase/functions/send_push_notification/index.ts:112-120`.
- It builds copy only for current message/deal/milestone kinds in `bantle/supabase/functions/send_push_notification/index.ts:422-465`.
- It maps channels only to `messages`, `deals_v2`, and `milestones` in `bantle/supabase/functions/send_push_notification/index.ts:468-472`.
- It does useful stale-token cleanup on `DeviceNotRegistered` in `bantle/supabase/functions/send_push_notification/index.ts:399-419`.
- Web `sendAdminPush()` can directly call Expo with arbitrary title/body/data in `bantle-web/lib/admin-push.ts:24-60`, but it is currently documented and configured for admin moderation pushes, always uses the `moderation` channel, and does not clear stale Expo tokens in `bantle-web/lib/admin-push.ts:1-8` and `bantle-web/lib/admin-push.ts:42-60`.

## 4. Who should be notified?

Recipient sets from schema/code:
- Hosts with active, unarchived listings for that platform are the strongest transactional recipients. Their listings are the ones that stop/start being discoverable. Query source: `listings.platform`, `listings.status`, `listings.archived_at`, and `listings.user_id` from `bantle/types/database.ts:381-410`.
- Buyers/hosts with active or pending deals for listings on that platform are also transactional recipients on deactivation. Deals join listings by `deals.listing_id`, and participant ids live on `deals.host_id`/`deals.buyer_id` in `bantle/types/database.ts:239-332`.
- Users who saved listings for that platform can be found via `saved_listings.listing_id` and `listings.platform`; schema is in `bantle/types/database.ts:778-824`.
- All users should not be notified. `ADMIN_PANEL_PLAN.md` permanently excludes re-engagement pushes and keeps only transactional/functional/commitment/incident pushes in `bantle-web/ADMIN_PANEL_PLAN.md:53-70`.

Recommendation:
- Deactivation:
  - Notify each host who has at least one `status = 'active'`, `archived_at IS NULL` listing on the platform.
  - Notify each host/buyer participant in a `pending` or `active` deal for a listing on the platform, with `terminated_at IS NULL` as a defensive guard.
  - Deduplicate recipients across host/deal buckets and write one notification row per user per platform transition, not one per listing/deal.
  - Do **not** notify saved-only users by default. Saved-only notification reads like re-engagement and can be spammy; the saved screen can show the discontinued badge when they open it.
  - Do **not** notify all users.
- Activation:
  - Notify hosts whose active/unarchived listings become eligible for discovery again.
  - Do not notify existing deal participants; activation does not change their ongoing deal lifecycle.
  - Do not notify saved-only users by default; "your saved listing is back" is re-engagement-adjacent.
  - Do not notify all users.

## 5. Discovery behavior design

Option A: client-side filter using platforms store.
- Launch safety: good; no discoverability migration needed.
- Regression risk: medium; depends on platform store being loaded and fresh. Current store has no realtime subscription and only cold-start/sign-in/Home priming.
- Preserves existing deals: yes; deals read `deals`/`listings` and are unaffected.
- Saved/my-listings/detail pages: unaffected unless their UI also chooses to show badges.
- Migration required: not for filtering, but realtime immediacy would require adding `platforms` to `supabase_realtime`.
- Works after admin toggle without app release: no for current installed builds; yes for future toggles after a mobile release with realtime/refresh.
- Risk: if platform fetch fails, Home may show stale inactive-platform listings unless the filter treats unknown platforms conservatively, which would risk hiding legacy/unmatched slugs.

Option B: add `platform_is_active` to `listings_with_availability`, then filter in client.
- Launch safety: moderate. Adding a column to the existing view is safer than filtering the existing view, but still touches a shared view.
- Regression risk: medium. Many screens use `listings_with_availability`; adding columns is usually harmless, but changing semantics of the view would not be.
- Preserves existing deals: yes if the view only exposes the field and does not filter rows.
- Saved/my-listings/detail pages: can use the field for badges without changing row visibility.
- Migration required: yes; view recreation and type regeneration.
- Works after admin toggle without app release: no for current installed builds; after release, future toggles need no app release.
- Risk: easy for future code to accidentally filter the shared view and break detail/saved/my-listings surfaces.

Option C: create a new view/RPC for discoverable listings only.
- Launch safety: best long-term separation. Home/discovery gets a purpose-built read model; saved/detail/my-listings continue using `listings_with_availability`.
- Regression risk: lower for non-discovery surfaces; moderate for Home because the query source changes.
- Preserves existing deals: yes; no deal/listing mutation.
- Saved/my-listings/detail pages: unaffected by row filtering; they can still render inactive-platform listings with discontinued copy.
- Migration required: yes; new view/RPC, grants, generated types, and probably realtime publication for `platforms`.
- Works after admin toggle without app release: no for already-installed builds; yes for future toggles after the mobile release, because the server view/RPC reads `platforms.is_active` live.
- Risk: one more server object to maintain, but it avoids overloading the shared availability view.

Option D: update listing status/archived_at when platform is deactivated.
- Launch safety: poor.
- Regression risk: high.
- Preserves existing deals: risky; status/archive changes bleed into saved/detail/my-listing/business logic and can confuse ongoing deals.
- Saved/my-listings/detail pages: affected everywhere.
- Migration required: not necessarily, but destructive behavior.
- Works after admin toggle without app release: yes, but by mutating business data.
- This violates the product rule. Do not use this option.

Recommended option: **Option C**.
- Create a new `discoverable_listings` view or RPC that is explicitly for Home/discovery and filters by active listing, available slots, unarchived listing, non-soft-deleted host, and `platforms.is_active = true`.
- Keep `listings_with_availability` broad for listing detail, saved, hidden, and My Listings.
- Add `platforms` to realtime publication and add a mobile platform-status subscription so currently open Home sessions can refresh/filter immediately when an admin toggles a platform.
- Add a client-side belt-and-suspenders filter in Home based on the refreshed platform store so already-loaded rows disappear while the server refetch catches up.

## 6. Deal-surface discontinued message design

Reusable mobile helper:
- Add a small helper such as `getPlatformStatus(platformSlug)` or `usePlatformDef(platformSlug)` around `findPlatform(s.platforms, slug)` so screens can check `def?.isActive === false`.
- Add a reusable `PlatformDiscontinuedNotice`/`PlatformStatusPill` component rather than changing `PlatformTile` itself. `PlatformTile` is used as a compact brand mark in many tight layouts.

Recommended surface changes:
- Home feed: no badge needed because deactivated-platform listings should not be present after filtering. File: `bantle/app/(tabs)/index.tsx`.
- Post listing picker: already hides inactive platforms; add realtime/refresh so it updates while the app is open. File: `bantle/app/(tabs)/post-listing.tsx`.
- Listing detail: show an info banner near the hero/title area: "Platform discontinued. This platform is no longer available for new listings. Existing deals can continue." File: `bantle/app/listing/[id].tsx`.
- Saved listings: show compact pill "Platform discontinued" on saved cards and keep the row tappable. File: `bantle/app/saved.tsx`.
- Hidden listings: show compact pill on hidden cards. File: `bantle/app/hidden-listings.tsx`.
- My Listings: show compact pill next to Active/Closed and helper text for hosts: "Hidden from discovery while this platform is discontinued." File: `bantle/app/my-listings.tsx`.
- Listing edit: resolve display platform against the full platform store, not the active-only array, and show "Platform discontinued" in the locked platform field when inactive. File: `bantle/app/listing/edit/[id].tsx`.
- Deals tab: show compact "Platform discontinued" pill under/near the listing title. File: `bantle/app/(tabs)/deals.tsx`.
- Deal detail: show a non-blocking banner below the hero: "This platform has been discontinued. Your existing deal can continue until its normal end date." File: `bantle/app/deal/[id].tsx`.
- Chat detail header: show a short line or pill under the listing title: "Platform discontinued." File: `bantle/app/chat/[conversationId].tsx`.
- Chat deal proposal cards: show a compact "Platform discontinued" pill in the deal card if the platform is inactive. File: `bantle/app/chat/[conversationId].tsx`.
- Chat list/archived chat list: optional tiny pill is probably too noisy; a dimmed mini platform mark or no change is acceptable because the detail header carries the explanation. Files: `bantle/app/(tabs)/chat.tsx`, `bantle/app/chat/archived.tsx`.
- Check-in/rating surfaces: optional compact note if the platform is inactive, but do not block ratings/check-ins. Files: `bantle/components/CheckInModal.tsx`, `bantle/app/rate/[dealId].tsx`.

## 7. Notification and push implementation design

Persistent notification rows:
- Add notification kinds `platform_deactivated` and `platform_activated`.
- Payload shape:
  `{ platform_id, platform_label, previous_is_active, is_active, event_id, affected_listing_count, affected_deal_count, role, primary_listing_id?, primary_deal_id? }`
- Use one row per recipient per state transition. Do not insert per listing or per deal.
- Detect true transitions by fetching previous `is_active` before update. If `previous_is_active === next_is_active`, skip notifications/push and log only a no-op or normal update.
- Add a partial unique index for idempotency, for example one unique row per `(user_id, kind, platform_id, event_id)` for platform status kinds.

Notification copy:
- Deactivation title: `Platform discontinued: <Platform label>`
- Deactivation body for hosts: `Your active listings for this platform are hidden from discovery. Existing deals can continue.`
- Deactivation body for deal participants: `Existing deals for this platform can continue until their normal end date.`
- Activation title: `Platform active again: <Platform label>`
- Activation body for hosts: `Your eligible listings for this platform can appear in discovery again.`

Mobile notification screen:
- Extend `NotificationKind` in `bantle/stores/notifications.ts`.
- Add visual/copy cases in `bantle/app/notifications.tsx`.
- Tap behavior can route to `/notifications` by default, `/my-listings` for host-only activation/deactivation payloads, or `/deal/[id]` when a single `primary_deal_id` is present. If multiple affected objects exist, stay on `/notifications`.
- Root push tap handling in `bantle/app/_layout.tsx:111-139` already falls unknown kinds through to `/notifications`, but explicit platform-kind cases should be added so future behavior is intentional.

Push delivery path:
- Web admin can directly call Expo via `sendAdminPush()` in `bantle-web/lib/admin-push.ts:24-60`.
- However, direct web push currently always uses the `moderation` channel and lacks stale-token cleanup. It is acceptable for moderation but not ideal as the platform-status push path.
- Recommended path: extend the existing `send_push_notification` Edge Function with `platform_deactivated` and `platform_activated` direct-mode kinds, copy builders, payload fields, and a `platform_status` Android channel (or a neutral existing channel if Syed wants no new channel).
- Then have the admin platform PATCH route insert notification rows and invoke the extended Edge Function for push delivery per deduped recipient.
- If expected recipient counts can grow large, create a dedicated `platform_status_dispatcher` Edge Function that computes recipients, inserts notifications idempotently, and calls `send_push_notification`. For the current minimal recipient set, route-level fanout plus the shared push Edge Function is simpler and sufficient.
- Push failures should be logged but must not roll back platform activation/deactivation. This matches existing moderation behavior where missing notification rows are degraded UX, not a failed primary action, in `bantle-web/app/admin/api/reports/[id]/resolve/route.ts:119-129`.

Spam controls:
- No all-user pushes.
- No saved-only user pushes by default.
- No push on no-op PATCH where state did not change.
- Deduplicate host/deal participant recipients into one notification/push per user per event.
- Avoid marketing copy. Treat the body as operational account/listing status.

## 8. Required code changes by repo

`bantle-web`:
- `app/admin/api/platforms/[id]/route.ts`
  - Fetch `id, label, is_active` before update.
  - Detect `previous_is_active` and `next_is_active`.
  - Skip platform-status notification/push fanout if no state change.
  - Generate `event_id`.
  - Update `platforms`.
  - Log `platform_updated` with previous/next active state and `event_id`.
  - Compute deduped recipient sets from listings/deals, or call a dispatcher Edge Function.
  - Insert persistent `notifications` rows.
  - Invoke extended `send_push_notification` for push delivery, logging failures without failing the primary toggle.
- `lib/admin-actions.ts`
  - Optionally add separate action types `platform_deactivated` and `platform_activated`, or keep `platform_updated` with richer payload. Separate action types are easier to audit.
- `lib/admin-push.ts`
  - Prefer not to use for platform status unless it is generalized with configurable channel and stale-token cleanup. Otherwise leave moderation-only.
- `app/admin/platforms/PlatformsListClient.tsx` and `components/admin/PlatformRow.tsx`
  - Optional: show toast copy that mentions notification fanout counts returned by the API.
  - Optional: disable repeated toggle while request is in flight already exists per-row in `PlatformRow`.
- Tests/smoke:
  - Toggle active -> inactive with zero affected rows.
  - Toggle inactive -> active with affected listings.
  - Verify `admin_actions` row.
  - Verify notification inserts are logged if DB rejects a new kind.
  - Verify push failure does not revert platform state.

`bantle`:
- Home feed:
  - Switch Home to `discoverable_listings` view/RPC, or apply the recommended discovery query from the new server object.
  - Add client-side platform-status filter as a live-session belt.
  - Add refetch on platform realtime update or platform store refresh.
- Platform store:
  - Add a `subscribeToPlatformChanges()`/`unsubscribe` lifecycle or integrate with auth setup.
  - On `platforms` UPDATE/INSERT, call `refresh()`.
  - Reset/unsubscribe on sign-out if a user-scoped channel is used.
- Notifications:
  - Extend `NotificationKind` in `stores/notifications.ts`.
  - Add `renderVisual`, `renderCopy`, and `handleNotificationPress` cases in `app/notifications.tsx`.
  - Add explicit push-tap handling in `app/_layout.tsx`.
- UI discontinued state:
  - Add reusable helper/component for inactive platform status.
  - Update `app/listing/[id].tsx`, `app/listing/edit/[id].tsx`, `app/my-listings.tsx`, `app/saved.tsx`, `app/hidden-listings.tsx`, `app/(tabs)/deals.tsx`, `app/deal/[id].tsx`, and `app/chat/[conversationId].tsx`.
  - Consider optional compact support in `app/(tabs)/chat.tsx`, `app/chat/archived.tsx`, `components/CheckInModal.tsx`, and `app/rate/[dealId].tsx`.
- Push:
  - Add/register `platform_status` Android channel in `lib/push.ts` if the Edge Function uses a new channel.
- Types:
  - Regenerate `types/database.ts` after migrations for the new view/RPC and notification kind constraint-related schema changes.
- Tests/smoke:
  - Platform disappears from post-listing picker while app is open after admin toggle.
  - Home row disappears without deleting/changing listing status.
  - Deal detail/chat/deals tab still open and show discontinued message.
  - In-app notification appears via realtime row insert.
  - Push tap lands on intended screen or `/notifications`.

Supabase/migrations:
- Add `platform_deactivated` and `platform_activated` to `notifications_kind_check`.
- Add rollback migration that removes those kinds, with a warning that rollback will fail if rows of those kinds still exist unless cleaned up.
- Create `discoverable_listings` view/RPC for Home/discovery.
- Add indexes if needed:
  - `listings(platform)` if not already present and recipient/discovery joins need it.
  - Optional partial index on active/unarchived listings by platform.
  - Unique partial notification idempotency index for platform status rows.
- Add `platforms` to `supabase_realtime` publication if mobile realtime platform refresh is used.
- Regenerate mobile database types.

## 9. Edge cases

- Platform deactivated while user is on Home feed: with platform realtime subscription, refresh platform store and either remove matching rows immediately client-side or refetch `discoverable_listings`.
- Platform reactivated while user is on Home feed: refetch Home; eligible rows can reappear if they still satisfy status, slots, blocks, hidden-listing filters, and sort/date/search filters.
- User has saved listing for deactivated platform: keep saved row, show "Platform discontinued"; do not send saved-only push by default.
- Host opens My Listings after deactivation: keep listing visible to host; show discontinued pill and "hidden from discovery" helper copy; do not mutate listing status.
- Buyer opens active deal after deactivation: deal detail/chat still load; show discontinued banner; do not mutate deal status or timestamps.
- Pending deal exists at deactivation time: preserve pending deal; notify both participants; allow existing pending lifecycle to accept/decline/cancel normally unless Syed later decides deactivation should block acceptance.
- Platform toggled off and on repeatedly: send only on actual state transitions, dedupe recipients per event, and avoid all-user/saved-only pushes.
- Push token missing/stale: persistent notification row still inserts; push returns `no_token` or clears stale token if using `send_push_notification`.
- Notification insert succeeds but push fails: platform toggle remains successful; log push failure and rely on in-app notification row.
- Admin deactivates platform with zero listings/deals: update and audit log succeed; recipient count is zero; no notification/push.
- Platform slug exists in listings but no matching platform row: `PlatformTile` fallback still renders a deterministic tile; discovery view using an inner join would hide these. Prefer `LEFT JOIN platforms` with `coalesce(p.is_active, true)` only if legacy unmatched slugs must remain discoverable, or `coalesce(..., false)` if unknown slugs should never be discoverable. Current code tolerates unmatched slugs.
- Older app builds without new notification kind support: realtime insert may add a kind outside the TypeScript union at runtime. Current `renderVisual`/`renderCopy` switches have no default, so old builds can misrender/crash when opening notifications if they receive new kinds. Avoid sending new kinds until the mobile build with support is released, or add a defensive default first.

## 10. Implementation plan

Phase A: DB migration/types
- Files to edit:
  - `bantle/supabase/migrations/<timestamp>_platform_status_notifications.sql`
  - `bantle/supabase/migrations/rollback_<timestamp>_platform_status_notifications.sql`
  - `bantle/types/database.ts` after typegen
- Work:
  - Extend `notifications_kind_check`.
  - Add `discoverable_listings` view/RPC.
  - Add notification idempotency index.
  - Add `platforms` to realtime publication if using realtime platform refresh.
- Verification commands:
  - `npm run typecheck` in `bantle`
  - Supabase type generation command used by the project
- Manual smoke:
  - Read view definition.
  - Confirm `discoverable_listings` excludes inactive platforms but `listings_with_availability` still returns them.
- Rollback:
  - Drop new view/RPC/index/publication entry.
  - Restore notification CHECK without platform kinds after deleting or migrating rows of those kinds.

Phase B: admin API notifications/push
- Files to edit:
  - `bantle-web/app/admin/api/platforms/[id]/route.ts`
  - `bantle-web/lib/admin-actions.ts` if adding separate action types
  - `bantle/supabase/functions/send_push_notification/index.ts` if extending shared push sender
  - Optional new `bantle/supabase/functions/platform_status_dispatcher/index.ts`
- Work:
  - Detect activation/deactivation.
  - Compute recipient set.
  - Insert notification rows.
  - Invoke push sender.
  - Return notification/push summary to admin UI.
- Verification commands:
  - `npm run typecheck` in `bantle-web`
  - `npm run lint` in `bantle-web` if available
  - `npm run typecheck` in `bantle`
- Manual smoke:
  - Toggle a test platform with no impacted users.
  - Toggle a platform with a test host listing.
  - Toggle a platform with a pending/active test deal.
  - Confirm no listing/deal status mutation.
- Rollback:
  - Revert route fanout code; platform toggles still work as today.
  - Disable platform push kinds in Edge Function after stopping notification inserts.

Phase C: mobile filtering + copy
- Files to edit:
  - `bantle/stores/platforms.ts`
  - `bantle/app/(tabs)/index.tsx`
  - `bantle/app/(tabs)/post-listing.tsx`
  - `bantle/app/listing/[id].tsx`
  - `bantle/app/listing/edit/[id].tsx`
  - `bantle/app/my-listings.tsx`
  - `bantle/app/saved.tsx`
  - `bantle/app/hidden-listings.tsx`
  - `bantle/app/(tabs)/deals.tsx`
  - `bantle/app/deal/[id].tsx`
  - `bantle/app/chat/[conversationId].tsx`
  - `bantle/stores/notifications.ts`
  - `bantle/app/notifications.tsx`
  - `bantle/app/_layout.tsx`
  - `bantle/lib/push.ts`
- Work:
  - Subscribe/refresh platform store.
  - Move Home to discoverable listing source.
  - Add discontinued badges/banners.
  - Add notification kind support and push routing.
- Verification commands:
  - `npm run typecheck`
  - `npm run lint` if available
- Manual smoke:
  - Current session picker updates after toggle.
  - Current Home feed removes/restores rows after toggle.
  - Saved/My Listings/Deal/Chat still open and show copy.
  - Notification row appears and tap behavior is sane.
- Rollback:
  - Revert Home query to `listings_with_availability`.
  - Keep notification defensive default if already released.

Phase D: smoke tests
- Files to inspect, not necessarily edit:
  - Admin platform route/UI files.
  - Mobile Home, picker, notification, deal/chat surfaces.
- Verification commands:
  - `git status --short`
  - `npm run typecheck` in both repos
  - `npm run lint` in both repos if available
- Manual tests:
  - Deactivate platform with active listing.
  - Reactivate same platform.
  - Toggle platform with pending/active deal.
  - Toggle platform with no impacted rows.
  - Simulate missing push token.
  - Verify old listing/deal statuses before/after.
- Rollback:
  - Use rollback migration.
  - Revert route fanout and mobile copy/filter changes.

Phase E: docs/audit update
- Files to edit:
  - `bantle-web/PROJECT_CONTEXT_FOR_AI.md`
  - `bantle-web/ADMIN_PANEL_PLAN.md`
  - Any mobile launch/audit docs Syed keeps current.
- Work:
  - Record final behavior, recipient rules, and no-deal-mutation rule.
  - Mark older Home-feed "still render on homepage" expectation as superseded.
- Verification:
  - Review docs for contradictions.
- Rollback:
  - Add a rollback note documenting what behavior was reverted and why.

## 11. Open questions for Syed

No question blocks the recommended implementation.

Assumptions used:
- Saved-only users should not receive push or persistent notification rows.
- Direct/deep-linked listing detail for a deactivated platform should show a discontinued notice but should not mutate listing/deal state.
- Existing pending and active deals continue through normal accept/decline/cancel/complete/dispute flows.

## 12. Recommended final behavior summary

When an admin deactivates a platform, Bantle stops using that platform for discovery and new listing creation. The mobile picker removes it, Home no longer shows eligible listings for it, and hosts with affected active listings are notified. Any active or pending deals for that platform keep working normally, and deal/chat/detail surfaces show that the platform has been discontinued without cancelling or changing the deal.

When an admin reactivates a platform, eligible listings become discoverable again, affected hosts are notified, and the app updates from the platform catalog instead of requiring listing/deal mutations.

Notifications are transactional only: no all-user blasts, no saved-only re-engagement push, one deduped row/push per affected user per real platform state transition.

Could not verify:
- No live database metadata was queried.
- No migrations were run.
- No production APIs were called.
- No typecheck/lint/build command was run for this read-only recon.
- Native/generated folders were not inspected.
- Current installed older mobile builds were not tested; old builds may not safely render new notification kinds until mobile support ships.
