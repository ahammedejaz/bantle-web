# Web — Terms v3 Conservative Hybrid Sync Report

## 1. Summary

Synced bantle-web to the founder-approved **conservative hybrid** positioning
and bumped Terms to **v3.0**, in coordination with the mobile `TOS_VERSION`
3.0 bump (see `bantle/reports/PHASE_8C10_CHAT_TOS_PUBLIC_REVIEWS_IMPLEMENTATION_REPORT.md`).

Positioning shift: from "household-only coordination" to **"Bantle helps people
split or buy subscription access where the provider's terms allow it; some
family/household plans may require members to live in the same household or
location."** Provider-terms responsibility, no-payment-processing, no
guarantees, not-affiliated, and "trust badges are signals" are all preserved.

Branch: `feature/trust-verification-admin-queues` (was clean before this work).
Validation: `tsc --noEmit`, `eslint .`, and `next build` all pass.

## 2. Files changed

- `lib/tos.ts` — version, date, changelog.
- `app/(marketing)/terms/page.tsx` — household assumptions → hybrid; new
  explicit provider-terms duty.
- `app/(marketing)/faq/page.tsx` — household-only Q rewritten; phone-number Q
  de-householded.
- `app/(marketing)/privacy/page.tsx` — intro framing + one data-list line.
- `reports/WEB_TOS_V3_CONSERVATIVE_HYBRID_SYNC_REPORT.md` — this report.

(`how-it-works` and the landing page already used hybrid "split or buy"
language from prior commits and needed no change.)

## 3. Terms v3 positioning

`lib/tos.ts`: `CURRENT_VERSION` `2.0` → `3.0`; `EFFECTIVE_DATE`
`2026-05-14` → `2026-06-28`; `EFFECTIVE_DATE_DISPLAY` → `28 June 2026`
(matches mobile). `CHANGES_FROM_PREVIOUS` rewritten to describe the
split-or-buy repositioning, the "some plans may require same household/location
— check provider terms" clarification, the attestation change (household →
provider-terms compliance), and the payments-outside / no-guarantee
reaffirmation.

`terms/page.tsx`:
- §3 Authority attestation: "on behalf of the household" → "on behalf of that
  plan".
- §5 Content: "anyone outside your household" → "anyone else without their
  consent".
- §9 Subscription provider terms: rewritten to the hybrid framing — providers
  may require members to be in the same household/location or an approved
  family group; **"You must not use Bantle to list, request, or buy access in a
  way that violates those terms."** Retains not-affiliated + provider-action
  disclaimer.
- §11/§12/§14: "household members"/"household coordination" → "members"/
  "coordination".

## 4. Privacy / Safety / FAQ sync

- `faq`: "Why is Bantle household-only?" → "Does Bantle only work for people in
  the same household?" with a hybrid answer (split or buy where provider terms
  allow; some plans require same address/family group; check provider terms;
  not a tool for bypassing rules). The "Can I share with friends who don't live
  with me?" answer already had correct hybrid language and was kept. Phone-number
  answer: "people in your household" → "people you coordinate a plan with".
- `privacy`: intro "household-coordination app for splitting family-plan
  subscriptions" → "coordination app for splitting or buying subscription
  access where the provider's terms allow it"; "protect each household's
  information" → "each user's"; data list "as a household member" → "as a plan
  member". The existing "no biometric matching, liveness detection, or facial
  recognition" statement and the "India DPDP Act 2023 in mind" notice posture
  were left intact.
- `safety`: existing "signals, not guarantees" and "do not guarantee payment,
  access" language is already correct; illustrative "household member" examples
  were left as-is (not contradictory to the hybrid positioning).

## 5. DPDP-aware notice posture

No compliance claims were introduced. Privacy keeps notice-and-choice framing
("with India DPDP Act 2023 in mind"); no "DPDP compliant"/"certified"/
"guaranteed compliance" wording exists. A targeted grep for
`DPDP compliant|fraud-proof|guaranteed access|guaranteed refund|verified
payment|household-only|not a stranger-discovery network|every member…same
household` over `app/` returns **no matches**.

## 6. What did not change

- Landing page and how-it-works (already hybrid).
- Community guidelines, support, refund-policy, child-safety pages.
- Privacy biometric/liveness/facial-recognition disclaimer and DPDP notice
  posture.
- Any backend, admin, or data handling. Web changes are copy + version only.

## 7. Validation

- `npx tsc --noEmit` → pass.
- `npm run lint` (`eslint .`) → pass (no findings).
- `npm run build` (`next build`) → success; `/terms`, `/privacy`, `/faq`,
  `/safety` prerendered as static content.
- Overclaim/household-only grep → clean.

## 8. Legal review marker

**LEGAL REVIEW REQUIRED before release.** Terms v3.0 is a material
repositioning that, paired with the mobile gate, forces universal user
re-acceptance. Counsel should review the final v3.0 Terms body + the three
mobile attestations for provider-ToS alignment, India DPDP notice posture,
consumer-protection wording, and retention of all no-payment/no-guarantee and
not-affiliated disclaimers. Effective date 2026-06-28 is provisional and must
match the mobile release.

## 9. Rollback plan

`git revert` the web Terms-v3 commit, or restore `CURRENT_VERSION = "2.0"` +
`EFFECTIVE_DATE`/display and the prior page copy. Mobile must be rolled back in
lockstep (restore `TOS_VERSION = '2.0'`) so the gate stops prompting for v3.0.
No data migration is involved on web.
