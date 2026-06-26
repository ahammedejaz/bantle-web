# Bantle Web Homepage — Visual & Logo Polish Report

**Document status:** Implementation report (marketing UI polish only)
**Date:** 2026-06-26
**Owner:** Bantle founder / implementation agent (Claude Opus 4.8)
**Web repo:** `/Users/syedejazahammed/Documents/GitHub/bantle-web`
**Web branch:** `feature/trust-verification-admin-queues`
**Mobile repo (reference only, not modified):** `/Users/syedejazahammed/Documents/GitHub/bantle`

---

## 1. Summary

Polished the light/cream marketing homepage for more premium depth and put the
real Bantle logo into the marketing navbar and footer. Cards across the homepage
now use deeper, softer shadows, `rounded-3xl` corners, gradient mint icon chips,
a hover lift, and a hover accent line. The hero "app preview" was rebuilt as a
realistic, light app-style card (status bar, branded header, mint activity
summary, polished slot rows, and a selected-listing block with a gradient
"Propose a deal" button) using only neutral placeholder data. The shared
marketing `BrandMark` now renders the real Bantle assets: the dark app-icon chip
on the light header/mobile nav and the transparent mint mark on the dark footer.

The page stays light/cream and consistent with the other marketing pages. This
was UI-only across four marketing files. No admin, DB, backend, RLS, function,
API, auth, middleware, dependency, or asset-file change. Real mobile screenshots
remain removed. `tsc`, `eslint`, `next build`, and `git diff --check` all pass.

---

## 2. Branch

```text
feature/trust-verification-admin-queues
```

---

## 3. Founder feedback

```text
- Cards look too dull; add better shadows/depth.
- The app layout shown on the homepage is not aesthetic enough.
- Navbar and footer are not using the actual Bantle logo.
- Do not make the homepage dark again; keep it consistent with white/cream pages.
```

---

## 4. Scope

```text
Edited (marketing only):
  app/(marketing)/page.tsx, components/HeroSection.tsx, components/FeatureCard.tsx,
  components/BrandMark.tsx, reports/*.
Not edited: admin, DB/backend/RLS/functions/API, middleware, mobile repo,
  package.json/lock. Header.tsx/Footer.tsx/layout.tsx not edited — they already
  render BrandMark, so updating BrandMark was sufficient.
```

---

## 5. Navbar / footer logo recon

```text
- BrandMark is imported only by Header.tsx, Footer.tsx, and MobileNav.tsx — all
  marketing components.
- Header and Footer are imported ONLY by app/(marketing)/layout.tsx.
- Admin uses its own text branding ("Bantle admin" in components/admin/AdminNav
  and AdminMobileHeader) and does NOT import BrandMark/Header/Footer.
  => Updating BrandMark is marketing-only and cannot affect admin.
- Assets present: public/brand/bantle-mark.png, public/brand/bantle-icon.png.
- Asset alpha verified by decoding pixels:
    bantle-mark.png  -> transparent corners (clean mint "B"; safe on any bg)
    bantle-icon.png  -> opaque corners (dark app-icon squircle; masked to a chip)
```

---

## 6. Logo / asset changes

```text
- BrandMark rewritten to render real logo images instead of a CSS letter box:
    light=false (header + mobile nav, light bg): bantle-icon.png inside a rounded
      (rounded-[8–11px]) overflow-hidden chip with soft shadow + teal ring; dark
      "Bantle" wordmark.
    light=true (footer, dark teal bg): transparent bantle-mark.png (mint "B");
      cream "Bantle" wordmark.
- Images use alt="" (decorative) because the wrapping links already carry
  aria-label="Bantle home" and the visible "Bantle" wordmark provides the name.
- Sizes preserved (sm 28px / md 32px / lg 40px). Responsive mobile nav uses the
  same BrandMark and still works.
- No new asset copied; no asset removed. No mobile repo change.
```

---

## 7. Card / shadow improvements

```text
- FeatureCard: rounded-3xl, border-teal-900/10, layered soft shadow, hover lift
  (-translate-y-1) + stronger hover shadow + teal-300 hover border, a gradient
  mint icon chip (rounded-2xl, ring), and a hover-reveal mint accent line.
- HowItWorks step cards: rounded-3xl, depth shadow, hover lift, gradient teal
  numbered badge.
- AppPreview cards: rounded-3xl, depth + hover lift, gradient mint icon chip.
- SafetyAndLimits "What Bantle does not do" panel: rounded-3xl, deeper shadow,
  gradient mint icon chip.
- FAQ cards: rounded-3xl, hover lift, mint icon chip behind the question mark.
- All harsh/dull flat shadows replaced with soft layered shadows; no harsh black
  shadows, no dark sections, no heavy glow.
```

---

## 8. App-preview improvements

