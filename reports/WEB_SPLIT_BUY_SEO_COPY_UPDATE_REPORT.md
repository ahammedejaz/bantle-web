# Bantle Web — Split-or-Buy Positioning & SEO Copy Update Report

**Document status:** Implementation report (marketing copy/metadata only) + release merge
**Date:** 2026-06-27
**Owner:** Bantle founder / implementation agent (Claude Opus 4.8)
**Web repo:** `/Users/syedejazahammed/Documents/GitHub/bantle-web`
**Feature branch:** `feature/trust-verification-admin-queues`
**Target branch:** `main`
**Mobile repo (source-of-truth recon only, not modified):** `/Users/syedejazahammed/Documents/GitHub/bantle` (`feature/face-aligned-selfie-capture`)

---

## 1. Summary

Updated web marketing/SEO copy to the current mobile architecture: "Split or buy
subscriptions with more trust." Each product claim was verified in mobile source
before publishing. Confirmed claims are stated confidently; the unverifiable
specific "1 deal per week" number was softened to the verified wording ("one
pending or active deal at a time"). Removed the stale "Launching first on
Android, with iOS to follow." wording across all 5 occurrences (both platforms
are now built — app.json buildNumber/versionCode 115).

Marketing copy/metadata only — no DB, RLS, migrations, Supabase/Edge functions,
backend/API, admin behavior, or mobile changes. No ranking guarantees, no banned
claims. `tsc`, `eslint`, `next build`, `git diff --check` pass; then merged to
`main` and pushed.

---

## 2. Branch

```text
Worked on: feature/trust-verification-admin-queues
Merged to: main (--no-ff)
```

---

## 3. Founder request

```text
Reposition to "Split or buy subscriptions with more trust"; explain monthly
sharing AND one-time fixed-duration access; verified-to-list; trust badges
(Identity/Partner/Business); partner/business contact; name change 2/year;
unverified deal limit; remove Android-first wording; highlight differentiators;
keep payment/safety boundaries. Verify each claim in code first.
```

---

## 4. Mobile app recon — evidence table

```text
Claim                          | Evidence (mobile)                                              | Status   | Public copy used
-------------------------------|----------------------------------------------------------------|----------|---------------------------------------------
Monthly sharing exists         | access_type 'monthly' (chat/[id], index, deal/[id])            | YES      | "share a recurring monthly slot"
One-time fixed-duration access | access_type 'one_time' (same files); web prose already covers  | YES      | "buy fixed-duration access when validity remains"
Listing requires verification  | lib/hostingEligibility.ts HOST_REVIEW_REQUIRED_MESSAGE:        | YES      | "Posting a listing requires identity
                               |   "To post listings ... complete identity verification or get  |          |  verification or an approved business/partner
                               |    approved as a business/partner profile."; RPC can_user_host |          |  profile."
Identity verified badge        | components/trust/TrustBadgeStack.tsx TRUST_BADGE_COPY.identity | YES      | "Identity verified"
Business verified badge        | TRUST_BADGE_COPY.business "Business verified"                   | YES      | "Business verified"
Partner verified badge         | TRUST_BADGE_COPY.partner "Partner verified"                    | YES      | "Partner verified"
Badges are not guarantees      | badge hints: "does not guarantee payment, access, refunds, or  | YES      | "signals ... not guarantees of any outcome"
                               |   deal safety"                                                 |          |
Selfie private/manual/no GPS   | safety/privacy pages + identity-verification.tsx; no biometric | YES      | "private selfie review, manually reviewed,
                               |   /liveness                                                    |          |  no location tracking" (no biometric/liveness)
Name change 2 per year         | lib/nameChangeErrors.ts "limit of 2 approved name changes in   | YES      | "up to 2 approved name changes per year (365 days)"
                               |   365 days"                                                    |          |
Unverified: 1 deal per week    | lib/dealLimitErrors.ts: "limited number of deals" + "one       | PARTIAL  | "limited deal activity — e.g. one pending or
                               |   pending or active deal at a time"; exact weekly number is     |          |  active deal at a time" (no specific weekly
                               |   server-enforced, NOT in client code                          |          |  number stated)
Proposal-first chat            | app/listing/[id].tsx "Chat starts after your deal request.";   | YES      | "Buyers propose first; chat opens after a
                               |   how-it-works prose "Buyers propose first ... chat opens"      |          |  deal request or accepted proposal"
Both iOS and Android built     | app.json ios.buildNumber 115 + android.versionCode 115         | YES      | "preparing early access across Android and iOS"
Partner/business can sell      | HOST_REVIEW_REQUIRED_SECONDARY "Business and partner profiles  | YES      | "reach out to be reviewed at support@bantle.in"
                               |   can be reviewed by Bantle"                                   |          |
```

