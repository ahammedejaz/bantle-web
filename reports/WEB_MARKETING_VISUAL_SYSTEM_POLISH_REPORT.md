# Bantle Web — Marketing Visual System Polish Report

**Document status:** Implementation report (marketing UI polish only)
**Date:** 2026-06-27
**Owner:** Bantle founder / implementation agent (Claude Opus 4.8)
**Web repo:** `/Users/syedejazahammed/Documents/GitHub/bantle-web`
**Web branch:** `feature/trust-verification-admin-queues`
**Mobile repo (reference only, not modified):** `/Users/syedejazahammed/Documents/GitHub/bantle`

---

## 1. Summary

Refined the public marketing visual system: cleaned up the Bantle logo treatment
and added consistent visual rhythm/depth across the marketing pages while keeping
everything light/cream. The navbar/footer/mobile-nav now show the real Bantle
mint mark with no chip/background and a lighter, tighter "Bantle" wordmark
(font-medium, slight negative tracking) that better matches the mobile app tone.
The homepage app-preview header uses the same clean mark instead of a boxed icon
chip. The shared `PageHeader` became an attractive soft mint-gradient band with a
subtle decorative highlight and a gradient hairline divider, and every content
page now floats its body inside a white rounded card over a gentle mint band, so
the previously flat/white pages have clear partitions and depth.

This was UI-only across the marketing layer (11 marketing pages + 3 shared
marketing components). No admin, DB, backend, RLS, function, API, auth,
middleware, dependency, asset-file, or globals.css change. Real screenshots stay
removed; no personal/test names; all DPDP/privacy/safety/payment-disclaimer/
proposal-first copy preserved verbatim. `tsc`, `eslint`, `next build`, and
`git diff --check` all pass (44/44 static pages).

---

## 2. Branch

```text
feature/trust-verification-admin-queues
```

---

## 3. Founder feedback

```text
- Navbar logo has a background/chip — remove it; keep only the real mark.
- "Bantle" wordmark too bold — follow the cleaner mobile-app tone.
- Apply the same logo/text refinement to the homepage app-preview and footer.
- Other marketing pages are too plain/white — add subtle partitions / rhythm.
- Keep it light/cream; don't go dark; don't touch admin/backend.
```

---

## 4. Scope

```text
Edited (marketing only):
  components/BrandMark.tsx, components/HeroSection.tsx, components/PageHeader.tsx,
  app/(marketing)/{about,privacy,terms,refund-policy,community-guidelines,
  account-deletion,child-safety-standards,safety,how-it-works,faq,support}/page.tsx,
  reports/*.
Not edited: admin, DB/backend/RLS/functions/API, middleware, mobile repo,
  package.json/lock, app/globals.css, app/(marketing)/layout.tsx, Header.tsx,
  Footer.tsx, FeatureCard.tsx (already elevated in the prior pass).
```

---

## 5. Marketing component recon

```text
- BrandMark is imported only by Header.tsx, Footer.tsx, and MobileNav.tsx — all
  marketing components. Admin uses its own text branding ("Bantle admin") and does
  NOT import BrandMark/Header/Footer => updating BrandMark is marketing-only.
- Header and Footer are imported only by app/(marketing)/layout.tsx.
- PageHeader is the shared header used by every content page (about, privacy,
  terms, faq, how-it-works, safety, support, refund-policy, community-guidelines,
  account-deletion, child-safety-standards, verify). The homepage uses its own
  HeroSection.
- Content pages share a near-identical body wrapper
  (`<article className="container-x py-12 md:py-16 prose-bantle max-w-3xl">`),
  which made a consistent floating-card treatment safe to apply.
- The chip/background came from BrandMark (CSS box) and the hero preview header
  (an icon chip with ring/shadow around bantle-icon.png).
```

---

## 6. Logo / navbar / footer changes

```text
- BrandMark rewritten: renders the transparent mint mark (public/brand/
  bantle-mark.png) with object-contain and NO chip/box/ring/background. Wordmark
  is now font-medium with tracking-[-0.01em] (was font-semibold); teal-900 on
  light surfaces, cream on the dark footer. Mark sizes preserved (28/32/40px).
- Applies automatically to the desktop navbar (Header), the mobile slide-out nav
  (MobileNav), and the footer (Footer) — all consume BrandMark.
- Homepage app-preview header: replaced the boxed icon chip with the same clean
  mint mark + lighter wordmark.
- Result: bantle-icon.png is no longer referenced anywhere (kept in public/brand
  as an available asset; unused).
```

---

## 7. Homepage visual improvements

```text
- App-preview header de-cluttered to the clean mark + lighter wordmark (no chip).
- Homepage kept light/cream; the previously polished elevated cards, gradient
  icon chips, hover lift, and the light app-style preview (status bar, mint
  activity card, slot rows, gradient "Propose a deal" button, "Chat starts after
  your deal request", "Identity verification is private and manually reviewed")
  remain intact.
```

---

## 8. Other marketing page partition / depth improvements

