# Pre-Launch Fix Recon 3 — Mobile Modals and Remaining Bugs

Generated: 2026-05-24  
Mode: read-only recon only  
Primary repo: `/Users/syedejazahammed/Documents/GitHub/bantle`  
Related repo: `/Users/syedejazahammed/Documents/GitHub/bantle-web`

No fixes were implemented. No migrations were run. No production data was queried or mutated. No push notifications, broadcasts, listing lifecycle actions, deal lifecycle actions, deletes, commits, or pushes were performed.

## 1. Executive Summary

- Confirmed: `BANTLE-PUSH-019` and `BANTLE-DATA-002` are currently `SHIPPED` in the tracker and Syed reports the Fix 2 smoke tests passed. They are ready for Syed to mark `VERIFIED`; Codex should not mark them verified.
- Confirmed: multiple user-facing mobile paths still call `Alert.alert`, which renders Android OS-native popups instead of Bantle-designed in-app modals. The most visible destructive/sensitive examples are listing close/reopen, deal dispute, unblock user, and sign-out gates on banned/TOS screens.
- Confirmed: the mobile app already has enough modal patterns to standardize this without new dependencies: centered action modals, bottom-sheet success/warning sheets, page-sheet forms, action menus, and a toast layer.
- Safe next implementation pass: create a small shared `ConfirmActionModal`/acknowledgment modal and convert the highest-risk `Alert.alert` confirmations first. This is a mobile-only UI pass and does not require DB or web changes.
- Requires Syed decision: whether to add confirmations to sensitive actions that currently do not use native alerts, such as deal cancel/decline/complete and settings sign-out. Replacing existing OS popups is safe; adding new confirmation steps changes UX.
- Remaining P0 blocker after Fix 2: `BANTLE-DATA-003` deal lifecycle/client update integrity remains `NOT_STARTED`. Deal lifecycle warning UX and soft-deleted account display still need product decisions before implementation.

Recommended next implementation pass: **Mobile modal replacement Batch 1**: add a reusable `ConfirmActionModal`, then replace OS alerts for close/reopen listing, flag dispute, unblock user, banned/TOS sign-out, and high-value related error/denial states. Do not change DB/API behavior.

## 2. Commands Run

| Repo | Command | Result | Notes |
| --- | --- | --- | --- |
| Mobile/Supabase | `git status --short` | Completed | Existing untracked docs/build artifacts were present before report creation: handoff/recon docs and `builds/`. |
| Mobile/Supabase | `npm run typecheck` | Passed | `tsc --noEmit` completed successfully. |
| Mobile/Supabase | `npm run lint` | Failed | 39 issues: 12 errors and 27 warnings. This matches known pre-existing mobile lint debt; no source files were changed in this recon. |
| Mobile/Supabase | `git diff --check` | Passed | No whitespace errors before report creation. |
| Mobile/Supabase | `rg -n "Alert\\.alert\|from ['\\\"]react-native['\\\"].*Alert\|import \\{[^}]*Alert\|showAlert\|confirm\|Confirm\|Modal" app components stores lib --glob '!node_modules' \|\| true` | Completed | Located all `Alert.alert` and custom `Modal` usage under reviewed app paths. |
| Mobile/Supabase | `rg -n "Close listing\|Archive listing\|Delete\|Report\|Block\|Unblock\|Cancel deal\|Decline\|Complete deal\|Dispute\|Sign out\|Log out\|Clear\|Restore\|warning\|Are you sure\|This action" app components stores lib --glob '!node_modules' \|\| true` | Completed | Located destructive/sensitive actions and existing custom modal/action-sheet flows. |
| Mobile/Supabase | `rg --files app components stores lib \| rg 'Modal\|Prompt\|Sheet\|Dialog\|Toast\|toast'` | Completed | Found reusable modal, prompt, sheet, and toast components. |
| Mobile/Supabase | `find components app -maxdepth 3 -type f \( -name '*Modal*' -o -name '*Prompt*' -o -name '*Sheet*' \) -print` | Completed | Confirmed named modal/prompt/sheet files. |
| Mobile/Supabase | Targeted `nl -ba ... | sed -n ...` reads | Completed | Read exact line ranges for all `Alert.alert` and key modal implementations. |
| Mobile/Supabase | Requested docs reads | Completed where present | Read tracker, Fix Recon 2, audit docs, design/context/handoff/backlog docs. `PROJECT_CONTEXT_FOR_AI.md` and `PROJECT_DEEP_UNDERSTANDING.md` were not present in the mobile repo. |
| Web/admin | `git status --short` | Completed | Existing unrelated `.gitignore` modification and untracked docs/backup folder were present. |
| Web/admin | `npm run build` | Passed | Same existing warning: Edge Runtime disables static generation for one page. |
| Web/admin | `npm run lint` | Passed | No ESLint errors. |
| Web/admin | `git diff --check` | Passed | No whitespace errors. |
| Web/admin | Requested docs reads | Completed where present | Read web/admin audit and combined summary. `BANTLE_PRE_LAUNCH_BUG_TRACKER.md` was not present in the web/admin repo. |

