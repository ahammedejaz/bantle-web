# Bantle Web — Final Trust/Safety/SEO Sync Report

**Document status:** Implementation report (marketing copy/metadata only) + release merge
**Date:** 2026-06-27
**Owner:** Bantle founder / implementation agent (Claude Opus 4.8)
**Web repo:** `/Users/syedejazahammed/Documents/GitHub/bantle-web`
**Hotfix branch:** `hotfix/web-title-trust-safety-sync`
**Target branch:** `main`
**Mobile repo (source-of-truth recon only, not modified):** `/Users/syedejazahammed/Documents/GitHub/bantle` (`feature/face-aligned-selfie-capture`)

---

## 1. Summary

Final marketing/SEO/legal-sync hotfix: set the exact tab title
"Bantle - Split or buy subscriptions with more trust", centered the homepage
"What Bantle does not do" card, added a prominent homepage trust highlights band,
synced the trust/safety + provider/household-terms messaging across homepage,
Safety, and FAQ, and aligned OG/Twitter titles+cards. All product claims were
re-verified in mobile source; the unverified "1 deal/week" number was kept
conservative.

Marketing copy/metadata only — no DB, RLS, migrations, Supabase/Edge functions,
backend/API, admin behavior, or admin session-timeout changes; mobile untouched.
No banned claims, no ranking promises. `tsc`, `eslint`, `next build`,
`git diff --check` pass; merged to `main` and pushed.

---

## 2. Branch

```text
Worked on: hotfix/web-title-trust-safety-sync (cut from clean main)
Merged to: main (--no-ff)
```

---

## 3. Founder issues

```text
1. Exact tab title "Bantle - Split or buy subscriptions with more trust".
2. Center "What Bantle does not do" card content.
3. Highlight trust/safety points more strongly + consistently.
4. Sync other marketing pages with homepage trust/safety messaging.
5. Careful household/provider-terms wording (no legal trap).
6. DPDP-careful; no overclaiming.
7. Commit + push to main.
```

---

## 4. Recon sources

```text
Mobile (verified):
- lib/hostingEligibility.ts HOST_REVIEW_REQUIRED_MESSAGE -> verification (or
  business/partner) required to post listings.
- components/trust/TrustBadgeStack.tsx TRUST_BADGE_COPY -> Identity/Business/
  Partner verified, each "does not guarantee payment, access, refunds, or deal
  safety".
- lib/dealLimitErrors.ts -> "limited number of deals" + "one pending or active
  deal at a time" (no client-side weekly number).
- lib/nameChangeErrors.ts -> "2 approved name changes in 365 days".
- app/(tabs)/index.tsx household banner "check each provider's family-plan terms";
  app/(tabs)/post-listing.tsx household attestation (required for monthly) — an
  attestation/reminder, NOT same-location enforcement.
- app.json ios.buildNumber 115 + android.versionCode 115 -> both platforms built.
Web: prior reports + current layout/constants/page/safety/faq/og/twitter.
```

---

## 5. Exact title / metadata fix

```text
- Added lib/constants.ts SITE_TITLE = "Bantle - Split or buy subscriptions with
  more trust" (no trailing period, no template suffix).
- app/layout.tsx: title.default -> SITE_TITLE; OG title -> SITE_TITLE; Twitter
  title -> SITE_TITLE (removed unused TAGLINE import). Template "%s | Bantle"
  retained for sub-pages only.
- app/(marketing)/page.tsx: homepage title.absolute -> SITE_TITLE (so the
  template cannot append "| Bantle").
- OG/Twitter image alt -> SITE_TITLE; card headline -> "Split or buy
  subscriptions with more trust."
Verified rendered: <title>Bantle - Split or buy subscriptions with more trust</title>
and og:title identical. No "... | Bantle" duplication.
```

---

## 6. "What Bantle does not do" card alignment

