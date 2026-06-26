# Bantle Web — Marketing Animation, SEO & Brand Polish Report

**Document status:** Implementation report (marketing UI / SEO polish only)
**Date:** 2026-06-27
**Owner:** Bantle founder / implementation agent (Claude Opus 4.8)
**Web repo:** `/Users/syedejazahammed/Documents/GitHub/bantle-web`
**Web branch:** `feature/trust-verification-admin-queues`
**Mobile repo (reference only, not modified):** `/Users/syedejazahammed/Documents/GitHub/bantle`

---

## 1. Summary

Final polish pass: enlarged the Bantle brand lockup and tightened the
logo↔wordmark gap to near-zero, added tasteful CSS-only motion (reduced-motion
safe), and audited SEO (already strong) with a small freshness fix. The
remaining gap was residual transparent padding in the mark image; the asset was
re-cropped to its exact glyph box (148×197, zero padding), so a `gap-1.5` now
reads as one unit. The hero app-preview gained a subtle perspective tilt (levels
on hover) and a gentle float; the hero copy fades up on load. All motion is gated
behind `prefers-reduced-motion: no-preference`.

No dependencies added (CSS/Tailwind only). No admin, DB, backend, RLS, function,
API, middleware, or mobile change. Marketing pages stay light/cream; screenshots
stay removed; no copy changed. `tsc`, `eslint`, `next build`, and
`git diff --check` all pass (44/44 static pages); the reduced-motion guard and
keyframes are present in the production CSS bundle.

---

## 2. Branch

```text
feature/trust-verification-admin-queues
```

---

## 3. Founder feedback

```text
1. Add subtle 3D effects and cool animations if possible.
2. Check whether the site is optimized for SEO.
3. Slightly increase the Bantle logo size and Bantle text size.
4. Reduce the space between the logo and the Bantle text even more.
5. Apply the spacing/size refinement to both navbar and footer.
```

---

## 4. Scope

```text
Edited: components/BrandMark.tsx, components/HeroSection.tsx, app/globals.css
        (scoped motion utilities), app/sitemap.ts (freshness), public/brand/
        bantle-mark.png (re-cropped), reports/*.
Not edited: admin, DB/backend/RLS/functions/API, middleware, mobile repo,
            package.json/lock, app/layout.tsx (SEO already complete), Header/Footer
            (brand flows through BrandMark; no edit needed), marketing page files.
```

---

## 5. Logo size / spacing changes

```text
- Root cause of the lingering gap: bantle-mark.png still had ~14px transparent
  left padding. Re-cropped from the original to the exact glyph bounding box ->
  148×197 with 0px padding on all sides.
- BrandMark sizes increased and gap tightened:
    navbar (md): mark h-7 w-7-ish -> h-9 (36px), text 20px -> 23px, gap-2 -> gap-1.5
    footer (lg): mark -> h-11 (44px), text 25px -> 29px, gap-2 (kept)
    sm:          mark h-7, text 20px, gap-1.5
  Wordmark is now font-semibold with tracking-[-0.02em]; rendered height-driven
  (w-auto) at the true 148:197 ratio, no chip/background.
- Same BrandMark drives the desktop navbar, mobile slide-out nav, and footer, so
  the bigger/tighter lockup applies everywhere consistently.
- Hero app-preview header mark updated to the same asset/ratio.
```

---

## 6. 3D / animation / card polish

```text
Added to app/globals.css (CSS-only, no library), all gated behind
@media (prefers-reduced-motion: no-preference):
- @keyframes bantle-float (gentle ±10px translateY, 7s ease-in-out infinite).
- @keyframes bantle-fade-up (opacity + 14px rise, 0.7s) + a delayed variant.
- .bantle-scene (perspective: 1400px), .bantle-tilt (resting
  rotateX(3deg) rotateY(-6deg) that eases to flat on hover over 0.7s).

Applied in HeroSection only:
- Hero copy column: bantle-fade-up on load.
- App-preview: wrapped in a perspective scene; the card has a subtle 3D tilt
  that levels on hover and a slow float; it also fades up (delayed).
- Existing card hover-lift/shadow on FeatureCard, HowItWorks, AppPreview, FAQ,
  Support cards is retained (no change needed).

Safety/performance:
- Motion uses only transform/opacity (GPU-friendly, no layout shift).
- Reduced-motion users get a static, fully-visible layout (verified in built CSS).
- No JS listeners, no scroll/mouse handlers, no dependencies.
- Legal/prose text blocks are not animated.
```

---

## 7. SEO audit findings

```text
Already strong (app/layout.tsx + sitemap.ts + robots.ts + file-based OG/Twitter):
- metadataBase set from SITE_URL; title default + template; description; keywords;
  applicationName/creator/publisher/category/authors; canonical "/".
- Open Graph (type/locale/url/siteName/title/description) and Twitter
  (summary_large_image) configured.
- File-based opengraph-image.tsx and twitter-image.tsx exist in (marketing).
- robots metadata (index/follow + googleBot directives); icons (icon.svg,
  apple-icon.svg).
- Per-page metadata exports (title/description) on content pages.
- app/robots.ts disallows /admin, /admin/, /reset-password, /verify and points
  to sitemap.xml.
- app/sitemap.ts lists only public marketing routes; admin/verify/reset excluded.
- Heading structure: one H1 per page (HeroSection on home, PageHeader elsewhere).
- Brand images use alt="" (decorative, beside the visible "Bantle" wordmark).

Verdict: SEO optimized: YES (already comprehensive); only a freshness nit found.
```