---

## 5. Web copy / metadata recon

```text
- lib/constants.ts: TAGLINE was "Split subscriptions with more trust." (split-only);
  SITE_DESCRIPTION stale; keywords household-only.
- app/layout.tsx: title/OG/Twitter built from TAGLINE/SITE_DESCRIPTION (auto-update).
- HeroSection.tsx: split-only H1 + "Launching first on Android, with iOS to follow."
- page.tsx: HowItWorks step 1 split-only; SafetyAndLimits missing verified-to-list/
  badges/limits/business-partner.
- one-time access ALREADY explained in how-it-works, faq, refund-policy,
  community-guidelines prose (kept as-is).
- "Launching first/Android-first" in 5 files: HeroSection, verify/VerifyClient,
  faq, opengraph-image, twitter-image.
```

---

## 6. New positioning / title

```text
Tab title:  "Split or buy subscriptions with more trust. | Bantle"
Hero H1:    "Split or buy subscriptions with more trust."
Description:"Bantle helps people split monthly subscriptions or buy fixed-duration
            access with clearer trust signals. Review listings, propose a deal, and
            chat after acceptance while payments stay outside Bantle."
```

---

## 7. Homepage updates

```text
- HeroSection: new H1; subcopy explains share-monthly OR buy-fixed-duration +
  verified sellers + proposal-first + payments outside Bantle; pills ->
  "Split or buy access", "Verified sellers & proposal-first chat", "Payments
  stay outside Bantle"; platform line -> "preparing early access across Android
  and iOS".
- HowItWorks step 1 -> "Discover monthly slots or one-time access" with buy copy.
- SafetyAndLimits notes -> added verified-to-list, three badges (signals not
  guarantees), unverified limited deal activity, business/partner outreach.
```

---

## 8. How-it-works updates

```text
- Homepage HowItWorks step 1 updated (above). The dedicated /how-it-works prose
  page already documents monthly sharing + one-time access and proposal-first
  chat accurately; left intact (no legal rewrite).
```

---

## 9. Safety / FAQ / legal updates

```text
- Safety page: new "Who can list, and trust badges" section — verification to
  list, the three badges (not guarantees), pre-verification limits, and
  business/partner contact (support@bantle.in). Existing identity-verification
  layer unchanged.
- FAQ page: added 5 verified Q&As — verify-to-list, trust badges, pre-verify
  limits, name change (2/year), business/partner selling; fixed device-support
  answer to platform-neutral. Existing one-time/payments answers kept.
- Legal pages (privacy/terms/refund/community-guidelines): not rewritten; they
  already reference one-time access and payments-outside-Bantle accurately.
```

---

## 10. Platform availability wording update

```text
Removed "Launching first on Android, with iOS to follow." everywhere:
- HeroSection.tsx -> "Bantle is preparing early access across Android and iOS."
- verify/VerifyClient.tsx -> same.
- faq device-support answer -> "preparing early access across Android and iOS".
- opengraph-image.tsx + twitter-image.tsx footer -> "Android & iOS · Early access".
Did NOT claim live on App Store/Play Store (store badges remain "coming soon").
```