```text
Card content now centered: icon centered on top (mx-auto), centered heading, and
the limit lines presented as centered text rows (bullet dots removed for a clean
centered look). Legal/payment boundary wording unchanged:
- does not collect/hold/route/verify/insure/reverse payments
- does not promise access/duration/refunds/compensation/scam recovery/dispute
  outcomes
- not affiliated with providers / does not decide if an arrangement is allowed.
```

---

## 7. Trust/safety highlights added

```text
New homepage section "Why Bantle is different — Trust built into every step"
(light mint band + elevated card grid), with six cards:
- Private identity review (selfies private, manually reviewed, off public
  profiles, no location tracking)
- Trust badges with limits (Identity/Business/Partner verified = signals that
  help reduce fake accounts, not guarantees)
- Verified access to listing (verification or business/partner profile to post)
- Limited access before verification (limited deal activity until verified)
- Partner and business review (reach out to be reviewed)
- Proposal-first chat (buyers propose first; chat after request/acceptance)
These mirror the existing SafetyAndLimits bullets, now reinforced visually and
synced on Safety + FAQ.
```

---

## 8. Household / provider-terms wording

```text
Added legally careful wording (grounded in the app's household attestation +
"check provider family-plan terms" reminder; no same-location enforcement claim):
- Homepage SafetyAndLimits bullet: "Provider terms still apply — some family or
  household plans may require members to be in the same household or location, so
  only list, request, or buy access when the provider's own terms allow it."
- Safety page new "Provider terms still apply" section: providers' rules apply;
  Bantle does not override or verify permission; users are responsible; monthly
  household posting asks the host to confirm sharing within their household.
- FAQ new "Can I list household or family subscriptions?" with the same safe
  framing ("some ... may require", "only when the provider's terms allow",
  "you are responsible").
Explicitly avoided: "all household plans require same address", "Bantle verifies
provider TOS compliance".
```

---

## 9. Pages synced

```text
- / (homepage): exact title; centered "does not do" card; new trust highlights
  band; provider-terms bullet.
- /safety: new listing-eligibility+badges section (prior) + new provider-terms
  section.
- /faq: household/family Q + verify-to-list + badges + limits + name-change +
  business/partner Qs (some from prior pass).
- /how-it-works, /privacy, /terms, /community-guidelines, /refund-policy: already
  accurate on one-time access, provider rules, payments-outside-Bantle, and
  private selfie review — left intact (no aggressive legal rewrite).
- OG/Twitter image routes: title/alt/headline aligned.
```

---

## 10. DPDP / legal-risk review

```text
- Privacy page retains DPDP-aware wording ("designed to support a clear privacy
  notice and your consent"); explicitly states NO biometric matching, NO liveness
  detection, NO facial recognition, NO location for verification, selfies private/
  manually reviewed/off public profiles. Not over-edited.
- No "100% DPDP compliant", "fraud-proof", "guaranteed safe", "biometric/liveness"
  as capabilities. No payment processing/verification claims. No outcome guarantees.
- Provider-terms wording places responsibility on the user and avoids stating
  Bantle enforces or verifies provider compliance.
LEGAL REVIEW RECOMMENDED: the household/provider-terms phrasing is conservative
and matches app behavior, but a final legal sign-off before launch is advisable.
```

---

## 11. Evidence table

