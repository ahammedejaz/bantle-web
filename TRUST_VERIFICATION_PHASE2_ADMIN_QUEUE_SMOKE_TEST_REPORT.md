# Trust Verification Phase 2 Admin Queue Smoke Test Report

Generated: 2026-06-11 19:06:55 IST

## 1. Summary

Runtime smoke testing for the Trust Verification Phase 2 admin review queues completed successfully against the local admin app.

The smoke test verified:

- Admin env and admin session creation were available.
- The approved smoke-test user env was available.
- Admin pages and API routes for identity verification and name-change queues loaded through the local Next app.
- Identity selfie signed URL generation worked server-side with a 300 second TTL.
- Identity approve and reject actions worked.
- Name-change approve and reject actions worked.
- Rejection routes required a user-visible rejection message.
- Admin audit rows were created for all four review actions.
- `profiles.is_verified` stayed unchanged.
- Safe test storage objects and test rows were cleaned up after verification.
- Manual local browser verification was later recorded for both admin queue pages.

No secrets, tokens, signed URLs, full user IDs, emails, full storage paths, or image contents are included in this report.

## 2. Branches And Commits Tested

Mobile repo:

- Path: `/Users/syedejazahammed/Documents/GitHub/bantle`
- Branch: `feature/trust-verification-updated-plan-recon`
- Commit tested before report update: `1ea225e`

Admin repo:

- Path: `/Users/syedejazahammed/Documents/GitHub/bantle-web`
- Branch: `feature/trust-verification-admin-queues`
- Commit tested before report update: `1db8258`

## 3. Admin Env And Session Availability

Admin env was present and loaded from:

- `/Users/syedejazahammed/Documents/GitHub/bantle-web/.env`
- `/tmp/bantle-smoke.env`

Required env variable presence was confirmed without printing values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `BANTLE_SMOKE_TEST_EMAIL`
- `BANTLE_SMOKE_TEST_PASSWORD`
- `BANTLE_SMOKE_TEST_APPROVED_ACCOUNT=yes`

Admin runtime session availability:

- Admin login succeeded using the configured admin credentials.
- The admin account was confirmed to have `profiles.is_admin = true`.
- Authenticated admin cookies were generated using the same Supabase SSR cookie machinery used by the app.
- Unauthenticated admin API access was rejected by the admin gate.
- The approved smoke-test user was confirmed not to be an admin, and non-admin admin API access was rejected by the admin gate.

## 4. Test Data Created

Only the approved smoke-test user from `/tmp/bantle-smoke.env` was used.

Created during the successful run:

- 2 test `profile_verifications` rows:
  - one for approve
  - one for reject
- 2 tiny generated test image objects in the private `verification-selfies` bucket.
- 2 test `name_change_requests` rows:
  - one for approve
  - one for reject

Identity test object paths followed the required `verification/{user_id}/{verification_id}.png` pattern, but paths are intentionally not printed here.

## 5. Runtime Method Used

Runtime method:

- Local Next dev server for the admin repo.
- Authenticated HTTP requests against the local admin app/API.
- Service role was used only for safe test setup, verification queries, and cleanup.
- Admin route smoke requests used an authenticated admin session, not a service-role bypass.

Local smoke details:

- The admin app was started locally on port `3021`.
- Final runtime smoke traffic used `http://localhost:3021`.
- A preliminary `127.0.0.1` mutation attempt hit the same-origin guard, so the final runtime method used `localhost` to match Next dev origin handling.
- Browser automation was not available in this environment, so page checks were performed as authenticated HTTP page loads and API checks.

## 6. Identity Queue List And Detail Results

Identity list checks:

- `/admin/identity-verifications` loaded with an authenticated admin session.
- `/admin/api/identity-verifications?status=pending` loaded with an authenticated admin session.
- The pending test identity verification request appeared in the API list.
- The identity list payload did not include signed URL fields.
- The identity list payload did not include `storage_path`.

Identity detail checks:

- `/admin/identity-verifications/[id]` loaded with an authenticated admin session.
- `/admin/api/identity-verifications/[id]` loaded with an authenticated admin session.
- The detail payload included a server-generated signed URL.
- The detail payload did not include `storage_path`.

## 7. Signed URL Behavior

Signed URL behavior verified:

- Signed URL generation was server-side through the admin detail route.
- Signed URL TTL was `300` seconds.
- The signed URL was checked in memory only and was not printed.
- The signed URL was not stored.
- The signed URL was not present in the list payload.
- The private `verification-selfies` bucket remained private.
- Direct read of the test object by the signed-in smoke-test user failed as expected.

## 8. Identity Approve And Reject Results

Identity approve:

- Approved a pending test `profile_verifications` row through the admin API.
- Verified `status = approved`.
- Verified `reviewed_by`, `reviewed_at`, and `approved_at` were set.
- Verified `rejected_at` was not set.
- Verified user-visible rejection message was cleared.
- Verified `image_retention_until` matched approved selfie retention settings.
- Verified `profiles.identity_verification_status = approved`.
- Verified `profiles.identity_verified_at` was set.
- Verified `profiles.latest_profile_verification_id` pointed to the approved request during the test.
- Verified `profiles.is_verified` did not change.

Identity reject:

- Created a second pending test `profile_verifications` row and rejected it through the admin API.
- Verified reject without a user-visible message returned an error before mutation.
- Verified `status = rejected`.
- Verified `reviewed_by`, `reviewed_at`, and `rejected_at` were set.
- Verified `approved_at` was not set.
- Verified user-visible rejection message was stored.
- Verified `image_retention_until` matched rejected selfie retention settings.
- Verified `profiles.identity_verification_status = rejected`.
- Verified `profiles.identity_verification_rejected_at` was set.
- Verified `profiles.latest_profile_verification_id` pointed to the rejected request during the test.
- Verified `profiles.is_verified` did not change.