## 3. Native OS Popup Inventory

| ID | File | Lines | Current native popup | Action | Risk | Recommended replacement | Notes |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| A1 | `app/listing/edit/[id].tsx` | 196-217 | `Close this listing?` / `It will stop appearing in the home feed. Existing deals on it stay intact.` Buttons: `Keep open`, `Close listing` destructive | Close listing | High, destructive listing lifecycle | Destructive confirm modal | Async callback updates `listings.status='closed'`. No modal loading state or double-submit protection once native alert is open. |
| A2 | `app/listing/edit/[id].tsx` | 210-213 | `Could not close listing` / error text | Close listing failure | Medium | Error toast or modal error state | Same close flow. Better as in-app toast/banner after async failure. |
| A3 | `app/listing/edit/[id].tsx` | 230-234 | `Listing closed by Bantle` / `This listing was closed by Bantle and cannot be reopened.` | Reopen blocked for admin-closed listing | High, moderation/safety context | Info/warning modal or inline panel only | Fix 2 already hides Reopen for admin-closed listings and shows inline panel. Keep a defensive in-app denial path if handler remains callable. |
| A4 | `app/listing/edit/[id].tsx` | 236-261 | `Reopen this listing?` / `It will reappear in the home feed for other users. Existing deals are unaffected.` Buttons: `Keep closed`, `Reopen` | Reopen self-closed listing | High, listing discovery lifecycle | Warning confirm modal | Async callback updates `status='active'`. Preserve self-closed reopen behavior. |
| A5 | `app/listing/edit/[id].tsx` | 254-257 | `Could not reopen listing` / friendly Bantle-closed rejection or raw error | Reopen failure | Medium | Error toast or modal error state | Must keep friendly DB-trigger error mapping for admin-closed rejection. |
| A6 | `app/listing/edit/[id].tsx` | 278-281 | `Could not archive listing` / `Could not unarchive listing` | Archive/unarchive error | Medium | Error toast | Archive/unarchive already has `archiving` state and no confirmation. Replacement should not alter behavior. |
| A7 | `app/deal/[id].tsx` | 221-224 | `Action failed` / error text or `Try again.` | Deal accept/decline/cancel/complete/dispute failure | High, deal lifecycle error | Error toast or inline error banner | `wrapAction` uses `acting` state, so loading/disabled exists. Replace only error presentation unless Syed asks for new confirmations. |
| A8 | `app/deal/[id].tsx` | 245-248 | `Could not archive` / `Could not unarchive` | Deal archive/unarchive error | Medium | Error toast | Archive/unarchive has `acting` state. |
| A9 | `app/deal/[id].tsx` | 714-732 | `Flag dispute?` / `This marks the deal as disputed and blocks new ratings on it. You can still settle directly with the other party.` Buttons: `Cancel`, `Flag` destructive | Dispute deal | High, destructive deal lifecycle | Destructive confirm modal | Async action routes through `wrapAction`; confirm modal should disable while `acting === 'dispute'`. |
| A10 | `app/blocked-users.tsx` | 117-130 | `Unblock user?` / `Allow {name} to message you again?` Buttons: `Cancel`, `Unblock` | Unblock user | High, safety/privacy | Warning confirm modal | Async callback calls `unblockUser`; success/error already use toast. Add loading/disabled to avoid repeated unblocks. |
| A11 | `app/(auth)/banned.tsx` | 51-66 | `Sign out?` / permanent or temporary ban copy. Buttons: `Cancel`, `Sign out` destructive | Sign out from banned gate | Medium, sensitive auth state | Warning confirm modal | Callback calls `signOut()` without loading state. Must remain available to banned users. |
| A12 | `app/(auth)/tos-acceptance.tsx` | 69-82 | `Sign out?` / `You will need to accept the updated Terms to use Bantle on this device.` Buttons: `Cancel`, `Sign out` destructive | Sign out from TOS gate | Medium, sensitive auth state | Warning confirm modal | Callback calls `signOut()` without loading state. |
| A13 | `app/(auth)/account-recovery.tsx` | 39-42 | `Cannot restore` / permanently removed support copy | Restore blocked | Medium, account lifecycle | Info/warning modal or inline error | Defensive branch should rarely happen. Screen already has strong in-page copy. |
| A14 | `app/(auth)/account-recovery.tsx` | 54-57 | `Restore failed` / error text or `Try again.` | Restore failed | Medium, account recovery | Error toast or inline error banner | Restore uses `restoring` state. |
| A15 | `app/(auth)/profile-setup.tsx` | 65 | Single-message alert with display-name validation error | Profile setup validation | Low/medium | Inline validation under input | Non-destructive. Inline error is more consistent and accessible. |
| A16 | `app/(auth)/profile-setup.tsx` | 74-77 | `Age confirmation required` / `Please confirm you are 18 or older to continue.` | Required age attestation | Medium, compliance gate | Inline checkbox error or warning modal | Prefer inline because the missing field is visible on the screen. |
| A17 | `app/(auth)/profile-setup.tsx` | 98 | `Save failed` / error text | Profile save failure | Medium | Inline error banner or toast | Save has `saving` state. |
| A18 | `app/(auth)/login.tsx` | 202 | `Sign-in failed` / Google sign-in error text | Google sign-in failure | Medium | Inline auth error | Email auth already uses inline `authError`; align Google path. |
| A19 | `components/ReportUserModal.tsx` | 115-118 | `Could not submit report` / error text | Report submission failure | High, trust/safety | Inline error panel inside report modal | The same component already replaced an older empty-details OS alert with a custom modal at lines 255-309. |
| A20 | `app/listing/[id].tsx` | 196-199 | `Chat unavailable` / `Couldn't start conversation. Please try again later.` | Start chat failure | Medium | Error toast | Existing comment intentionally avoids leaking block state; keep generic copy. |
| A21 | `app/chat/[conversationId].tsx` | 571-574 | `Proposal failed` / sold-out or error copy | Deal proposal failure | High, deal flow | Inline modal error or toast | Propose flow already has `ProposeDealModal` with loading; error should stay in-app. |
| A22 | `app/chat/[conversationId].tsx` | 583-586 | `Accept failed` / error copy | Accept deal failure | High, deal lifecycle | Error toast | Async state exists through action handlers. |
| A23 | `app/chat/[conversationId].tsx` | 598-601 | `Decline failed` / error copy | Decline deal failure | High, deal lifecycle | Error toast | This is not a confirmation; do not add confirmation without Syed decision. |
| A24 | `app/chat/[conversationId].tsx` | 613-616 | `Cancel failed` / error copy | Cancel deal failure | High, deal lifecycle | Error toast | This is not a confirmation; do not add confirmation without Syed decision. |
| A25 | `app/settings.tsx` | 275-278 | `No mail app` / `Email us at support@...` | Support mail fallback | Low | Custom info modal or keep native if Syed accepts OS-level fallback | Code comment says this was intentionally kept as system alert because toast is too short. Syed's new direction likely favors custom info modal. |
| A26 | `app/dev/bugsnag-test.tsx` | 49-52 | `Sent` / manual Bugsnag test sent | Dev/preview diagnostics | Low, dev-only | Toast or keep native in dev-only screen | Production-gated. Lowest priority. |

