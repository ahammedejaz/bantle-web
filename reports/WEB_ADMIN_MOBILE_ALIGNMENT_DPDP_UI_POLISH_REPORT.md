# Bantle Web + Admin — Mobile Alignment & DPDP-Aware UI Polish Report

**Document status:** Implementation report (UI/copy-only alignment)
**Date:** 2026-06-26
**Owner:** Bantle founder / implementation agent (Claude Opus 4.8, release-stabilization mode)
**Web/admin repo:** `/Users/syedejazahammed/Documents/GitHub/bantle-web`
**Web/admin branch:** `feature/trust-verification-admin-queues`
**Mobile repo (reference only, not modified):** `/Users/syedejazahammed/Documents/GitHub/bantle`
**Mobile branch (source of truth):** `feature/face-aligned-selfie-capture`

---

## 1. Summary

This was a recon-first, **UI/copy-only** pass to align the Bantle marketing
website and admin panel with the current mobile app architecture and to make
privacy/consent wording clearer in a **DPDP-aware** way.

The single most important gap found: the public **privacy** and **safety**
pages described **only email verification** and made no mention of the mobile
app's **identity-verification selfie flow** (private storage, manual admin
review, never shown publicly, no GPS). For a feature that now collects a
selfie — a sensitive personal data item — the absence of a clear privacy
notice was both a mobile mismatch and a DPDP-notice gap. That is now fixed,
along with smaller proposal-first and trust-copy alignments and small admin
privacy hints.

No database, backend, RLS, migration, Supabase/Edge function, API contract,
admin-action semantic, or dependency was changed. Seven files changed, all
text/markup. `tsc --noEmit`, `eslint`, and `next build` all pass; `git diff
--check` is clean. The mobile repo was not modified.

---

## 2. Branches reviewed

```text
Web/admin:  feature/trust-verification-admin-queues  (modified)
Mobile:     feature/face-aligned-selfie-capture       (reference only, unchanged)
```

Pre-flight safety: web worktree was clean before edits. Mobile worktree
contained only pre-existing deletions of `builds/*.apk` (build artifacts, not
source/config) and was on the expected branch; it was not touched.

---

## 3. Scope

In scope (done):

```text
- Marketing copy alignment with current mobile trust/verification + proposal-first behavior.
- DPDP-aware privacy/consent wording for identity verification + name-change data.
- Small admin UI privacy hints for sensitive verification material.
```

Out of scope (not touched):

```text
- DB schema, migrations, RLS, grants.
- Supabase functions / Edge Functions / backend behavior.
- Admin action semantics, API contracts, service-role usage.
- Authentication/session logic.
- Dependencies (package.json/package-lock.json unchanged).
- Brand direction / full redesign.
- Mobile repo (reference only).
```

---

## 4. Mobile source-of-truth summary

Extracted from the current mobile reports (read-only), primarily
`FINAL_UI_POLISH_AND_BUILD_115_REPORT.md`,
`TRUST_VERIFICATION_FACE_ALIGNED_SELFIE_CAPTURE_IMPLEMENTATION_PLAN.md`, and
`PENDING_WORK_RECON_AND_NEXT_STEPS.md`:

```text
- Identity verification: user submits a selfie via a face-aligned camera
  (a capture-quality aid; explicitly NOT liveness/biometric/fraud-proof).
- Manual override removed from the normal capture flow.
- Statuses: not submitted / unverified, in review (pending), approved,
  rejected (with a user-visible review message), re-verification required.
- The selfie is uploaded to a PRIVATE verification-selfies storage bucket,
  reviewed manually by admins through short-lived signed-URL access, and is
  never shown on public profiles.
- Bantle does not request GPS/location for identity verification.
- Name-change request flow: user submits a request; a pending tracker shows in
  Edit Profile; admin approval may require identity re-verification.
- Proposal-first chat: buyers must propose first; full chat unlocks only after
  a proposal is accepted / the deal is active; terminal (cancelled/rejected/
  completed) deals are read-only.
- Chat supports images; no payment processing anywhere in the app.
- A reviewed badge is a signal, not a guarantee about any user.
```

A security/QA audit on the mobile branch independently confirmed the
verification-selfies bucket is private (owner insert-only, no user SELECT) and
that admin notes are not exposed to users.

---

## 5. Web/admin pages audited

Marketing (`app/(marketing)/`): `page.tsx` (+ `components/HeroSection.tsx`),
`how-it-works`, `safety`, `privacy`, `terms`, `faq`, `verify`, `about`,
`refund-policy`, `community-guidelines`, `support`, `account-deletion`,
`child-safety-standards`.

