# Bantle Web — Title/Tagline Update & Main Merge Report

**Document status:** Implementation report (marketing metadata/copy only) + release merge
**Date:** 2026-06-27
**Owner:** Bantle founder / implementation agent (Claude Opus 4.8)
**Web repo:** `/Users/syedejazahammed/Documents/GitHub/bantle-web`
**Feature branch:** `feature/trust-verification-admin-queues`
**Target branch:** `main`
**Mobile repo (reference only, not modified):** `/Users/syedejazahammed/Documents/GitHub/bantle`

---

## 1. Summary

Updated the browser tab title and related SEO metadata/taglines to the new
positioning "Split subscriptions with more trust." and a matching description,
then merged the feature branch into `main` and pushed. Founder-pending local
edits (TAGLINE already set; BrandMark logo sizing) were preserved and included.

Marketing metadata/copy only — no DB, RLS, migrations, Supabase/Edge functions,
backend/API, admin behavior, or mobile changes. No banned claims introduced.

---

## 2. Branch

```text
Worked on: feature/trust-verification-admin-queues
Merged to: main (--no-ff)
```

---

## 3. Founder request

```text
Tab title -> "Split subscriptions with more trust."
Matching description -> "Find active subscription slots, review the details, and
propose a deal with clearer trust signals. Bantle keeps chat, safety checks, and
identity verification clear — while payments stay outside Bantle."
Then commit and push to main.
```

---

## 4. Metadata / title / tagline recon

```text
- lib/constants.ts: TAGLINE (already locally changed to the new line) and
  SITE_DESCRIPTION (was stale household copy). BRAND_NAME = "Bantle".
- app/layout.tsx: title.default = `${BRAND_NAME} — ${TAGLINE}`, template "%s |
  Bantle"; OG/Twitter title = `${BRAND_NAME} — ${TAGLINE}`; description =
  SITE_DESCRIPTION.
- app/(marketing)/page.tsx: homepage had a hardcoded STALE title.absolute
  "Bantle — Household subscription access coordination" (overrode the layout for
  the homepage tab); JSON-LD WebSite description uses SITE_DESCRIPTION.
- app/(marketing)/opengraph-image.tsx + twitter-image.tsx: rendered the stale
  headline "Household subscription access coordination." + old subtitle + stale alt.
- components/Footer.tsx: renders `{TAGLINE}. A coordination ...` (would double the
  period now that TAGLINE ends in ".").
- Pre-existing local edits (founder): lib/constants.ts TAGLINE; components/
  BrandMark.tsx logo sizes (md/lg) — preserved.
```

---

## 5. Changes implemented

```text
- lib/constants.ts: SITE_DESCRIPTION -> new description. (TAGLINE already new.)
- app/layout.tsx: title.default -> `${TAGLINE} | ${BRAND_NAME}` =
  "Split subscriptions with more trust. | Bantle"; OG title + Twitter title ->
  same form; description stays SITE_DESCRIPTION (now new).
- app/(marketing)/page.tsx: title.absolute -> `${TAGLINE} | ${BRAND_NAME}`
  (imported TAGLINE); JSON-LD/description inherit the new SITE_DESCRIPTION.
- app/(marketing)/opengraph-image.tsx + twitter-image.tsx: headline ->
  "Split subscriptions with more trust."; subtitle -> shorter new description
  ("Find subscription slots, review details, and propose deals with clearer trust
  signals. Payments stay outside Bantle."); alt -> "Split subscriptions with more
  trust. | Bantle".
- components/Footer.tsx: removed the appended period after {TAGLINE} to avoid
  "..".
- components/BrandMark.tsx: founder's logo-size tweak included (md mark h-7 /
  text 24px / gap-2.5; lg mark h-8 / text 28px / gap-2.5).
```

---

## 6. What did not change

```text
- DB, migrations, RLS, Supabase/Edge functions, backend/API, admin behavior,
  auth/middleware, service-role usage. Mobile repo.
- Homepage design/sections (no redesign). Legal/privacy/safety copy (only the
  stale SEO tagline/description text was updated).
- Dependencies. Favicon assets. robots.ts / sitemap.ts.
```

---

## 7. Validation results

```text
Feature branch:
  npx tsc --noEmit -> PASS
  npm run lint     -> PASS (0 errors/warnings)
  npm run build    -> PASS (44/44 static pages)
  git diff --check -> clean
  Rendered homepage:
    <title>Split subscriptions with more trust. | Bantle</title>
    description = new text; og:title + twitter:title = new title.
    No "Household subscription access coordination" remnants in built app metadata.

Main branch (post-merge): re-ran tsc/lint/build/diff — see §9.

Mobile repo: only pre-existing builds/*.apk deletions; branch unchanged.
```

---

## 8. Files changed

```text
lib/constants.ts                         (SITE_DESCRIPTION; TAGLINE pre-set)
app/layout.tsx                           (default + OG + Twitter titles)
app/(marketing)/page.tsx                 (homepage absolute title + TAGLINE import)
app/(marketing)/opengraph-image.tsx      (headline/subtitle/alt)
app/(marketing)/twitter-image.tsx        (headline/subtitle/alt)
components/Footer.tsx                     (avoid double period)
components/BrandMark.tsx                  (founder logo-size tweak, included)
reports/WEB_TITLE_TAGLINE_MAIN_MERGE_REPORT.md  (this report)
```

---

## 9. Main merge / push steps

```text
git checkout feature/... ; commit "fix: update marketing title and tagline" ; push.
git fetch origin ; git checkout main ; git pull --ff-only origin main.
git merge --no-ff feature/trust-verification-admin-queues -m "merge: release web
  trust and marketing updates".
Re-validate on main (tsc/lint/build/diff). git push origin main.
(See response for exact command results.)
```

---

## 10. Risks / blockers

```text
- Low risk. Metadata/copy only + a brand-size tweak; build/lint/tsc pass.
- Browser favicon/title caches aggressively; a hard refresh shows the new tab title.
- metadataBase/canonical depend on SITE_URL (https://bantle.in) — confirm prod
  domain pre-launch (unchanged here).
```

---

## 11. Next recommended step

```text
1. Founder hard-refreshes to confirm the new tab title and shares a link to check
   the updated OG/Twitter card.
2. Confirm production domain in SITE_URL before go-live.
3. Deploy main.
```