```text
- PageHeader redesigned (shared, lifts every content page): soft
  from-teal-50→cream gradient band, one subtle blurred mint highlight, an eyebrow
  pill (rounded, bordered, with a mint dot), and a gradient hairline divider into
  the body. Light/cream, not dark.
- Prose content pages (about, privacy, terms, refund-policy, community-guidelines,
  account-deletion, child-safety-standards, safety, how-it-works): body now sits
  in a white rounded-3xl card with a soft shadow, floating over a gentle mint band
  — clear partition + depth without changing any copy.
- FAQ: wrapped in the same mint band; accordion items upgraded to rounded-2xl
  white cards with soft shadow (and a deeper shadow when open).
- Support: wrapped in the mint band; contact cards upgraded to rounded-2xl white
  cards with soft shadow + subtle hover lift.
- About: principle cards re-tinted (bg-cream + soft shadow) so they read as
  layered cards on the new white article surface.
```

---

## 9. Copy / privacy / safety preservation

```text
All copy preserved verbatim (only layout/styling changed). Verified still present:
- Buyers propose first; chat opens after a deal request / accepted proposal.
- Identity verification private, manually reviewed, off public profiles; "does
  not request GPS"; explicit "we do not perform biometric matching, liveness
  detection, or facial recognition" disclaimer (privacy page).
- Reviewed badge is a signal, not a guarantee.
- Bantle does not process/verify/hold payments; payments happen outside Bantle.
- DPDP Act 2023 rights section intact.
No banned claims introduced (no "fraud-proof"/"biometric"/"liveness"/"100% DPDP
compliant"; no payment-processing or guarantee claims).
```

---

## 10. Admin untouched confirmation

```text
git status shows changes only under app/(marketing) and three shared marketing
components (BrandMark, HeroSection, PageHeader). NO changes under app/admin,
components/admin, lib/admin, app/api, or middleware.ts. Admin uses its own
branding and none of the edited components.
```

---

## 11. What did not change

```text
- app/(marketing)/layout.tsx, Header.tsx, Footer.tsx, MobileNav.tsx, FeatureCard.tsx
  (consume the updated BrandMark; not edited this pass).
- app/globals.css, tailwind config, theme tokens.
- DB, migrations, RLS, Supabase/Edge functions, backend, API, admin behavior,
  auth/session logic, middleware.
- Dependencies (no package.json / package-lock.json change).
- public/brand asset files (used as-is; bantle-icon.png now unused but retained).
- All legal/privacy/safety copy; removed screenshot assets remain removed.
- The homepage stayed light/cream; no section was made dark.
```

---

## 12. Validation results

```text
npx tsc --noEmit  -> PASS
npm run lint      -> PASS (eslint ., 0 errors/warnings)
npm run build     -> PASS (Compiled successfully; 44/44 static pages)
git diff --check  -> clean

Spot checks on prerendered HTML:
- Homepage references brand/bantle-mark.png and 0 references to bantle-icon.png
  (chip removed).
- privacy.html shows the mint band (from-teal-50/50) + rounded-3xl content card,
  and preserves DPDP/safety copy ("reviewed manually", "never shown", "does not
  request GPS", "biometric matching, liveness" disclaimer).
- No dark page backgrounds detected.

Mobile repo (bantle): only pre-existing builds/*.apk deletions (not mine);
branch unchanged.
```

---

## 13. Files changed

```text
components/BrandMark.tsx          (clean mark, no chip, lighter wordmark)
components/HeroSection.tsx         (preview header: clean mark, lighter wordmark)
components/PageHeader.tsx          (mint-gradient band + decorative highlight + divider)
app/(marketing)/about/page.tsx                 (floating card + tinted band; tinted principle cards)
app/(marketing)/privacy/page.tsx               (floating card + tinted band)
app/(marketing)/terms/page.tsx                 (floating card + tinted band)
app/(marketing)/refund-policy/page.tsx         (floating card + tinted band)
app/(marketing)/community-guidelines/page.tsx  (floating card + tinted band)
app/(marketing)/account-deletion/page.tsx      (floating card + tinted band)
app/(marketing)/child-safety-standards/page.tsx(floating card + tinted band)
app/(marketing)/safety/page.tsx                (floating card + tinted band)
app/(marketing)/how-it-works/page.tsx          (floating card + tinted band)
app/(marketing)/faq/page.tsx                   (tinted band + elevated accordion cards)
app/(marketing)/support/page.tsx               (tinted band + elevated contact cards)
reports/WEB_MARKETING_VISUAL_SYSTEM_POLISH_REPORT.md   (this report)
```

No `.env`, logs, build artifacts, backups, credentials, screenshots, or
unrelated files included.

---

## 14. Risks / blockers

```text
- Low risk. UI/layout-only across marketing pages + shared marketing components;
  tsc/lint/build pass; reversible. Each prose page change is a mechanical wrapper
  (tinted band + white card) with no copy change.
- bantle-icon.png is now unused (chip removed). Retained as an available brand
  asset; can be deleted in a follow-up if unused assets should not be committed.
- verify/ and reset-password/ pages use short auth-flow articles and were left as
  is (they already render compact cards via PageHeader); they can get the same
  band treatment later if desired.
```

---

## 15. Next recommended step

```text
1. Founder visually reviews the navbar/footer/mobile-nav logo (no chip, lighter
   wordmark) and the content pages (floating cards over mint bands) on desktop +
   mobile web.
2. Optional: apply the band treatment to verify/reset-password, and/or remove the
   now-unused bantle-icon.png.
3. Open a PR on feature/trust-verification-admin-queues for review.
```