---

## 11. SEO metadata / JSON-LD updates

```text
- title.default / homepage title.absolute / OG title / Twitter title all derive
  from TAGLINE -> new positioning.
- description / OG description / Twitter description / JSON-LD WebSite description
  derive from SITE_DESCRIPTION -> new description.
- OG/Twitter card image text -> "Split subscriptions with more trust." headline
  (set in a prior pass) + footer platform line updated.
- keywords refreshed naturally (split/sharing/buy/one-time/monthly/verified
  sellers/India) — no stuffing.
- JSON-LD remains a single { "@context": "https://schema.org", "@graph": [...] }
  object (verified in built HTML) — no @context runtime error.
- No ranking promises made.
```

---

## 12. What did not change

```text
- DB, migrations, RLS, Supabase/Edge functions, backend/API, admin behavior,
  auth/middleware, admin session timeout work, service-role usage. Mobile repo.
- Homepage design/layout, components structure, favicon, robots.ts, sitemap.ts.
- Legal meaning of privacy/terms/refund/community-guidelines.
- Dependencies (none added).
```

---

## 13. Validation results

```text
Feature branch:
  npx tsc --noEmit -> PASS
  npm run lint     -> PASS (0 errors/warnings)
  npm run build    -> PASS (44/44 static pages)
  git diff --check -> clean
  Rendered: <title>Split or buy subscriptions with more trust. | Bantle</title>;
  hero "Split or buy subscriptions with more trust"; "Posting a listing requires
  identity verification or an approved business or partner profile"; JSON-LD
  @context+@graph present; NO "Launching first"/"iOS to follow" remaining.

Main branch (post-merge): re-ran tsc/lint/build/diff — see response.

Mobile repo: only pre-existing builds/*.apk deletions; branch unchanged.
```

---

## 14. Files changed

```text
lib/constants.ts                          (TAGLINE + SITE_DESCRIPTION)
app/layout.tsx                            (keywords)
components/HeroSection.tsx                (H1, subcopy, pills, platform line)
app/(marketing)/page.tsx                  (HowItWorks step 1, SafetyAndLimits notes)
app/(marketing)/safety/page.tsx           (new listing-eligibility + badges section)
app/(marketing)/faq/page.tsx              (5 new Q&As + device answer)
app/(marketing)/verify/VerifyClient.tsx   (platform wording)
app/(marketing)/opengraph-image.tsx       (platform footer)
app/(marketing)/twitter-image.tsx         (platform footer)
reports/WEB_SPLIT_BUY_SEO_COPY_UPDATE_REPORT.md  (this report)
```

---

## 15. Main merge / push plan / result

```text
Commit on feature ("fix: update split buy positioning and seo") + push.
git fetch; checkout main (clean); pull --ff-only.
git merge --no-ff feature/trust-verification-admin-queues
  -m "merge: release web marketing and admin updates".
Re-validate on main (tsc/lint/build/diff). Push origin main. (Results in response.)
```

---

## 16. Risks / blockers

```text
- Low risk. Copy/metadata only; build/lint/tsc pass.
- PARTIAL: the specific "1 deal per week" was NOT confirmed in client code (the
  enforced limit is server-side); copy uses the verified "one pending or active
  deal at a time" wording instead. If the founder confirms the exact weekly rule,
  copy can be made more specific later.
- Browser caches title/OG; hard refresh + re-scrape (e.g., social debuggers) to
  see updates. metadataBase/canonical depend on SITE_URL (confirm prod domain).
- SEO improvements do not guarantee search ranking.
```

---

## 17. Next recommended step

```text
1. Founder confirms the exact unverified deal limit (e.g., per-week number) if a
   more specific public statement is wanted.
2. Hard-refresh + re-scrape OG/Twitter to confirm new card/title; confirm prod
   domain in SITE_URL.
3. Deploy main.
```