---

## 8. SEO fixes implemented

```text
- sitemap.ts lastModified refreshed 2026-06-03 -> 2026-06-27 (fresher crawl signal).
- Confirmed (no change needed): admin/verify/reset excluded from sitemap + robots;
  metadataBase present; OG/Twitter present; one H1 per page; decorative alt on
  brand images.

Pending / for production confirmation:
- SITE_URL (https://bantle.in) drives metadataBase, canonical, OG, sitemap, robots.
  Confirm this is the final production domain before launch; no env change made.
- Optional future: a web app manifest (PWA) and explicit per-page OG images — not
  required for indexing; deferred to avoid scope creep.
```

---

## 9. Marketing page consistency check

```text
Audited /, how-it-works, safety, privacy, faq, terms, about, support, verify,
refund-policy, community-guidelines, account-deletion, child-safety-standards.
All share the updated Header (bigger/tighter lockup + shadow), Footer (grouped
links + lockup), and PageHeader (mint band); content pages float in white cards
over mint bands. All light/cream, consistent spacing/typography, no dark mismatch.
No per-page edits required this pass; the bigger logo + motion flow through shared
components. /verify and /reset-password remain compact auth screens (unchanged).
```

---

## 10. Admin untouched confirmation

```text
git status shows changes only in components/{BrandMark,HeroSection}, app/globals.css,
app/sitemap.ts, and public/brand/bantle-mark.png. NO changes under app/admin,
components/admin, lib/admin, app/api, or middleware.ts. The globals.css additions
are opt-in utility classes used only on marketing pages; admin does not use them.
```

---

## 11. What did not change

```text
- app/layout.tsx (SEO already complete), Header.tsx, Footer.tsx, FeatureCard.tsx,
  PageHeader.tsx, MobileNav.tsx (brand flows via BrandMark), marketing page files.
- DB, migrations, RLS, Supabase/Edge functions, backend, API, admin, auth,
  middleware. Dependencies. tailwind config / theme tokens.
- robots.ts (already correct). All legal/privacy/safety copy.
- Mobile repo. Removed screenshot assets remain removed. Homepage stays light/cream.
```

---

## 12. Validation results

```text
npx tsc --noEmit  -> PASS
npm run lint      -> PASS (eslint ., 0 errors/warnings)
npm run build     -> PASS (Compiled successfully; 44/44 static pages)
git diff --check  -> clean

Checks:
- Homepage HTML includes bantle-scene/bantle-tilt/bantle-float/bantle-fade-up.
- Production CSS bundle contains @keyframes bantle-float/bantle-fade-up and the
  `@media (prefers-reduced-motion: no-preference)` guard.
- Mark asset cropped to 148×197 (0px padding). Original backed up to /tmp.
- sitemap has 0 admin entries; robots disallows /admin, /verify, /reset-password.

Mobile repo (bantle): only pre-existing builds/*.apk deletions; branch unchanged.
```

---

## 13. Files changed

```text
components/BrandMark.tsx       (bigger mark/text, gap-1.5, 148:197 ratio, semibold)
components/HeroSection.tsx     (perspective tilt + float + fade-up; mark ratio)
app/globals.css                (reduced-motion-gated keyframes + .bantle-* utilities)
app/sitemap.ts                 (lastModified freshness)
public/brand/bantle-mark.png   (re-cropped to zero-padding glyph)
reports/WEB_MARKETING_ANIMATION_SEO_BRAND_POLISH_REPORT.md   (this report)
```

No `.env`, logs, build artifacts, backups, credentials, screenshots, or
unrelated files included.

---

## 14. Risks / blockers

```text
- Low risk. Brand sizing/spacing, CSS-only motion, and a one-line SEO freshness
  change; tsc/lint/build pass; reversible (original mark backed up to /tmp).
- The resting 3D tilt is subtle (rotateX 3°, rotateY -6°) and levels on hover; if
  the founder prefers no resting tilt, removing the .bantle-tilt transform (keeping
  float + fade-up) is a one-line change.
- bantle-icon.png remains unused in public/brand (prior pass); can be removed later.
- metadataBase/canonical depend on SITE_URL — confirm production domain pre-launch.
```

---

## 15. Next recommended step

```text
1. Founder reviews the larger, tighter logo lockup (navbar + footer) and the hero
   motion (float/tilt/fade-up) on desktop + mobile, and with OS "reduce motion" on.
2. Optional: add a PWA manifest and per-page OG images; remove unused bantle-icon.png.
3. Confirm the production domain in SITE_URL, then open a PR.
```
