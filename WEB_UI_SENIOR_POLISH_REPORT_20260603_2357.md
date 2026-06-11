# Bantle Web UI Senior Polish Report - 20260603_2357

## 1. Starting web SHA

- Starting SHA: `bcf75256ac059d3489878b0594b560400995792c`
- Final commit: `76d68eae37478eb73ead5afdb75ac7e5a3081712`

## 2. Recon findings

- Web repo had only pre-existing untracked reports/backups before editing.
- Mobile repo was treated as read-only and had no unexpected tracked source changes.
- Current web hero used cropped screenshot tiles plus one settings phone frame.
- Current header logo was a text-only `Bantle` span, so it felt weak and unbranded.
- Current public screenshot assets were safe enough in isolation but visually cropped, blurry/faded at web sizes, and not strong enough for launch.
- Full mobile screenshots in `design-references/final-ui/` showed the current app layout, but most included real provider names or personal-looking sample data.

## 3. Why the previous hero looked bad

- It mixed partial screenshot crops with one tall phone crop, creating an unbalanced right column.
- The cropped assets did not show enough real app context to feel credible.
- The repeated screenshot section lower on the page made the same weak assets more visible.
- The header wordmark had no mark or strong brand treatment.

## 4. Logo treatment chosen

- Inspected the mobile app logo/icon assets.
- Did not use the full app icon in the header because it is visually heavy at small web-header sizes.
- Implemented a compact refined `B` mark plus clean Bantle wordmark in `components/BrandMark.tsx`.
- Header spacing and nav typography were adjusted so the logo stays visible and balanced.

## 5. Screenshot / visual strategy chosen

- Full real screenshots were used as design reference only.
- Public UI now uses a polished generic app-preview composition based on the real app structure:
  - header/search/category chips
  - safety banner
  - generic listing rows
  - bottom nav
  - listing details and coordination-only panels
- Generic labels only: `Household streaming plan`, `Family music plan`, `Cloud storage plan`.
- No real provider/service names are rendered in the app preview.

## 6. Assets used or intentionally not used

- Used no public mobile screenshot assets in the final UI.
- Deleted stale public assets:
  - `public/images/app-screens/home-overview.png`
  - `public/images/app-screens/deals-overview.png`
  - `public/images/app-screens/listing-details.png`
  - `public/images/app-screens/settings.png`
  - `public/brand/bantle-settings-screen.png`
  - `public/brand/bantle-app-icon.png`
- Existing generated app icons remain under `app/icon.svg` and `app/apple-icon.svg`.

## 7. Pages/components changed

- `components/HeroSection.tsx`
- `components/BrandMark.tsx`
- `components/Header.tsx`
- `components/Footer.tsx`
- `components/ComingSoonBadges.tsx`
- `app/(marketing)/page.tsx`
- `app/(marketing)/opengraph-image.tsx`
- `app/(marketing)/twitter-image.tsx`
- `app/globals.css`
- `lib/constants.ts`
- Legal/FAQ copy wording tightened in:
  - `app/(marketing)/about/page.tsx`
  - `app/(marketing)/faq/page.tsx`
  - `app/(marketing)/how-it-works/page.tsx`
  - `app/(marketing)/refund-policy/page.tsx`
  - `app/(marketing)/safety/page.tsx`
  - `app/(marketing)/terms/page.tsx`

## 8. SEO changes

- Title: `Bantle - Household subscription access coordination` in browser-compatible rendering as `Bantle — Household subscription access coordination`.
- Description: updated to safe coordination-only wording.
- Canonical remains `https://bantle.in`.
- Open Graph/Twitter title, description, image alt text updated.
- Homepage uses one clear H1.
- App-preview internal labels were changed away from heading tags to avoid fake heading levels.
- Structured data remains accurate and low-risk: `Organization` and `WebSite`.
- No ratings, reviews, downloads, pricing, or app availability claims were added.

## 9. Copy/legal safety notes

- Kept Bantle as coordination-only.
- Copy says users follow provider rules.
- Copy says payments stay outside Bantle.
- Copy avoids payment processing, verification, escrow, wallet, checkout, refunds, guaranteed access, or guaranteed duration claims.
- Replaced scan-sensitive negative wording like `guarantee access` with `promise access` while preserving the same legal boundary.

## 10. Real third-party provider names

- Source policy scan is clean for the requested forbidden provider/service terms.
- Rendered homepage scan showed only `Apple Color Emoji` from the generated font fallback stack, not visible marketing copy.
- No real third-party provider names are rendered in the marketing UI preview.

## 11. No restricted changes

- No database changes.
- No Supabase migrations.
- No Edge Function changes.
- No auth changes.
- No mobile app code changes.
- No service_role rotation.
- No payment/deal logic changes.
- No secrets printed or committed.

## 12. Validation

- `npm run lint`: passed.
- `npm run build`: passed.
  - Existing warnings observed: Next.js middleware-to-proxy warning, edge-runtime static-generation warning for OG/Twitter image routes, Node type-stripping experimental warning.
- `git diff --check`: passed.
- Policy/copy scan: clean.
- Secret scan: only existing env-var names and redaction helpers found; no secret values printed.
- Asset check: no references to deleted screenshot assets; OG/Twitter/icon routes compile.

## 13. Visual review result

- `agent-browser` was not installed, so automated browser screenshots were not available.
- Local `next start` smoke review:
  - `/` returned 200 by HEAD.
  - Homepage GET saved to `/tmp/bantle-web-home.html` with 115331 bytes.
  - Homepage rendered the new title, hero headline, and generic plan labels.
  - `/reset-password` returned 200.
  - `/verify` returned 200.
  - `/robots.txt` returned 200.
  - `/sitemap.xml` returned 200.
  - OG image route returned 200 image/png.
  - Twitter image route returned 200 image/png.
- `/admin/login` returned 500 locally because Supabase env vars are not configured in this shell. Admin routes compiled in the production build; local functional validation needs the admin env.

## 14. Commit and push

- Commit: `76d68eae37478eb73ead5afdb75ac7e5a3081712`
- Message: `feat(web): polish marketing UI and SEO`
- Push status: pushed to `origin/main`.

## 15. Syed QA checklist

- Logo visible and polished.
- Hero looks professional and balanced.
- App visual no longer uses the bad cropped screenshot collage.
- Generic preview is readable and aligned.
- No risky provider names in rendered marketing UI.
- Desktop responsive view.
- Mobile responsive view.
- SEO metadata correct.
- No broken image paths.
- Admin/reset/verify unaffected; reset/verify smoke passed, admin needs local Supabase env for live validation.
