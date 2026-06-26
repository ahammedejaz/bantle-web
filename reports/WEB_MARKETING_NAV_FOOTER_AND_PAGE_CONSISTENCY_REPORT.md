# Bantle Web — Marketing Nav, Footer & Page Consistency Report

**Document status:** Implementation report (marketing UI polish only)
**Date:** 2026-06-27
**Owner:** Bantle founder / implementation agent (Claude Opus 4.8)
**Web repo:** `/Users/syedejazahammed/Documents/GitHub/bantle-web`
**Web branch:** `feature/trust-verification-admin-queues`
**Mobile repo (reference only, not modified):** `/Users/syedejazahammed/Documents/GitHub/bantle`

---

## 1. Summary

Small final polish: fixed the perceived "huge gap" between the Bantle logo and
wordmark in the navbar and footer, added a subtle navbar shadow, and completed
the footer link set into clean groups. The gap was caused by large transparent
padding baked into the mark image (the glyph was only 148px wide, centered in a
320px frame with ~90px side padding), so the fix was to crop the asset to its
content box (now 168×214) and render it height-driven (`w-auto`) with a tight
`gap-2`. The footer now lists every relevant public route in Product / Company /
Legal & policies groups (adding Home, Account deletion, and Child safety
standards). All marketing pages were audited and confirmed already in sync —
they share the updated Header, Footer, and PageHeader, so no per-page edits were
needed.

UI-only across four shared marketing components + one cropped brand asset. No
admin, DB, backend, RLS, function, API, middleware, dependency, or copy change.
Real screenshots stay removed. `tsc`, `eslint`, `next build`, and
`git diff --check` all pass (44/44 static pages).

---

## 2. Branch

```text
feature/trust-verification-admin-queues
```

---

## 3. Founder feedback

```text
- Better now.
- Huge gap between Bantle logo and name in the navbar (and footer).
- Footer does not show all relevant marketing page links.
- Check all marketing pages are in sync with the current design.
- Add a subtle shadow to the navbar.
```

---

## 4. Scope

```text
Edited: components/BrandMark.tsx, components/Header.tsx, components/Footer.tsx,
        components/HeroSection.tsx, public/brand/bantle-mark.png (cropped), reports/*.
Not edited: admin, DB/backend/RLS/functions/API, middleware, mobile repo,
            package.json/lock, globals.css, marketing page files (already in sync).
```

---

## 5. Marketing route / footer link recon

```text
Public routes under app/(marketing): /, how-it-works, safety, faq, about, support,
privacy, terms, refund-policy, community-guidelines, account-deletion,
child-safety-standards, verify, reset-password.

Footer BEFORE: showed NAV_LINKS (About, How it works, Safety, FAQ, Support) +
LEGAL_LINKS (Privacy, Terms, Refund policy, Community guidelines). Missing: Home,
Account deletion, Child safety standards.

Decision: include all browsable marketing/support/legal pages; EXCLUDE /verify and
/reset-password (transactional auth screens reached from email links, not
browsable pages). No admin links included.

Root cause of the brand gap: bantle-mark.png had ~90px/82px transparent side
padding (glyph 148px wide in a 320px frame), so any gap looked large and the mark
looked small.
```

---

## 6. Navbar logo spacing + shadow fix

```text
- BrandMark gap reduced (md gap-2.5 -> gap-2) and the mark is now rendered
  height-driven (h-6/h-7/h-9 with w-auto) against the cropped tight asset, so the
  mark and wordmark read as one lockup. Wordmark stays font-medium, tracking-tight.
- Header: added a subtle elevation
  shadow-[0_4px_20px_-8px_rgba(0,60,52,0.15)] and softened the divider to
  border-teal-900/5; kept sticky top-0, bg-cream/95, and backdrop-blur.
- Mobile nav uses the same BrandMark, so the lockup fix applies there too.
```

---

## 7. Footer logo spacing + link completion

```text
- Footer brand uses the same BrandMark (light, lg) -> same tightened lockup.
- Links reorganized into three groups, all verified to exist on disk:
    Product:           Home, How it works, Safety, FAQ
    Company:           About, Support
    Legal & policies:  Privacy, Terms, Refund policy, Community guidelines,
                       Account deletion, Child safety standards
- Layout: 4-column grid (brand + 3 link columns) on desktop, stacked on mobile.
- /verify and /reset-password intentionally excluded (documented above).
- No admin links added.
```

