# Bantle Web Homepage — Light/Cream Modern Refinement Report

**Document status:** Implementation report (marketing homepage UI / styling only)
**Date:** 2026-06-26
**Owner:** Bantle founder / implementation agent (Claude Opus 4.8)
**Web repo:** `/Users/syedejazahammed/Documents/GitHub/bantle-web`
**Web branch:** `feature/trust-verification-admin-queues`
**Mobile repo (assets source, not modified):** `/Users/syedejazahammed/Documents/GitHub/bantle`
**Mobile branch:** `feature/face-aligned-selfie-capture`

---

## 1. Summary

Re-aligned the homepage from the previous full dark/green design back to the
site's light/cream theme so it is consistent with every other marketing page,
while keeping the modern premium structure. The hero now sits on a soft
cream→light-mint gradient with one subtle mint highlight, dark teal headings,
muted body text, and light mint pills. Feature/step/safety/FAQ cards are white
with mint icon circles, subtle borders, and soft shadows. The app-preview card
is kept as a premium deep-teal panel inside a white frame (a small accent, not a
full-page background), and the final CTA remains a deep-teal accent card that
flows into the existing teal footer.

No structure, copy, brand assets, or flow were lost: the Bantle mark, the
HTML/CSS app preview with neutral data, the 5-step discover→review→propose→chat→
pay flow, and all trust/privacy/safety/payment-disclaimer copy remain. This was
styling-only on three homepage files. No admin, DB, backend, RLS, function, API,
auth, middleware, dependency, or asset change. Real mobile screenshots stay
removed. `tsc`, `eslint`, `next build`, and `git diff --check` all pass.

---

## 2. Branch

```text
feature/trust-verification-admin-queues
```

---

## 3. Founder feedback

```text
- Background too green/dark.
- Other pages are white/cream, so the homepage felt inconsistent.
- Direction is good but not fully satisfying.
- Keep homepage in sync with other pages, still modern and attractive.
```

---

## 4. Recon findings

```text
- Previous homepage used full dark section backgrounds (#02211C / #03261F /
  #04231E) with cream text — the source of the inconsistency.
- HeroSection.tsx and FeatureCard.tsx are homepage-only (imported only by
  app/(marketing)/page.tsx) — safe to restyle.
- Shared Header (cream, sticky) and Footer (teal-900) are used by all pages and
  were NOT touched.
- Design tokens available for the light system: cream #FAFBFA / cream-card #FFF,
  teal-100 #E6F7EF, teal-500 #007E5A, teal-600/700/900, ink #102622, ink-muted
  #68726F, line #E6ECE9, rounded-card 14px.
- No active screenshot references in app/components/public.
```

---

## 5. Light/cream redesign changes

```text
Hero (HeroSection.tsx):
- Background: bg-gradient-to-b from-teal-50 via-cream to-cream + one subtle
  teal-200/40 blurred highlight (no heavy dark/green page background, no blob
  cluster).
- Eyebrow pill: border-teal-200 bg-teal-50 text-teal-700.
- Headline: text-teal-900 with "more trust" accent in text-teal-500.
- Body: text-ink-muted. Trust pills: light mint (teal-50/200) with teal-600 icons.
- App preview: white outer frame (bg-white border-line shadow) wrapping the
  premium deep-teal (#04332B) screen panel — deep teal kept only as an accent
  inside a light container, with cream text legibly on the dark panel.

Sections (page.tsx):
- Removed all dark section backgrounds; sections use the site pattern
  (border-t border-line, alternating bg-cream-card).
- Eyebrows text-teal-600; headings text-teal-900; body text-ink-muted.
- WhyBantle: light FeatureCards.
- HowItWorks: white step cards, mint numbered badges (bg-teal-100 text-teal-900),
  teal-700 icons.
- AppPreview: white cards with mint icon circles.
- SafetyAndLimits: light section, white "What Bantle does not do" card, dark text.
- FAQPreview: white cards.
- ComingSoonCTA: kept bg-teal-900 deep-teal accent card (flows into footer).

FeatureCard.tsx:
- Reverted to light: bg-cream-card, border-line, soft shadow, bg-teal-100 icon
  circle, text-teal-900 title, text-ink-muted body.
```

---