Admin (`app/admin/`): `AdminNav`, `identity-verifications` (list + `[id]`
detail + page wrappers), `name-change-requests` (list + `[id]` detail + page
wrappers), plus a scan of dashboard/users/deals/listings/reports/broadcasts/
platforms for stale verification/payment/privacy claims.

Assets: `public/images/app-screens` and `public/brand` are **empty** — no
screenshots are committed; the marketing site renders a generic phone mockup.

---

## 6. Marketing updates implemented

`app/(marketing)/page.tsx` (homepage):

```text
- Added one safety note: "Optional identity verification keeps selfies private,
  manually reviewed, and off public profiles." (no overclaim; no badge/guarantee).
```

`app/(marketing)/how-it-works/page.tsx`:

```text
- Step 3 ("Talk in chat") clarified to proposal-first: buyers propose first;
  full chat opens once a proposal is accepted and the deal is active; closed/
  cancelled/rejected/completed deals are read-only. (Was implying free chat.)
```

`app/(marketing)/faq/page.tsx`:

```text
- Updated "How does Bantle keep things safe?" — removed the outdated "trust is
  built into the household, not bolted on with a badge" framing; now describes
  email verification + optional private, manually-reviewed identity
  verification + proposal-first chat + reviewed-badge-is-a-signal.
- Added a new Q: "Is my identity verification selfie public?" — answers No
  (private storage, manual short-lived review, never public/marketing, no
  biometric/liveness, no location), linking to the privacy policy.
```

---

## 7. Privacy / terms / safety updates implemented

`app/(marketing)/privacy/page.tsx`:

```text
- "In short": added that an optional identity-verification selfie is stored
  privately, manually reviewed, and never shown on a public profile.
- §2 "Data we collect": added a new "Identity verification data" subsection
  (selfie image → private storage, manual short-lived review, never public/
  marketing; verification status + user-visible review message; no GPS for
  verification; no biometric/liveness/facial-recognition; badge = signal not
  guarantee) and a new "Name-change request data" subsection (requested name,
  status, submitted time; approval may require identity re-verification).
- §3 "How we use your data": added a bullet for manual admin review of
  identity-verification and display-name-change requests the user submits.
- §9 "Security": added a bullet — verification selfies are in private storage,
  not publicly accessible, reviewed manually via short-lived access-controlled
  links.
```

`app/(marketing)/safety/page.tsx`:

```text
- "Verification layers": added an "Identity verification" layer — private
  selfie, manual review via short-lived access, never shown on public profiles
  or used for marketing, no biometric/liveness, no location request, reviewed
  badge is a signal not a guarantee.
```

`app/(marketing)/terms/page.tsx`:

```text
- No change required. The existing terms already cover the payment/no-guarantee
  boundary, the pre-deal safety acknowledgement, provider-rule responsibility,
  and DPDP rights, all consistent with the mobile app. Avoided adding heavier
  legal wording (see §11).
```

---

## 8. Admin UI updates implemented

`app/admin/identity-verifications/[id]/IdentityVerificationDetailClient.tsx`:

```text
- Added a private-asset hint under the selfie image: "Private verification
  asset — review here only. Do not download, screenshot, or share it. Selfies
  are never shown on public profiles."
- Added "Internal only — never shown to the user." under the admin internal
  note field.
- Added "Shown to the user — keep it clear and respectful." under the
  user-visible rejection message field.
```

`app/admin/name-change-requests/[id]/NameChangeRequestDetailClient.tsx`:

```text
- Added the same internal-note and user-visible-rejection-message hints.
```

These are presentational hints only. No API request/response, admin action
semantics, signed-URL handling, retention logic, or returned data changed. The
admin nav already exposes Identity Verification, Name Changes, and Deal
Reputation; the queue list/detail already reflected statuses, signed-URL expiry,
user-visible rejection message, internal note, retention, and the
"approval may require identity re-verification" note — so those needed no change.

---

## 9. DPDP-aware copy review

Checked each public page against the review questions:

```text
1. States what personal data is collected?           Yes (privacy §2, incl. new selfie + name-change subsections).
2. States why it is collected?                        Yes (privacy §3).
3. Distinguishes public vs private verification data? Yes (selfie = private, never public; privacy + safety + FAQ).
4. Avoids implying Bantle processes payments?         Yes (unchanged strong boundary across home/how-it-works/terms/safety/FAQ).
5. Avoids guaranteed access/refund/dispute outcomes?  Yes (unchanged).
6. Avoids biometric/liveness/fraud-proof claims?      Yes (explicitly states none of these).
7. Avoids selfies-are-public/marketing claims?        Yes (explicitly "never public / not used for marketing").
8. Provides a privacy/support/grievance contact?      Yes (existing privacy@ / grievance officer / support@).
9. Avoids analytics-before-consent claims?            Yes (existing copy: PostHog anonymised + Settings opt-out, unchanged).
10. Avoids unsupported legal claims (e.g. "fully DPDP compliant")? Yes — wording kept as "with India DPDP Act 2023 in mind".
```