Additional sensitive actions found that **do not currently use native OS popups**:

- `app/deal/[id].tsx:662-706` runs accept/decline/cancel/complete from inline buttons without confirmation.
- `app/chat/[conversationId].tsx:1565-1569` exposes decline from chat deal cards without confirmation.
- `app/settings.tsx:582-588` signs out directly from Settings.
- `app/(tabs)/index.tsx:806-816` hides listings from a Bantle bottom-sheet action menu.
- `app/my-listings.tsx:418-465`, `app/(tabs)/deals.tsx:356-398`, `app/(tabs)/chat.tsx:334-371`, and `app/chat/archived.tsx:222-259` use custom bottom-sheet action menus for archive/unarchive.

These should not be changed in a pure popup-replacement pass unless Syed explicitly wants new confirmation steps.

## 4. Existing Custom Modal Inventory

| Component | File | Purpose | Reusable? | Notes |
| --- | --- | --- | --- | --- |
| `PushPermissionPrompt` | `components/PushPermissionPrompt.tsx:41-129` | In-app push permission prompt styled as transparent bottom sheet | Style reference, not generic | Supports title/body, two buttons, busy state, backdrop tap, Android back via `onRequestClose`, `statusBarTranslucent`, and safe-area bottom padding. This is the modal style Syed referenced. |
| `DeleteAccountModal` | `components/DeleteAccountModal.tsx:12-150` | Account deletion confirmation | Reference for destructive content, not generic enough | Supports title/body, bullet sections, danger button, loading, disabled cancel while submitting, inline error, close X, Android back. No typed confirmation/checkbox. |
| `ReportUserModal` | `components/ReportUserModal.tsx:70-310` | Full report form with category/details and nested empty-details confirm | Complex flow only | Page-sheet form with category radio rows, details input, submit loading, safe area. Nested bottom-sheet confirm at lines 255-309 already replaced an OS alert. Still has native submit-error alert at lines 115-118. |
| `VerifyEmailGateModal` | `components/VerifyEmailGateModal.tsx:26-91` | Blocks critical actions until email verified | Style reference | Centered modal with title/body, cancel/verify actions, Android back. No loading/destructive style. |
| `CheckInModal` | `components/CheckInModal.tsx:42-296` | Milestone check-in modal | Domain-specific only | Centered card with title/body/context row/buttons, Android back dismissal, no loading state. |
| `HomeFeedFilterSheet` | `components/HomeFeedFilterSheet.tsx:32-110` | Sort/filter bottom sheet | Action-sheet reference | Bottom sheet with backdrop, drag handle, immediate option selection, Android back. Not a confirmation modal. |
| `Toast` / `toast` | `components/Toast.tsx:22-126`, `lib/toast.ts:7-14`, `stores/toast.ts:28-45` | Global in-app success/error toast | Reusable for non-blocking errors | Already used by archive, block, hidden-listing, and settings paths. Supports success/error only, two-line text cap. |
| Post-listing success modal | `app/(tabs)/post-listing.tsx:461-520` | Listing-created success bottom sheet | Style reference | Explicit success modal with two buttons and Android back routing. Good pattern for completion states. |
| Settings export error modal | `app/settings.tsx:622-667` | Rate-limit/export failure modal | Style reference | Bottom-sheet acknowledgment modal with warning/danger variants and single `OK` button. |
| Settings about modal | `app/settings.tsx:672-710` | About app info modal | Low-risk info reference | Centered informational modal. |
| Chat report-success modal | `app/chat/[conversationId].tsx:1195-1245` | Report submitted + optional block prompt | Style reference | Bottom sheet with success icon and stacked buttons. |
| Chat block confirm modal | `app/chat/[conversationId].tsx:1250-1305` | Confirm blocking a user | Reusable concept but inline only | Centered custom destructive confirm. It lacks loading state but already proves the desired Bantle pattern for safety actions. |
| Chat header action menu | `app/chat/[conversationId].tsx:1320-1415` | Archive/report/block action sheet | Action-sheet reference | Includes `statusBarTranslucent` and safe-area bottom padding, with comment explaining Android edge-to-edge behavior. |
| Propose deal modal | `app/chat/[conversationId].tsx:1687-1876` | Deal proposal form | Complex flow only | Page-sheet with inputs, acknowledgment checkbox, loading button. Not a generic confirm modal. |
| Row action sheets | `app/my-listings.tsx:418-465`, `app/(tabs)/deals.tsx:356-398`, `app/(tabs)/chat.tsx:334-371`, `app/chat/archived.tsx:222-259`, `app/(tabs)/index.tsx:791-827` | Archive/hide row menus | Action-sheet reference | Existing Bantle-styled alternatives to OS menus. Some do not use `statusBarTranslucent`/safe-area bottom padding yet. |