## 9. Name-Change Approve And Reject Results

Name-change approve:

- Created a pending test `name_change_requests` row.
- `/admin/name-change-requests` loaded with an authenticated admin session.
- `/admin/api/name-change-requests?status=pending` loaded with an authenticated admin session.
- The pending test name-change request appeared in the API list.
- `/admin/name-change-requests/[id]` loaded with an authenticated admin session.
- `/admin/api/name-change-requests/[id]` loaded with an authenticated admin session.
- Verified reject without a user-visible message returned an error before mutation.
- Approved the request through the admin API.
- Verified `status = approved`.
- Verified review timestamps were set.
- Verified `profiles.display_name` changed to the requested test-only name during the test.
- Restored the original smoke-test account display name.
- Verified `profiles.is_verified` did not change.

Name-change reject:

- Created a second pending test `name_change_requests` row.
- Rejected the request through the admin API.
- Verified `status = rejected`.
- Verified review timestamps were set.
- Verified user-visible rejection message was stored.
- Verified `profiles.display_name` did not change.
- Verified `profiles.is_verified` did not change.

## 10. Audit Row Verification

Audit rows were verified for:

- `identity_verification_approved`
- `identity_verification_rejected`
- `name_change_approved`
- `name_change_rejected`

Audit verification used target action/resource matching in the database. No signed URLs, storage paths, secrets, full user IDs, emails, or private payloads were printed.

## 11. Cleanup Performed Or Remaining Artifacts

Cleanup completed:

- Removed 2 generated test objects from `verification-selfies`.
- Deleted 2 test `profile_verifications` rows.
- Deleted 2 test `name_change_requests` rows.
- Restored the smoke-test account display name.
- Restored the smoke-test account identity verification fields to their original state.
- Confirmed final `profiles.is_verified` matched the original value.
- Stopped the local admin dev server.

Remaining artifacts:

- Admin audit rows from the smoke test remain intentionally as audit evidence.

## 12. `profiles.is_verified` Unchanged Confirmation

Confirmed.

`profiles.is_verified` was recorded before the smoke actions and checked after:

- identity approve
- identity reject
- name-change approve
- name-change reject
- final cleanup

It remained unchanged throughout.

## 13. Validation Results

Admin repo:

- `npx tsc --noEmit --incremental false`: passed.
- `npm run lint`: passed.
- `git diff --check`: passed.

Mobile repo:

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `git diff --check`: passed.

## 14. Manual Local Browser Verification

Manual local browser pass:

- Date recorded: 2026-06-11.
- Environment: local admin app.
- Pages checked:
  - `http://localhost:3021/admin/identity-verifications`
  - `http://localhost:3021/admin/name-change-requests`

Observed result:

- Both pages loaded successfully.
- Sidebar navigation showed `Identity Verification` and `Name Changes`.
- Active tab highlighting worked.
- Empty states displayed correctly.
- Result count showed `0 results`.
- No signed URL was visible.
- No storage path was visible.
- Identity page copy clearly stated that identity verification does not change the legacy public verified badge.
- Name changes page copy clearly stated that this queue does not enable mobile edit-profile enforcement.
- The existing red `2 Issues` badge appeared globally in the admin sidebar and appeared unrelated to this Phase 2 work.

Validation command results recorded with the manual browser pass:

- Admin `npx tsc --noEmit --incremental false`: passed.
- Admin `npm run lint`: passed.
- Admin `git diff --check`: passed.

Not checked in this manual browser pass:

- `/admin/identity-verifications/not-a-real-id`
- `/admin/name-change-requests/not-a-real-id`
- Deployed or hosted admin environment browser behavior.
- Non-admin browser navigation.
- Mobile UI or mobile enforcement flows.

Manual browser pass remaining risks:

- The browser pass covered local empty-state queue pages, not populated queue pages with real pending rows.
- Invalid-detail browser pages were not checked.
- The red `2 Issues` sidebar badge was not investigated as part of this Phase 2 queue smoke update because it appeared globally unrelated.

Manual browser pass next recommended step:

- Run a hosted/staging admin browser pass, including invalid-detail URLs and non-admin access behavior, before moving beyond Phase 2 admin queue verification.

## 15. Files Changed

Mobile repo:

- `reports/TRUST_VERIFICATION_PHASE2_ADMIN_QUEUE_SMOKE_TEST_REPORT.md`

Admin repo:

- `TRUST_VERIFICATION_PHASE2_ADMIN_QUEUE_SMOKE_TEST_REPORT.md`

No application code, migrations, storage policies, or mobile UI files were changed for this smoke rerun.

## 16. Smoke Tests Skipped And Why

Skipped:

- Browser click-through automation.

Reason:

- `agent-browser` was not installed in the local environment.

Compensating coverage:

- Authenticated HTTP page loads verified admin pages returned successfully.
- Authenticated API calls exercised `requireAdmin`, same-origin mutation checks, signed URL generation, approve/reject handlers, audit logging, and cleanup.
- Manual local browser verification later checked both queue pages, sidebar navigation, active tab highlighting, empty states, counts, and privacy-sensitive field visibility.

## 17. Remaining Risks

- This was a local runtime HTTP smoke test, not a deployed production smoke test.
- Browser automation was unavailable; browser verification was manual and covered local empty-state queue pages only.
- Invalid-detail browser pages were not checked.
- Audit rows remain by design; test review rows and storage objects were removed, so those audit rows reference test resource IDs that no longer have corresponding test rows.

## 18. Next Recommended Step

Run a hosted/staging admin browser pass with a safe admin account, including invalid-detail URLs and non-admin access behavior, then proceed to Phase 3 planning only after confirming the queues are acceptable for admin workflow.