---

## 8. Marketing page consistency updates

```text
Audited /, how-it-works, safety, privacy, faq, terms, about, support, verify,
refund-policy, community-guidelines, account-deletion, child-safety-standards.

Findings: all pages already share the updated Header (with new shadow + lockup),
Footer (new links + lockup), and PageHeader (mint-gradient band), and the content
pages float in white cards over mint bands from the prior pass. They are visually
in sync, light/cream, with consistent max-width, spacing, and typography. No
homepage dark mismatch. No per-page edits were required this pass (changes flow
through the shared components), keeping the change minimal and reversible.

Note: /verify and /reset-password use compact auth-flow articles (max-w-2xl) and
already render the new PageHeader band; their bodies were left as-is since they
are transactional screens, not marketing content.
```

---

## 9. Screenshot removal preserved

```text
grep for home-popular-listings / listing-detail-propose-deal / "See Bantle in
action" across app/components/public -> no active references. No real screenshots
reintroduced.
```

---

## 10. Architecture / privacy / safety copy preserved

```text
No copy changed this pass (only logo asset, spacing, navbar shadow, and footer
link structure). All proposal-first, chat-after-request, private/manual identity
verification (no GPS, no biometric/liveness), badge-as-signal, payments-outside-
Bantle, and DPDP-aware wording remain intact from prior passes.
```

---

## 11. Admin untouched confirmation

```text
git status shows changes only in components/{BrandMark,Header,Footer,HeroSection}
and public/brand/bantle-mark.png. NO changes under app/admin, components/admin,
lib/admin, app/api, or middleware.ts. BrandMark/Header/Footer are marketing-only
(admin uses its own text branding and does not import them).
```

---

## 12. What did not change

```text
- Marketing page files, app/(marketing)/layout.tsx, PageHeader, FeatureCard,
  MobileNav (consumes the updated BrandMark; not edited).
- lib/constants.ts (footer groups defined inline in Footer; NAV_LINKS/LEGAL_LINKS
  still used by Header and MobileNav).
- DB, migrations, RLS, Supabase/Edge functions, backend, API, admin, auth,
  middleware. Dependencies. globals.css / tailwind config / theme tokens.
- Mobile repo. Removed screenshot assets remain removed.
- All legal/privacy/safety copy. Homepage stayed light/cream.
```

---

## 13. Validation results

```text
npx tsc --noEmit  -> PASS
npm run lint      -> PASS (eslint ., 0 errors/warnings)
npm run build     -> PASS (Compiled successfully; 44/44 static pages)
git diff --check  -> clean

Prerendered HTML checks:
- Footer renders Product / Company / Legal & policies groups with all 11 routes
  plus Home, including Account deletion and Child safety standards.
- Navbar shadow class present.
- 0 screenshot references.

Mark asset: cropped 320x320 -> 168x214 (full glyph retained; side padding ~90px
-> ~14px). Original backed up to /tmp (not committed).

Mobile repo (bantle): only pre-existing builds/*.apk deletions (not mine);
branch unchanged.
```

---

## 14. Files changed

```text
components/BrandMark.tsx       (tighter gap; height-driven mark width; correct ratio)
components/Header.tsx          (subtle elevation shadow; softer divider)
components/Footer.tsx          (tight brand lockup; complete grouped links)
components/HeroSection.tsx     (preview mark height-driven width; tighter)
public/brand/bantle-mark.png   (cropped to remove transparent padding)
reports/WEB_MARKETING_NAV_FOOTER_AND_PAGE_CONSISTENCY_REPORT.md  (this report)
```

No `.env`, logs, build artifacts, backups, credentials, screenshots, or
unrelated files included.

---

## 15. Risks / blockers

```text
- Low risk. Spacing/shadow/asset-crop + footer link structure only; tsc/lint/build
  pass; reversible (original mark backed up to /tmp).
- bantle-icon.png remains unused in public/brand (from a prior pass); can be
  deleted in a follow-up if unused assets should not be committed.
```

---

## 16. Next recommended step

```text
1. Founder reviews the navbar/footer lockup (logo + name tight), the navbar
   shadow, and the completed footer links on desktop + mobile web.
2. Optional: give /verify and /reset-password the same band/card treatment, and
   remove the unused bantle-icon.png.
3. Open a PR on feature/trust-verification-admin-queues for review.
```