## 5. Recommended Modal Architecture

Create a new shared `ConfirmActionModal` rather than reusing one of the domain-specific modals directly.

Rationale:

- `DeleteAccountModal`, `ReportUserModal`, and `ProposeDealModal` are too domain-specific.
- `VerifyEmailGateModal` and chat's block confirm modal prove the centered card pattern but are not configurable.
- `PushPermissionPrompt`, settings export modal, and post-listing success modal prove the bottom-sheet pattern. They are good style references, but destructive confirmations should usually be centered to reduce accidental taps and keep copy focused.
- A shared component prevents each screen from recreating its own overlay, loading state, Android back behavior, and danger button styling.

Recommended `ConfirmActionModal` API:

```ts
type ConfirmActionModalProps = {
  visible: boolean;
  variant: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  detail?: string | null;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  dismissible?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel: () => void;
};
```

Implementation guidance for the next pass:

- Use existing `Button` primitives and NativeWind design tokens: `teal-900`, `warning-bg/fg`, `danger-bg/fg`, white card, deep-teal translucent backdrop.
- Use lucide icons by variant: `AlertTriangle` for danger/warning, `Info` for info, `CheckCircle2` for success.
- Use `Modal` with `transparent`, `animationType="fade"`, `statusBarTranslucent`, `onRequestClose`.
- Use `useSafeAreaInsets()` and stable card max width. For small screens, allow content wrapping and vertical spacing; do not rely on viewport-scaled font sizes.
- Android back should cancel only when `dismissible !== false` and `loading` is false.
- Backdrop tap should behave like cancel for warning/info, but should probably be disabled for destructive actions while loading.
- Confirm button should show loading/disabled state for async actions and prevent double-submit.
- Existing action callbacks should stay unchanged; the modal should wrap the current callbacks, not alter DB/API writes.
- Non-blocking failures should use the existing `toast.error` when possible. Longer account/recovery errors can use an in-app error panel.

