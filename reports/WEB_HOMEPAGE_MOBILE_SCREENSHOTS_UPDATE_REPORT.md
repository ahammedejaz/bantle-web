# Bantle Web Homepage — Current Mobile Screenshots Update Report

**Document status:** Implementation report (UI/asset/copy-only)
**Date:** 2026-06-26
**Owner:** Bantle founder / implementation agent (Claude Opus 4.8)
**Web repo:** `/Users/syedejazahammed/Documents/GitHub/bantle-web`
**Web branch:** `feature/trust-verification-admin-queues`
**Mobile repo (assets source, not modified):** `/Users/syedejazahammed/Documents/GitHub/bantle`
**Mobile branch:** `feature/face-aligned-selfie-capture`

---

## 1. Summary

Added the two founder-requested current mobile screens to the marketing
homepage in a new, self-contained "See Bantle in action" section: the Home
feed (activity + popular listings) and the Listing detail (Microsoft 365
Family, ₹120/month, Propose a deal). The screenshots are shown in rounded
phone-frame cards that reuse the existing design tokens, are responsive
(single column on mobile, two columns from `sm`), and carry alt text. Copy is
aligned with the current proposal-first architecture ("Chat opens after a deal
request"). No payment-processing, guaranteed-outcome, pre-proposal-chat, or
"fraud-proof" claims were introduced.

This was UI/asset/copy only. No DB, backend, API, RLS, Supabase function, auth,
admin, or dependency change. `tsc --noEmit`, `eslint`, `next build`, and
`git diff --check` all pass. The mobile repo was not modified.

---

## 2. Branch

```text
feature/trust-verification-admin-queues
```

---

## 3. Screenshots located

Found in the mobile repo screenshot folder (the source the founder pointed to):

```text
/Users/syedejazahammed/Documents/GitHub/bantle/screenshots/Home.jpg   (757 x 1536)
/Users/syedejazahammed/Documents/GitHub/bantle/screenshots/Deal.jpg   (762 x 1536)
```

Both visually verified to match the founder's request exactly:

```text
Home.jpg -> Home screen: "ACTIVITY" card (₹385/month across 5 active deals),
            "Popular listings" (Prime Video, SonyLIV Premium, Playstation Plus,
            YouTube Music Premium), bottom tab bar (Home / Deals / + / Chat / Profile).
Deal.jpg -> Listing detail: Microsoft 365 Family, ₹120/month, "3 months",
            "1 slot left", "Work", Host profile (5.0 ★ (2)), "About this listing",
            "Propose a deal" CTA, and "Chat starts after your deal request."
```

Other images present but NOT used: `screenshots/.DS_Store` (OS metadata) and
`rca-screenshots/01_home.png` (debugging artifact). Only the two relevant JPGs
were copied.

---

## 4. Asset paths added

```text
public/images/app-screens/home-popular-listings.jpg      (from screenshots/Home.jpg)
public/images/app-screens/listing-detail-propose-deal.jpg (from screenshots/Deal.jpg)
```

`public/images/app-screens/` already existed (was empty). CSP already allows
`img-src 'self'`, so local assets render without config changes.

---

## 5. Homepage section/component changed

`app/(marketing)/page.tsx` only:

```text
- Added a new local section function `SeeInAction()` rendering the two
  screenshots in rounded phone-frame cards (matching the existing HeroSection
  phone-frame styling: rounded-[38px] border, inner rounded-[30px], shadow).
- Rendered <SeeInAction /> directly after <HeroSection /> and before <WhyBantle />.
- Plain <img> with explicit width/height + loading="lazy" (next/image is not
  used anywhere on this site; this matches the existing admin <img> pattern and
  prevents layout shift). One scoped eslint-disable for @next/next/no-img-element.
```

No other component, the hero mockup, layout, navigation, or design tokens were
changed.

---

## 6. Copy added/changed

Added (new section):

```text
Eyebrow:   "See Bantle in action"
Heading:   "Browse, review, then propose a deal."
Subtitle:  "Browse active subscription slots, review the details, and propose a
            deal when everything looks right. Chat opens after a deal request."
Card 1:    "Home feed" — "Discover popular listings and compare monthly slots at a glance."
Card 2:    "Listing details" — "Review the host, price, commitment, and
            availability, then propose a deal. Chat starts after your deal request."
```

Changed (one sentence, to avoid a contradiction created by adding real
screenshots):

```text
AppPreview intro, was: "The launch page uses generic examples so provider names
  and private user context stay off the public website."
now:            "These highlights mirror the real Bantle app flow shown in the
                 screenshots above."
```

Copy rules honored: no payment-processing claim, no guaranteed access/refund/
outcome, no implication of chat before a proposal (explicitly "Chat opens after
a deal request"), no "fraud-proof"/biometric/liveness claim.

---

## 7. What did not change

```text
- HeroSection and its generic phone mockup (kept as-is).
- All other homepage sections (WhyBantle, HowItWorks, AppPreview grid,
  SafetyAndLimits, FAQPreview, ComingSoonCTA) except the one sentence in §6.
- Other marketing/admin pages, layout, header/footer, design system, navigation.
- DB, migrations, RLS, Supabase/Edge functions, backend, API, admin behavior,
  auth/session logic.
- Dependencies (no package.json / package-lock.json change; no next/image config).
- Mobile repo (assets source only).
```

---

## 8. Privacy / public-asset review

```text
- Source: the mobile repo `screenshots/` folder the founder explicitly pointed
  to and asked to display publicly -> treated as founder-approved public
  marketing assets.
- The screenshots DO contain visible display names / listing data, all appearing
  to be the founder's own seed/test data:
    Home.jpg: signed-in name "Heena Groups"; host names "Syed Ejaz Ahammed"
              (the Bantle operator's own name) and username "syedejaz8470";
              listings Prime Video / SonyLIV / Playstation Plus / YouTube Music.
    Deal.jpg: "Microsoft 365 Family", host rating "5.0 (2)", partial host first
              name ("Danish") at the bottom edge.
  No emails, phone numbers, payment details, OTPs, credentials, or selfie/
  identity-verification assets are visible.
- FLAG FOR FOUNDER: the visible display names ("Heena Groups", "Danish",
  "syedejaz8470") look like personal/test account names. They are now public on
  the marketing homepage. If any belongs to a real third party who has not
  consented to public marketing use, swap in screenshots with neutral/seeded
  display names. As provided, these are repo assets the founder requested to
  publish. No private chat-upload images were used.
```

---

## 9. Validation results

```text
npx tsc --noEmit  -> PASS
npm run lint      -> PASS (eslint ., 0 errors/warnings)
npm run build     -> PASS (next build; homepage `/` prerendered static)
git diff --check  -> clean

Mobile repo (bantle):
git status --short -> only pre-existing builds/*.apk deletions (no source change);
                      screenshots/ files were read/copied, not modified.
git branch         -> feature/face-aligned-selfie-capture (unchanged)
```

---

## 10. Files changed

```text
app/(marketing)/page.tsx                                   (new SeeInAction section + 1 sentence)
public/images/app-screens/home-popular-listings.jpg        (added)
public/images/app-screens/listing-detail-propose-deal.jpg  (added)
reports/WEB_HOMEPAGE_MOBILE_SCREENSHOTS_UPDATE_REPORT.md    (this report)
```

No `.env`, logs, build artifacts, backups, credentials, or unrelated files
included.

---

## 11. Risks / blockers

```text
- Low risk. One new presentational section + two static assets + one sentence.
  tsc/lint/build pass; diff-check clean; reversible.
- Privacy: visible test/display names are now public (see §8). Founder should
  confirm they are acceptable for public marketing or request neutral-name
  reshoots.
- Image weight is modest (~131 KB + ~88 KB JPG). If page-weight budget matters,
  a future pass could convert to optimized WebP or adopt next/image.
```

---

## 12. Next recommended step

```text
1. Founder confirms the visible display names in the screenshots are acceptable
   for public marketing (or provides neutral-name versions to drop in at the
   same asset paths).
2. Optional: convert the two JPGs to WebP and/or adopt next/image for automatic
   optimization, if site performance budget warrants it (separate change).
3. Open a PR on feature/trust-verification-admin-queues for review.
```
