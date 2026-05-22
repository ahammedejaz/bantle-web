# Platform deactivation implementation notes

Generated: 2026-05-23 01:41:03 IST

## What was implemented

- Admin platform PATCH route now detects real activation/deactivation transitions.
- Same-state `is_active` updates do not notify or push.
- Deactivation recipients are limited to:
  - hosts with active, unarchived listings for that platform
  - buyers/hosts in pending or active deals for listings on that platform
- Activation recipients are limited to hosts with active, unarchived listings for that platform.
- Saved-only users, all users, and re-engagement audiences are not notified by default.
- One persistent `notifications` row is inserted per deduped recipient.
- Platform-status pushes are sent best-effort through the `send_push_notification` Edge Function.
- Platform update response includes notification/push summary counts.
- Admin audit action types now include `platform_deactivated` and `platform_activated`.
- Platform UI toast reports affected-user notification count or a non-blocking failure warning.

## Files changed in web repo

- `app/admin/api/platforms/[id]/route.ts`
- `app/admin/platforms/PlatformsListClient.tsx`
- `lib/admin-actions.ts`

Pre-existing dirty/untracked files were present before this work and were not intentionally changed by this feature, including `.gitignore`, repo handoff docs, recon docs, and `database-backups/`.

## Related mobile/Supabase files

See `/Users/syedejazahammed/Documents/GitHub/bantle/PLATFORM_DEACTIVATION_IMPLEMENTATION.md` for:

- mobile notification safety
- Home discovery view usage
- discontinued-platform UI
- Supabase migration files
- Edge Function push support

## Commands run

- `git status --short` in both repos before edits.
- `npm run build` in web repo:
  - First run failed with sandbox `EPERM` on `.next/trace`.
  - After fixing a TypeScript target issue in the admin route and rerunning outside the sandbox, build passed.
- `npm run lint` in web repo:
  - First run failed with sandbox `EPERM` on `.next/cache/eslint`.
  - Rerun outside the sandbox passed with no warnings or errors.
- Mobile verification commands are recorded in the mobile tracking doc.

## What passed

- `npm run build`
- `npm run lint`

## What failed

- Initial build/lint attempts failed due sandbox access to `.next`.
- The first successful build attempt found one implementation TypeScript issue: iterating a `Set` with `for...of` was incompatible with the repo TS target. Fixed by using `values().next()`.

## Still pending

- Review and apply the mobile repo migration to dev/staging first.
- Deploy the updated `send_push_notification` Edge Function.
- Deploy web/admin after the DB migration and Edge Function are available.
- Run the manual smoke tests below.
- Do not deploy this web/admin fanout ahead of the mobile notification-safety release.

## Manual smoke test checklist

1. Admin deactivates a platform.
2. Admin row refetches and shows inactive.
3. Notification/push summary comes back in the API response.
4. Persistent notification rows exist only for transactional recipients.
5. Push failures or missing tokens do not roll back platform status.
6. Repeating deactivate on an already inactive platform sends no duplicate notifications.
7. Admin reactivates a platform.
8. Activation notification goes to affected hosts only.
9. Saved-only users and all users are not notified.
10. Listing/deal lifecycle fields are unchanged by platform toggle.

## Rollback notes

- If fanout misbehaves, remove or disable notification/push fanout in `app/admin/api/platforms/[id]/route.ts` while keeping the platform update.
- Revert explicit audit action types to `platform_updated` only if downstream audit consumers cannot handle the new action types.
- Do not roll back by mutating listings or deals.

## Production deployment notes

- Required order:
  1. Mobile build with unknown notification fallback.
  2. Supabase migration in dev/staging.
  3. Edge Function deploy.
  4. Web/admin deploy.
  5. Production migration after smoke tests.
- The route invokes `send_push_notification`; make sure that function is deployed and authorized for service-role invocation.

## Known risks and assumptions

- No persistent `platform_status_events` table was added. Same-state requests are idempotent, but two concurrent opposite/admin requests can still race.
- Notification insert and push are best-effort after the platform update; failures are counted and logged but do not roll back platform status.
- This implementation does not notify saved-only users by default.
