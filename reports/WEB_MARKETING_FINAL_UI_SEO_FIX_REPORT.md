# Bantle Web — Marketing Final UI & SEO Fix Report

**Document status:** Implementation report (marketing UI / SEO bug fixes only)
**Date:** 2026-06-27
**Owner:** Bantle founder / implementation agent (Claude Opus 4.8)
**Web repo:** `/Users/syedejazahammed/Documents/GitHub/bantle-web`
**Web branch:** `feature/trust-verification-admin-queues`
**Mobile repo (reference only, not modified):** `/Users/syedejazahammed/Documents/GitHub/bantle`

---

## 1. Summary

Focused bug-fix pass addressing the founder's exact issues: replaced the old
text-"B" favicon with the real Bantle icon, tightened/enlarged the brand lockup
(size up, weight back to medium), made the How-it-works cards compact and
balanced, fixed the CTA heading line collision, fixed the JSON-LD runtime error,
and silenced the Next scroll-behavior warning. All other marketing pages stay in
sync (changes flow through shared components).

No dependencies added. No admin, DB, backend, RLS, function, API, middleware, or
mobile change. Marketing pages stay light/cream; screenshots stay removed; no
copy changed. `tsc`, `eslint`, `next build`, and `git diff --check` all pass
(static export including new /icon.png and /apple-icon.png routes).

---

## 2. Branch

```text
feature/trust-verification-admin-queues
```

---

## 3. Founder issues

```text
1. Browser tab favicon still old. 2. Navbar lockup: closer, slightly larger logo
+ text, NOT bolder (size not weight). 3. Same in footer. 4. How-it-works cards
too tall/odd. 5. How-it-works spacing/lines colliding. 6. CTA heading line-height
colliding. 7. JSON-LD runtime error: r["@context"].toLowerCase. 8. Next
scroll-behavior: smooth warning. 9. Dev-only eval warning (document). 10. Pages
in sync.
```

---

## 4. Favicon / tab logo fix

```text
- Old icons were app/icon.svg and app/apple-icon.svg (a teal rect with a serif
  italic "B" — the old placeholder), referenced by metadata.icons.
- Replaced via Next file convention with the real Bantle icon:
    app/icon.png       <- public/brand/bantle-icon.png (dark squircle + mint B)
    app/apple-icon.png <- same
  and git-removed app/icon.svg + app/apple-icon.svg.
- Removed the now-stale `icons` block from app/layout.tsx metadata so the file
  convention drives the tags.
- Verified prerendered head:
    <link rel="icon" href="/icon.png?..." sizes="320x320" type="image/png">
    <link rel="apple-touch-icon" href="/apple-icon.png?..." sizes="320x320" ...>
  OG/Twitter file-based images under app/(marketing) are unaffected.
```

---

## 5. Navbar / footer brand lockup fix

```text
- BrandMark: gap reduced to gap-1 (navbar/mobile nav) / gap-1.5 (footer); mark
  enlarged (md h-9 -> h-10 / 40px; footer lg h-11 -> h-12 / 44px; sm h-7); text
  enlarged (md 23 -> 24px; lg 29 -> 30px; sm 21px).
- Weight reduced back to font-medium (was font-semibold) per "larger size, not
  heavier weight"; tracking-[-0.02em]. No font-bold/extrabold used.
- Same BrandMark powers desktop navbar, mobile slide-out nav, and footer, so the
  lockup is consistent everywhere. No chip/background behind the mark.
- (The mark asset is already the zero-padding 148x197 glyph from the prior pass,
  so gap-1 reads as one tight unit.)
```

---

## 6. How-it-works layout fix

```text
Cause: a 5-across grid on lg made cards very narrow, and with stacked
number + icon + title + body + h-full equalization they became tall/awkward.
Fix:
- Grid now: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 — on typical
  laptops cards are 3-across (wider, shorter; 3+2), 5-across only on xl.
- Card compacted: rounded-3xl -> rounded-2xl, p-6 -> p-5, gap-4 -> gap-3.
- Number badge + icon now sit on one horizontal row (was stacked), cutting height.
- Title text-lg -> text-base leading-snug; body leading-7 -> leading-6, 14 -> 13.5px.
- The five steps and payment/proposal wording are unchanged.
- "Read the full walk-through" link spacing now reads connected (cards are shorter).
```

---

## 7. CTA heading line-height / spacing fix

```text
- "Be the first to know when Bantle opens." used a large italic serif at text-5xl
  whose default line-height (~1.0) caused ascender/descender collision across two
  lines.
- Added leading-[1.15] (mobile) and md:leading-[1.12] to the heading; kept the
  light store badges and request-access link spacing. CTA stays the existing
  deep-teal accent section (consistent with footer).
```

---

## 8. JSON-LD error RCA + fix

```text
RCA: app/(marketing)/page.tsx emitted structured data as a BARE ARRAY
  [ {"@context":...,"@type":"Organization"}, {"@context":...,"@type":"WebSite"} ].
A consumer (browser JSON-LD reader/extension or validator) parses the script and
calls r["@context"].toLowerCase() on the top-level value. For an array, r["@context"]
is undefined -> "undefined is not an object (evaluating 'r["@context"].toLowerCase')".

Fix: emit a single valid JSON-LD object with a top-level @context string and the
nodes under @graph:
  { "@context": "https://schema.org", "@graph": [ {Organization}, {WebSite} ] }
Now the top-level @context is a string, so .toLowerCase() succeeds. Verified the
prerendered HTML contains the @context/@graph object and no bare array remains.
This is also the more compatible JSON-LD form and preserves the SEO entities.
```

