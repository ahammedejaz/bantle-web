# Web UI SEO Refresh Report - 20260603_2323

## 1. Starting Web SHA

- `cbf77d17ce3685315f5ca0c4b4336a41120fc2d9`

## 2. Current Web UI Problems Found

- Hero used a hand-built fake mobile app preview (`GenericHomePreview`) that did not match the real Bantle mobile app.
- Header/footer brand treatment used a rounded app icon plus uppercase wordmark, which looked heavier than needed for the web header.
- Homepage had basic SEO metadata but no sitemap, robots route, explicit homepage canonical, or structured data.
- Open Graph image existed, but Twitter image support was not present as a dedicated Next metadata image route.

## 3. Mobile Assets/Screenshots Inspected

- `design-references/final-ui/00_individual_screens_contact_sheet.jpg`
- `design-references/final-ui/01_home_high_res.png`
- `design-references/final-ui/03_post_listing_high_res.png`
- `design-references/final-ui/06_deals_high_res.png`
- `design-references/final-ui/08_profile_high_res.png`
- `design-references/final-ui/09_settings_high_res.png`
- `design-references/AppStore:Playstore/*`
- `assets/images/bantle-logo.png`
- `assets/images/icon.png`

Most full mobile screenshots contained real provider names or sample person names, so only safe full-frame or crop-only sanitized actual UI assets were used.

## 4. Screenshot Assets Used And Why They Are Safe

- `public/images/app-screens/home-overview.png` - crop of the real Home UI showing header/search/categories/safety banner; no provider names or personal data.
- `public/images/app-screens/deals-overview.png` - crop of the real Deals UI showing tabs and outside-payment reminder; no provider names or personal data.
- `public/images/app-screens/listing-details.png` - crop of the real listing form fields; top provider picker and description text were excluded.
- `public/images/app-screens/settings.png` - full real Settings UI; no provider names, personal data, chat, access details, or payment details.

## 5. Logo Source And Final Treatment

- Source checked: mobile `components/ui/BantleLogo.tsx`, `assets/images/bantle-logo.png`, web `components/BrandMark.tsx`, and public brand images.
- Final web treatment: clean text-only `Bantle` wordmark in header/footer/mobile nav. The bulky app-icon box plus uppercase wordmark was removed from web chrome.

## 6. Pages/Components Changed

- `app/(marketing)/page.tsx`
- `app/(marketing)/opengraph-image.tsx`
- `app/(marketing)/twitter-image.tsx`
- `app/layout.tsx`
- `app/robots.ts`
- `app/sitemap.ts`
- `components/BrandMark.tsx`
- `components/HeroSection.tsx`
- `lib/constants.ts`
- `public/images/app-screens/*`

## 7. SEO Changes

- Title: homepage now renders `Household subscription coordination in India | Bantle`.
- Description: shortened to a safe India-first coordination description.
- Open Graph/Twitter: refreshed OG copy and added a dedicated `twitter-image.tsx` metadata route; built HTML emits hash-safe image URLs.
- Canonical: site metadata and homepage metadata use `https://bantle.in`.
- Headings: homepage keeps one clear H1 and adds semantic section headings for how it works, app preview, safety, limits, FAQ, and CTA.
- Alt text: all app screenshots have descriptive alt text.
- Structured data: added accurate low-risk Organization and WebSite JSON-LD only.
- Robots/sitemap: added `/robots.txt` and `/sitemap.xml`; admin/reset/verify utility routes are excluded from robots and not in the sitemap.

## 8. Copy/Legal Safety Notes

- Copy keeps Bantle as coordination-only.
- Users coordinate directly and must follow provider household/family-plan rules.
- Payments stay outside Bantle.
- Bantle does not collect, route, verify, insure, or reverse payments.
- Bantle does not promise access, duration, refunds, compensation, scam recovery, or dispute outcomes.

## 9. Third-Party Provider Names

- No real third-party subscription provider names are used in rendered marketing source copy.
- Selected public screenshot assets were visually inspected and do not show real provider names or personal names.

## 10. No Restricted Changes

- No database changes.
- No Supabase migrations.
- No Edge Function changes.
- No auth changes.
- No mobile app logic changes.
- No payment/deal logic changes.
- No secrets printed or committed.

## 11. Validation Results

- `npm run lint`: passed.
- `npm run build`: passed.
  - Existing warning remains: Next.js middleware convention is deprecated in favor of proxy.
  - Existing warning remains: edge runtime disables static generation for that metadata image route.
- `git diff --check`: passed.
- Policy/copy scan: hits only existing negative legal disclaimers for `guarantee access`; no real provider names found in web source/public filenames.
- Secret scan: hits only environment variable names, comments, and redaction patterns; no secret values printed or committed.
- Image checks: referenced app screenshot paths exist and dimensions are reasonable.

## 12. Visual Review Result

- Direct image inspection completed for selected public screenshot assets.
- Local built server started successfully at `http://localhost:3000`.
- HTTP checks passed for `/`, `/images/app-screens/home-overview.png`, `/robots.txt`, `/sitemap.xml`, `/opengraph-image-pwu6ef`, and `/twitter-image-pwu6ef`.
- Homepage HTML includes canonical, JSON-LD, OG, Twitter, and app screenshot alt text.
- `agent-browser` was not installed, so an interactive browser screenshot/console pass could not be performed in this environment.

## 13. Commit SHA And Push Status

- Commit: `bcf7525`
- Message: `feat(web): refresh marketing UI and SEO`
- Push: `origin/main` updated successfully.

## 14. Syed QA Checklist

- Logo looks clean.
- Actual mobile screenshots are used.
- Fake mobile layout removed.
- Colors match app.
- No risky provider names.
- SEO metadata looks correct.
- No broken images.
- Mobile responsive view.
- Admin still works.
- Reset/verify pages still okay.