Do not add a new dependency.

## 6. Proposed Modal Replacement Batches

| Batch | Scope | Files | Risk | Tests |
| --- | --- | --- | --- | --- |
| 1 | Replace high-value native confirmations and related Bantle denial/error states | New `components/ConfirmActionModal.tsx`; `app/listing/edit/[id].tsx`; `app/deal/[id].tsx`; `app/blocked-users.tsx`; `app/(auth)/banned.tsx`; `app/(auth)/tos-acceptance.tsx`; optionally `components/ReportUserModal.tsx` submit error | Medium. Mobile UI-only, but touches listing/deal/safety/auth flows. No DB/web changes. New APK required. | Typecheck, lint, close/reopen listing modal behavior, admin-closed listing still cannot reopen, dispute modal, unblock modal, banned/TOS sign-out modal, Android back/backdrop behavior, loading/double-submit checks. |
| 2 | Convert remaining OS error/info alerts to toast/inline/custom acknowledgment | `app/(auth)/account-recovery.tsx`; `app/(auth)/profile-setup.tsx`; `app/(auth)/login.tsx`; `app/listing/[id].tsx`; `app/chat/[conversationId].tsx`; `app/settings.tsx`; `app/dev/bugsnag-test.tsx` | Low/medium. Mostly presentation-only. New APK required. | Validation errors show inline, Google sign-in error inline, chat/listing/deal failures use toast or in-modal error, settings no-mail path has custom info modal if Syed wants no native popups. |
| 3 | Modal shell consistency and Android edge-to-edge audit | Existing action sheets and transparent modals: `components/ReportUserModal.tsx` nested confirm, `app/(tabs)/chat.tsx`, `app/(tabs)/deals.tsx`, `app/my-listings.tsx`, `app/(tabs)/index.tsx`, `app/chat/archived.tsx`; review `ProposeDealModal`/page sheets | Low/medium. UI polish and Android device behavior. New APK required. | Android production/preview build visual QA: backdrop fills screen, bottom sheets avoid gesture bar, Android back closes safely, no clipped buttons. |
| 4 | Optional new confirmations for sensitive actions that currently act immediately | Deal cancel/decline/complete in `app/deal/[id].tsx` and `app/chat/[conversationId].tsx`; settings sign-out in `app/settings.tsx`; archive/hide actions if Syed wants confirmation | Medium/high because this changes workflow friction. Product decision first. New APK required. | Confirm no accidental DB behavior changes; verify action counts, loading states, cancellation paths, and user expectations. |

Database changes: none for modal replacement.  
Web/admin changes: none for mobile modal replacement.  
New APK: yes for every mobile UI batch.

## 7. Remaining Bug Tracker Summary