---

## 9. Scroll-behavior warning fix

```text
- app/globals.css sets `scroll-behavior: smooth` on html. Per Next's guidance,
  added data-scroll-behavior="smooth" to the <html> element in app/layout.tsx
  (least-risky fix; keeps smooth scrolling). Verified present in prerendered HTML.
```

---

## 10. SEO check result

```text
SEO optimized: YES (preserved + improved).
- Favicon/apple-touch-icon now current (real Bantle icon).
- JSON-LD valid (single object, @context + @graph) — fixes the runtime error.
- Title/description/keywords, OG, Twitter, canonical, metadataBase intact.
- robots.ts still disallows /admin, /verify, /reset-password; sitemap lists only
  public routes; admin not indexed.
- One H1 per page; brand images decorative alt="".
Dev-only note: the React "eval()/unsafe-eval" console message appears only in
`next dev` (React dev tooling); the production `next build` is clean and does not
use eval. Documented as dev-only, no action needed.
```

---

## 11. Marketing page consistency check

```text
/, how-it-works, safety, privacy, faq, terms, about, support, verify,
refund-policy, community-guidelines, account-deletion, child-safety-standards all
share the updated Header (new lockup + shadow), Footer (grouped links + lockup),
and PageHeader; content pages float in white cards over mint bands. All light/
cream, no old logo, no screenshots, consistent spacing. No per-page edits needed.
```

---

## 12. Admin untouched confirmation

```text
git status shows changes only in app/(marketing)/page.tsx, app/layout.tsx,
components/BrandMark.tsx, app/icon.png (+), app/apple-icon.png (+),
app/icon.svg (deleted), app/apple-icon.svg (deleted). NO changes under app/admin,
components/admin, lib/admin, app/api, or middleware.ts.
```

---

## 13. What did not change

```text
- Header.tsx, Footer.tsx, HeroSection.tsx, FeatureCard.tsx, PageHeader.tsx,
  MobileNav.tsx (brand flows via BrandMark; not edited this pass).
- DB, migrations, RLS, Supabase/Edge functions, backend, API, admin, auth,
  middleware. Dependencies. tailwind config / theme tokens. robots.ts / sitemap.ts.
- All legal/privacy/safety copy and the five How-it-works steps' meaning.
- Mobile repo. Removed screenshot assets remain removed. Pages stay light/cream.
```

---

## 14. Validation results

```text
npx tsc --noEmit  -> PASS
npm run lint      -> PASS (eslint ., 0 errors/warnings)
npm run build     -> PASS (Compiled successfully; static; /icon.png + /apple-icon.png
                    routes emitted)
git diff --check  -> clean

Prerendered HTML checks:
- <link rel="icon" href="/icon.png" ...> and apple-touch-icon present (real icon).
- <html ... data-scroll-behavior="smooth"> present.
- JSON-LD = {"@context":"https://schema.org","@graph":[...]} (no bare array).
- No stale icon.svg/apple-icon.svg references in app/components.
- BrandMark uses font-medium (no font-bold/extrabold), gap-1.

Mobile repo (bantle): only pre-existing builds/*.apk deletions; branch unchanged.
```

---

## 15. Files changed

```text
app/(marketing)/page.tsx   (JSON-LD @graph fix; compact How-it-works grid/cards; CTA leading)
app/layout.tsx             (removed stale icons block; data-scroll-behavior on html)
components/BrandMark.tsx    (gap-1, larger mark/text, font-medium not semibold)
app/icon.png               (added; real Bantle icon)
app/apple-icon.png         (added; real Bantle icon)
app/icon.svg               (removed; old placeholder)
app/apple-icon.svg         (removed; old placeholder)
reports/WEB_MARKETING_FINAL_UI_SEO_FIX_REPORT.md   (this report)
```

No `.env`, logs, build artifacts, backups, credentials, screenshots, or
unrelated files included.

---

## 16. Risks / blockers

```text
- Low risk. Targeted fixes; tsc/lint/build pass; reversible.
- The @context error originated from how a JSON-LD consumer reads the script; the
  @graph form is standards-compliant and fixes it regardless of consumer.
- Favicon is a 320x320 PNG (browsers downscale fine); a multi-size .ico could be
  added later but is not required.
- The dev-only eval/unsafe-eval console message is from React dev mode; production
  build is clean.
```

---

## 17. Next recommended step

```text
1. Founder hard-refreshes (favicons cache aggressively) and confirms the new tab
   icon, the tighter/larger lockup, the compact How-it-works cards, and the CTA
   heading on desktop + mobile, and that the console @context + scroll-behavior
   warnings are gone.
2. Optional: add a multi-size favicon.ico and a PWA manifest; remove the now-unused
   nothing (icon.png is in use).
3. Open a PR on feature/trust-verification-admin-queues for review.
```