```text
Rebuilt the hero preview as a light, app-like card (no dark full panel):
- White phone frame (rounded-[40px], ring, big soft shadow) + soft mint halo.
- Cream screen with a status bar (9:41 + indicators).
- Branded header: real bantle-icon chip + "Bantle" / "Trust-ready slots" + bell.
- Mint "Activity" accent card: "₹280/mo savings", "3 active deals",
  "2 pending proposals".
- "Popular slots" rows (white, gradient mint avatars, bookmark):
    Prime Video ₹120/mo · 2 slots left
    Music Premium ₹70/mo · Monthly
    Cloud Storage ₹90/mo · Shared
- Selected listing block: "Microsoft 365 Family", "₹120/month · 2 slots left",
  "Verified host" badge, gradient teal "Propose a deal" button, and
  "Chat starts after your deal request".
- Footer strip: "Identity verification is private and manually reviewed".
All data is neutral placeholder content — no personal/test names, no provider
logos, no real screenshots.
```

---

## 9. Mobile architecture copy preserved

```text
- Buyers propose first (HowItWorks step 3, SafetyAndLimits, FAQ).
- Chat opens after a deal request / accepted proposal (hero preview, HowItWorks
  step 4, AppPreview, SafetyAndLimits, FAQ).
- Identity verification private, manually reviewed, off public profiles, no
  location tracking (SafetyAndLimits + hero footnote).
- Reviewed/verified badges are trust signals, not guarantees (SafetyAndLimits).
- Payments stay outside Bantle; Bantle does not collect/route/verify/insure/
  reverse payments and makes no access/refund/outcome guarantees (hero pills,
  HowItWorks step 5, SafetyAndLimits — verbatim).
No banned claims used (no "fraud-proof"/"biometric"/"liveness"/"100% DPDP
compliant"; no payment-processing or guarantee claims).
```

---

## 10. Admin untouched confirmation

```text
git status shows changes only in app/(marketing)/page.tsx, components/HeroSection
.tsx, components/FeatureCard.tsx, components/BrandMark.tsx (+ this report). NO
changes under app/admin, components/admin, lib/admin, app/api, or middleware.ts.
Admin imports its own branding and none of the edited components.
```

---

## 11. What did not change

```text
- Header.tsx, Footer.tsx, MobileNav.tsx, layout.tsx (consume BrandMark, unchanged).
- All other marketing pages and their copy.
- DB, migrations, RLS, Supabase/Edge functions, backend, API, admin behavior,
  auth/session logic, middleware.
- Dependencies (no package.json / package-lock.json change).
- Theme tokens / tailwind config / globals.css.
- public/brand asset files (used as-is); mobile repo (read-only).
- Navigation links and the removed screenshot assets (still removed).
```

---

## 12. Validation results

```text
npx tsc --noEmit  -> PASS
npm run lint      -> PASS (eslint ., 0 errors/warnings)
npm run build     -> PASS (Compiled successfully; 44/44 static pages; `/` static)
git diff --check  -> clean

Prerendered .next/server/app/index.html:
- References brand/bantle-icon.png (header + mobile nav + hero) and
  brand/bantle-mark.png (footer).
- 0 dark full-section backgrounds; light theme intact.
- Architecture/safety copy intact; 0 screenshot references.

Mobile repo (bantle): only pre-existing builds/*.apk deletions (not mine);
branch unchanged.
```

---

## 13. Files changed

```text
app/(marketing)/page.tsx        (elevated step/preview/safety/FAQ cards)
components/HeroSection.tsx       (light premium app-preview + real icon chip)
components/FeatureCard.tsx       (elevated depth + hover + gradient icon chip)
components/BrandMark.tsx         (real logo: icon chip on light, mint mark on dark)
reports/WEB_HOMEPAGE_VISUAL_AND_LOGO_POLISH_REPORT.md   (this report)
```

No `.env`, logs, build artifacts, backups, credentials, screenshots, or
unrelated files included.

---

## 14. Risks / blockers

```text
- Low risk. UI-only, marketing-only, homepage + shared marketing BrandMark;
  build/lint/tsc pass; reversible.
- BrandMark now renders raster PNGs (32–40px) instead of CSS text; they are
  small (43–93 KB) and crisp at these sizes. If an SVG wordmark is later
  preferred for ultra-crisp scaling, that is a small follow-up.
- "Microsoft 365 Family" appears in the illustrative preview per the founder's
  suggested copy; it is a generic plan name as text (no logo), not personal data.
```

---

## 15. Next recommended step

```text
1. Founder visually reviews the homepage (desktop + mobile web) and the navbar/
   footer logo rendering, including the mobile slide-out nav.
2. Optional: add an SVG version of the mark/wordmark for perfectly crisp scaling
   and slightly lighter payload (small follow-up).
3. Open a PR on feature/trust-verification-admin-queues for review.
```