## 6. Bantle brand / logo usage

```text
- Hero app-preview still renders public/brand/bantle-mark.png (mint "B" mark,
  copied earlier from the mobile repo). No new asset added or removed.
- Shared CSS BrandMark in Header/Footer unchanged.
```

---

## 7. Mobile architecture copy preserved

```text
- Buyers propose first (HowItWorks step 3, SafetyAndLimits, FAQ).
- Chat opens after a deal request / accepted proposal (hero preview, HowItWorks
  step 4, AppPreview, SafetyAndLimits, FAQ).
- Identity verification private, manually reviewed, off public profiles, no
  location tracking (SafetyAndLimits + hero footnote).
- Reviewed/verified badges are trust signals, not guarantees (SafetyAndLimits).
- Bantle does not collect/hold/route/verify/insure/reverse payments and does not
  promise access/duration/refunds/compensation/scam-recovery/dispute outcomes
  (SafetyAndLimits, verbatim).
- Users verify details before paying outside Bantle (HowItWorks step 5).
No banned claims (no "fraud-proof"/"biometric"/"liveness"/"100% DPDP compliant",
no payment-processing or guarantee claims).
```

---

## 8. Screenshot removal preserved

```text
- public/images/app-screens/home-popular-listings.jpg — stays removed.
- public/images/app-screens/listing-detail-propose-deal.jpg — stays removed.
- Verified: 0 references in app/components/public and 0 in prerendered output.
- No real mobile screenshots reintroduced; preview is HTML/CSS with neutral data.
```

---

## 9. Admin untouched confirmation

```text
git status shows NO changes under app/admin, components/admin, lib/admin, admin
API routes, or middleware. Admin is unchanged.
```

---

## 10. What did not change

```text
- Shared Header, Footer, BrandMark, MobileNav, ComingSoonBadges, ui/* primitives.
- All other marketing pages (about, how-it-works, safety, faq, privacy, terms,
  refund-policy, community-guidelines, child-safety-standards, account-deletion,
  support, verify, reset-password, OG/twitter images).
- DB, migrations, RLS, Supabase/Edge functions, backend, API, admin behavior,
  auth/session logic, middleware.
- Dependencies (no package.json / package-lock.json change).
- Theme tokens / tailwind config / globals.css.
- public/brand assets (unchanged); mobile repo (read-only).
```

---

## 11. Validation results

```text
npx tsc --noEmit  -> PASS
npm run lint      -> PASS (eslint ., 0 errors/warnings)
npm run build     -> PASS (Compiled successfully; 44/44 static pages; `/` static)
git diff --check  -> clean

Prerendered .next/server/app/index.html:
- 0 full dark section backgrounds (#02211C/#03261F/#04231E removed).
- Light markers present (from-teal-50, bg-cream-card, text-teal-900); bg-teal-900
  appears only for the CTA accent + shared footer.
- New copy and brand mark intact; 0 screenshot references.

Mobile repo (bantle): only pre-existing builds/*.apk deletions (not mine);
branch feature/face-aligned-selfie-capture unchanged.
```

---

## 12. Files changed

```text
app/(marketing)/page.tsx        (sections restyled dark -> light/cream)
components/HeroSection.tsx       (hero restyled light; deep-teal preview accent)
components/FeatureCard.tsx       (reverted to light card)
reports/WEB_HOMEPAGE_LIGHT_MODERN_REFINEMENT_REPORT.md   (this report)
```

No `.env`, logs, build artifacts, backups, credentials, screenshots, or
unrelated files included.

---

## 13. Risks / blockers

```text
- Low risk. Styling-only on homepage-only files; build/lint/tsc pass; reversible.
- Homepage now matches the light/cream marketing pages; the shared cream Header
  and teal-900 Footer frame it naturally.
- The app-preview panel intentionally keeps a deep-teal interior (premium accent
  inside a white frame). If the founder wants it fully light too, that is a
  small follow-up.
```

---

## 14. Next recommended step

```text
1. Founder visually reviews the light homepage on desktop + mobile web and
   confirms it now reads consistent with the other marketing pages.
2. Optional: lighten the app-preview panel interior if a fully light look is
   preferred (small follow-up).
3. Open a PR on feature/trust-verification-admin-queues for review.
```