| Bug ID | Title | Severity | Current status | Safe now? | Needs Syed decision? | Recommended next step |
| --- | --- | --- | --- | --- | --- | --- |
| `BANTLE-PUSH-019` | Fix platform/direct push partial failure reporting | P1 / Medium | `SHIPPED`; Syed reports smoke-passed | No code needed | No | Syed may mark `VERIFIED` after final confirmation. |
| `BANTLE-DATA-002` | Prevent owners from reopening admin-closed listings | P0 / High | `SHIPPED`; Syed reports smoke-passed | No code needed | No | Syed may mark `VERIFIED` after final confirmation. |
| `BANTLE-DATA-003` | Restrict deal lifecycle/client update permissions | P0 / High | `NOT_STARTED` | Yes for DB integrity scope, but needs tight implementation prompt | Partly | Next security/data implementation pass. Avoid UI/product expansion unless decided. |
| Proposed `BANTLE-UX-020` | Deal lifecycle context warnings | P1 / Medium | Not in tracker table yet; proposed in Recon 2 | Not until decisions are made | Yes | Product decision first, then implementation. |
| Proposed `BANTLE-PRIV-021` | Soft-deleted account deal display | P1 / Medium | Not in tracker table yet; proposed in Recon 2 | Not yet | Yes | Product decision first, likely recon/implementation after lifecycle decisions. |
| Proposed `BANTLE-UX-022` | Replace native OS popups with Bantle in-app modals | P1 / Medium | New from this recon | Yes for replacing existing alerts | Partly | Direct implementation for Batch 1. Product decision before adding brand-new confirmations. |
| `BANTLE-WEB-004` | Upgrade vulnerable Next.js dependency | P0/P1 / High | `NOT_STARTED` | Yes | No | Direct web implementation pass with build/lint/admin smoke. |
| `BANTLE-WEB-005` | Add CSRF/origin protection to admin mutation APIs | P1 / Medium | `NOT_STARTED` | Yes, but should be scoped | No | Direct web security implementation pass. |
| `BANTLE-WEB-006` | Fix public verify page false-success/token handling | P1 / Medium | `NOT_STARTED` | Yes | No | Direct web implementation pass plus dynamic email verification smoke. |
| `BANTLE-MOB-007` | Clear mobile lint errors and triage warnings | P1 / Medium | `NOT_STARTED` | Yes | No | Direct cleanup pass; keep separate from modal pass. |
| `BANTLE-MOB-008` | Triage mobile dependency advisories | P1 / Medium | `NOT_STARTED` | Needs package strategy | Possibly | Recon or direct dependency upgrade pass depending Expo compatibility. |
| `BANTLE-DB-009` | Add/verify notification history index | P2 / Medium | `NOT_STARTED` | Likely yes | No | DB performance pass; can be deferred if launch pressure remains on P0/P1. |
| `BANTLE-PRIV-010` | Sanitize production logs/error exposure | P2 / Medium | `NOT_STARTED` | Yes, but broad | No | Recon first or narrow logging pass. |
| `BANTLE-PRIV-011` | Verify analytics consent/autocapture posture | P1/P2 / Medium | `NOT_STARTED` | Needs product/legal posture | Yes | Product/privacy decision first. |
| `BANTLE-WEB-012` | Improve broadcast retry audit action naming | P2 / Medium | `NOT_STARTED` | Yes | No | Direct web/admin polish pass. |
| `BANTLE-WEB-013` | Avoid raw backend error messages in admin responses | P2 / Medium | `NOT_STARTED` | Yes | No | Direct web/admin API polish pass. |
| `BANTLE-MOB-014` | Move public observability keys to env/config | P3 / Low | `NOT_STARTED` | Yes | No | Defer or low-risk config pass. |
| `BANTLE-MOB-015` | Remove or keep production-gated Bugsnag dev route | P3 / Low | `NOT_STARTED` | Yes | Yes if keeping route | Product/release decision. |
| `BANTLE-WEB-016` | Remove hardcoded fallback broadcast test user from production path | P3 / Low | `NOT_STARTED` | Yes | No | Low-risk web config pass. |
| `BANTLE-WEB-017` | Review dashboard latest-admin email exposure | P3 / Low | `NOT_STARTED` | Yes | Yes | Product/admin privacy decision. |
| `BANTLE-WEB-018` | Add extra all-user broadcast safeguards if desired | P3 / Low | `NOT_STARTED` | Yes | Yes | Product/admin safety decision. |