Wording used: "designed to support clear privacy notice and consent",
"privacy-first" tone, "reviewed badge is a signal, not a guarantee". Avoided:
"biometric", "liveness", "fraud-proof", "100% DPDP compliant", "legally
certified", "guaranteed compliant".

---

## 10. What did not change

```text
- DB schema, migrations, RLS, grants.
- Supabase functions, Edge Functions, backend behavior.
- Admin action semantics, API routes/contracts, service-role usage.
- Authentication/session/middleware logic.
- Dependencies (no package.json / package-lock.json change).
- Brand direction, layout, design system, navigation.
- Marketing terms page, about, refund-policy, community-guidelines, support,
  verify, account-deletion, child-safety-standards (already accurate).
- Admin queue list views, signed-URL/retention logic, status badges.
- public/ assets (no screenshots committed; rendered mockup retained).
- Mobile repo (reference only).
```

---

## 11. Legal review notes

```text
LEGAL REVIEW RECOMMENDED before public re-publication of the privacy policy:
- The new "Identity verification data" and "Name-change request data" notices
  describe collection/purpose/retention of a selfie in plain language. A lawyer
  should confirm the selfie's lawful basis, retention window wording, and
  consent capture meet DPDP Act 2023 expectations for the launch jurisdiction.
- Retention specifics for verification selfies are governed in the backend
  (image_retention_until); the policy describes them generally rather than
  asserting an exact day count. Confirm the stated retention matches operations.
- Copy intentionally says "with India DPDP Act 2023 in mind" / "designed to
  support clear privacy notice and consent" — not a compliance guarantee.
```

No legal conclusion is asserted by this change.

---

## 12. Deferred items

```text
- Marketing screenshots: app-screens/brand asset folders are empty. If real
  in-app screenshots are wanted for marketing, capture approved, non-private
  public marketing assets (no real user PII, no test-account private data) and
  add them separately. TODO — not done here (no clean public assets exist;
  do not commit private/test screenshots).
- Brand-framing nuance: the marketing copy frames Bantle around "household /
  people you already trust", while the mobile app is also a discovery flow
  (buyers find listings, then propose). This pass added proposal-first accuracy
  without rewriting the household framing. A larger brand/positioning decision
  is a separate, founder-led task (out of scope: "do not change brand direction
  unnecessarily").
- Any per-page consent UI / cookie-style banners: not applicable to this static
  marketing site as currently built; not added.
```

---

## 13. Validation results

```text
npx tsc --noEmit   -> PASS (no errors)
npm run lint       -> PASS (eslint ., 0 errors/warnings)
npm run build      -> PASS (next build; all marketing + admin routes compiled)
git diff --check   -> clean (no whitespace errors)

Mobile repo (bantle):
git status --short  -> only pre-existing builds/*.apk deletions (no source change)
git branch          -> feature/face-aligned-selfie-capture (unchanged)
```

---

## 14. Files changed

```text
app/(marketing)/page.tsx
app/(marketing)/privacy/page.tsx
app/(marketing)/safety/page.tsx
app/(marketing)/how-it-works/page.tsx
app/(marketing)/faq/page.tsx
app/admin/identity-verifications/[id]/IdentityVerificationDetailClient.tsx
app/admin/name-change-requests/[id]/NameChangeRequestDetailClient.tsx
reports/WEB_ADMIN_MOBILE_ALIGNMENT_DPDP_UI_POLISH_REPORT.md  (this report)
```

All changes are text/markup. No `.env`, build artifacts, logs, screenshots,
credentials, or generated archives are included.

---

## 15. Risks / blockers

```text
- Low risk. Changes are copy/markup additions and small admin UI hints.
  tsc/lint/build pass; diff-check clean.
- The privacy-policy additions describe a real, shipped mobile feature; they
  should be confirmed by legal counsel before formal re-publication (§11).
- No runtime behavior, data access, or admin action changed, so there is no
  functional regression surface beyond rendering.
```

---

## 16. Next recommended step

```text
1. Founder/legal review of the updated privacy + safety copy (§11) before
   treating it as the published policy.
2. Optionally bump POLICY_EFFECTIVE_DATE / terms version when the policy is
   formally re-published (left unchanged here — this is a copy alignment, and
   the effective-date/version bump is a publishing decision).
3. If marketing screenshots are desired, produce approved public assets and add
   them in a separate change (§12).
4. Commit on feature/trust-verification-admin-queues and open a PR for review.
```