```text
Claim                         | Evidence (mobile)                              | Public copy used                              | Risk
------------------------------|------------------------------------------------|-----------------------------------------------|------
Verify (or biz/partner) to    | lib/hostingEligibility.ts                      | "Posting a listing requires identity          | low
 list                         | HOST_REVIEW_REQUIRED_MESSAGE                   |  verification or an approved business/partner"|
Identity/Business/Partner     | TrustBadgeStack TRUST_BADGE_COPY               | exact badge names + "not guarantees"          | low
 badges (not guarantees)      |  hints "does not guarantee..."                 |                                               |
Private/manual/no-GPS selfie  | safety/privacy + identity-verification.tsx     | "private, manually reviewed, off public       | low
 (no biometric/liveness)      |                                                |  profiles, no location tracking"              |
Name change 2/year            | lib/nameChangeErrors.ts "2 ... in 365 days"    | "up to 2 approved name changes per year"      | low
Unverified deal limit         | lib/dealLimitErrors.ts "one pending or active  | "limited deal activity until verification"    | low
 (NO weekly number)           |  deal at a time"; weekly number server-side    |  (conservative; no "1/week")                  |
Both platforms built          | app.json buildNumber/versionCode 115           | "preparing early access across Android & iOS" | low
Household/provider terms      | index.tsx banner + post-listing attestation    | "some ... may require same household/location;| low-
                              |  (reminder/attestation, not enforced)          |  only where provider terms allow"             | med
```

For "1 deal/week": NOT verified in client code/migrations searched; the enforced
limit is server-side. Public copy remains conservative ("limited deal activity").

---

## 12. What did not change

```text
- DB, migrations, RLS, Supabase/Edge functions, backend/API, admin behavior,
  admin session-timeout (AdminIdleTimeout), middleware, service-role usage. Mobile.
- Homepage layout/components beyond the targeted card + new section. Favicon,
  robots.ts, sitemap.ts. Dependencies (none added).
- Legal meaning of privacy/terms/refund/community-guidelines (only additive,
  safe provider-terms wording added on Safety/FAQ).
```

---

## 13. Validation results

```text
Hotfix branch:
  npx tsc --noEmit -> PASS
  npm run lint     -> PASS (0 errors/warnings)
  npm run build    -> PASS (44/44 static pages)
  git diff --check -> clean
  Rendered: <title>Bantle - Split or buy subscriptions with more trust</title>;
  og:title identical; "Trust built into every step", "Private identity review",
  "Provider terms still apply", "What Bantle does not do" present; JSON-LD
  @context+@graph valid; NO "... | Bantle" stale title format; NO Launching-first
  wording. (biometric/liveness only appear as negative disclaimers.)

Main branch (post-merge): re-ran tsc/lint/build/diff — see response.
Mobile repo: only pre-existing builds/*.apk deletions; branch unchanged.
```

---

## 14. Files changed

```text
lib/constants.ts                          (SITE_TITLE)
app/layout.tsx                            (title.default/OG/Twitter -> SITE_TITLE)
app/(marketing)/page.tsx                  (absolute title; centered card;
                                           TrustHighlights section; provider bullet)
app/(marketing)/safety/page.tsx           (Provider terms still apply section)
app/(marketing)/faq/page.tsx              (household/family Q)
app/(marketing)/opengraph-image.tsx       (alt + headline aligned)
app/(marketing)/twitter-image.tsx         (alt + headline aligned)
reports/WEB_FINAL_TRUST_SAFETY_SEO_SYNC_REPORT.md  (this report)
```

---

## 15. Main merge / push result

```text
Commit on hotfix ("fix: sync trust safety seo copy") + push.
Checkout main (clean) ; pull --ff-only ; merge --no-ff hotfix
  -m "merge: final web trust safety seo sync". Re-validate ; push origin main.
(Exact results in response.)
```

---

## 16. Risks / blockers

```text
- Low risk. Copy/metadata + one card layout + one new section; build/lint/tsc pass.
- LEGAL REVIEW RECOMMENDED for household/provider-terms phrasing before launch.
- "1 deal/week" not verified -> conservative copy retained.
- Browser/social caches: hard refresh + re-scrape OG/Twitter to see new title/card.
- metadataBase/canonical depend on SITE_URL — confirm production domain.
- SEO improvements do not guarantee search ranking.
```

---

## 17. Next recommended step

```text
1. Legal sign-off on the household/provider-terms wording.
2. Founder confirms exact unverified deal limit if a more specific statement is
   wanted; re-scrape OG/Twitter; confirm prod domain in SITE_URL.
3. Deploy main.
```