Tracker update recommendation after this recon:

- Add `BANTLE-UX-022` or similar for native OS popup replacement.
- Leave `BANTLE-PUSH-019` and `BANTLE-DATA-002` as `SHIPPED` until Syed marks them `VERIFIED`.
- Add Recon 3 as evidence for modal replacement scope and implementation ordering.

## 8. Product Decisions Needed

Deal/listing lifecycle:

1. Should an admin-closed listing automatically terminate active/pending deals, or only block discovery/reopen and show warnings while deals continue?
2. Should listing closure reason be visible to existing deal counterparties, or only to the listing owner?
3. What exact user-facing copy should show for Bantle/admin-closed listings?

Account deletion:

4. During the 7-day recovery period, should other deal participants see the deleted user's original display name, or a label like `Account pending deletion`?
5. During the 7-day recovery period, should listing/deal details remain visible to counterparties even if the listing owner requested account deletion?
6. Should account deletion automatically cancel/lock active deals, or should active deals remain visible/active until hard delete/manual action?
7. After hard delete, must host-owned deal history survive?

Modal UX:

8. Should every destructive action use the same Bantle modal style?
9. Should low-risk info popups become toasts instead of modals?
10. For dangerous actions like account deletion, should Bantle add typed confirmation or checkbox confirmation? Current `DeleteAccountModal` has bullets, loading, and a danger button, but no typed confirmation or checkbox.
11. Should deal cancel/decline/complete get confirmation modals even though they do not use native OS popups today?
12. Should Settings sign-out require confirmation, or remain a one-tap action?

## 9. Recommended Next Implementation Prompt Inputs

Use this for ChatGPT/Codex when writing the next fix prompt:

- Mode: fully autonomous implementation, but scope must be **mobile modal replacement only**.
- Do not alter DB schemas, Supabase functions, web/admin routes, deal lifecycle behavior, account deletion behavior, push behavior, or tracker statuses beyond adding/updating a modal bug entry if requested.
- Create `components/ConfirmActionModal.tsx` using existing design tokens, `Button`, lucide icons, `Modal`, `statusBarTranslucent`, safe-area padding, Android back handling, loading/disabled state, and no new dependencies.
- Replace existing `Alert.alert` confirmations first:
  - `app/listing/edit/[id].tsx:196-217` close listing.
  - `app/listing/edit/[id].tsx:230-261` admin-closed denial/reopen confirm.
  - `app/deal/[id].tsx:714-732` flag dispute.
  - `app/blocked-users.tsx:117-130` unblock user.
  - `app/(auth)/banned.tsx:51-66` sign out.
  - `app/(auth)/tos-acceptance.tsx:69-82` sign out.
- Convert high-value remaining native error alerts in the same touched files to `toast.error`, inline error, or the shared acknowledgment modal:
  - `app/listing/edit/[id].tsx:210-213`, `254-257`, `278-281`.
  - `app/deal/[id].tsx:221-224`, `245-248`.
  - `components/ReportUserModal.tsx:115-118` if included in Batch 1.
- Preserve existing callbacks and Supabase writes exactly. This is presentation-only.
- Preserve self-closed listing reopen and Fix 2 admin-closed listing protection behavior.
- Do not add confirmations to deal cancel/decline/complete or settings sign-out unless Syed explicitly approves.
- Run `npm run typecheck`, `npm run lint`, `git diff --check`, and `git status --short`.
- Expected lint result may remain failed due pre-existing lint debt; report whether any changed file introduces new lint errors.
- Build/install APK only if Syed asks in the implementation prompt; modal code changes require a new APK for device QA.

Suggested smoke checklist for the modal pass:

1. Close listing opens Bantle modal, cancel keeps listing open, confirm closes listing.
2. Self-closed listing reopen opens Bantle modal, cancel keeps closed, confirm reopens.
3. Admin-closed listing still shows Bantle closure panel and cannot reopen.
4. Flag dispute opens Bantle destructive modal, cancel no-ops, confirm disputes.
5. Unblock user opens Bantle modal, cancel no-ops, confirm unblocks and shows toast.
6. Banned/TOS sign-out modals work and Android back cancels.
7. Error paths show in-app toast/inline errors, not OS popups.
8. Android hardware back/backdrop behavior is safe during loading.
9. No deal/listing/account data behavior changes beyond the user-confirmed action.
