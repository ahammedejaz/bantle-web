# Bantle Web Homepage — Modern Marketing Redesign Report

**Document status:** Implementation report (marketing homepage UI / asset / copy only)
**Date:** 2026-06-26
**Owner:** Bantle founder / implementation agent (Claude Opus 4.8)
**Web repo:** `/Users/syedejazahammed/Documents/GitHub/bantle-web`
**Web branch:** `feature/trust-verification-admin-queues`
**Mobile repo (assets source, not modified):** `/Users/syedejazahammed/Documents/GitHub/bantle`
**Mobile branch:** `feature/face-aligned-selfie-capture`

---

## 1. Summary

Redesigned the public marketing homepage into a dark, premium, mint-accented
experience that mirrors the current Bantle mobile app. The disliked "See Bantle
in action" section (which embedded two real mobile screenshots containing
personal/test display names) was removed, and the two screenshot assets were
deleted. The hero now uses the real Bantle brand mark (mint "B") copied from the
mobile repo, with a fully HTML/CSS "app preview" built from neutral placeholder
data only — no real screenshots, no personal names, no provider logos.

All sections (hero, why, how-it-works, app preview, safety & limits, FAQ, CTA)
were restyled dark with rounded glass cards, soft mint glow, and the existing
teal brand palette. Architecture- and legal-accurate copy was preserved and
strengthened: discover slots → review details → propose first → chat after the
deal request → private/manual identity verification → payments stay outside
Bantle, with no guarantees.

Scope was strictly the marketing homepage. No admin, DB, backend, RLS, Supabase
function, API, auth, middleware, or dependency change. The shared Header and
Footer were intentionally left untouched so the 14 other (light) marketing
sub-pages keep a consistent header; the Footer is already dark teal-900 and
harmonizes with the dark homepage. `tsc --noEmit`, `eslint`, `next build`, and
`git diff --check` all pass; `/` prerenders static.

---

## 2. Branch

```text
feature/trust-verification-admin-queues
```

---

## 3. Founder issue

Founder disliked the recently added real mobile UI screenshots on the homepage
(they also exposed personal/test display names) and asked for a modern, premium
homepage aligned with the mobile app: dark look, mint/green accent, rounded
cards, trust/safety feel, using Bantle brand assets — homepage only, no
admin/DB/backend/mobile changes.

---

## 4. Recon findings

```text
- Homepage: app/(marketing)/page.tsx rendered HeroSection + SeeInAction (the
  disliked screenshot section) + WhyBantle + HowItWorks + AppPreview +
  SafetyAndLimits + FAQPreview + ComingSoonCTA.
- HeroSection.tsx and FeatureCard.tsx are imported ONLY by the homepage
  (verified via grep) — safe to restyle without affecting other pages.
- Screenshot references existed only in page.tsx (active) and the prior report.
  Assets: public/images/app-screens/{home-popular-listings,listing-detail-propose-deal}.jpg
- Theme tokens (tailwind.config.ts): teal scale incl. 300 #8ED9BF (mint),
  400 #2FB384, 900 #003C34 (deep), cream #FAFBFA. Site body was light cream.
- Shared chrome: Header (cream, sticky) and Footer (teal-900, dark) are used by
  ALL marketing pages → left untouched to avoid regressing the light sub-pages.
- Mobile brand assets (clean, no personal data, 1024x1024):
  assets/images/bantle-logo.png (mint "B" mark on transparent),
  assets/images/icon.png (dark rounded app icon with mint B),
  assets/images/splash-transparent.png (effectively blank → not used).
```

Decision table:

```text
Section          | Action  | Reason                                   | Risk | Files
Header (shared)  | keep    | shared by all pages; cream floating nav  | low  | -
Hero             | rebuild | dark premium + brand mark + CSS preview  | low  | HeroSection.tsx
SeeInAction      | remove  | founder dislikes; exposed test names     | low  | page.tsx, assets
WhyBantle        | restyle | dark glass cards                         | low  | page.tsx, FeatureCard.tsx
HowItWorks       | refine  | add discover→review→propose→chat steps   | low  | page.tsx
AppPreview       | restyle | dark cards; proposal-first wording       | low  | page.tsx
SafetyAndLimits  | refine  | add verification-privacy + badge-signal  | low  | page.tsx
FAQPreview       | restyle | dark cards; chat-after-proposal Q        | low  | page.tsx
ComingSoonCTA    | restyle | dark with mint glow                      | low  | page.tsx
Footer (shared)  | keep    | already dark teal-900; harmonizes        | low  | -
```

---

## 5. Screenshot section removal

```text
- Removed the SeeInAction() section and its render from app/(marketing)/page.tsx.
- Removed the now-orphaned AppPreview sentence that referenced "the screenshots
  above".
- Deleted assets (git rm):
    public/images/app-screens/home-popular-listings.jpg
    public/images/app-screens/listing-detail-propose-deal.jpg
  and removed the empty public/images/app-screens/ directory.
- Verified no remaining references to the screenshots or "See Bantle in action"
  in app/components/public (only the prior historical report mentions them).
```

---

## 6. Bantle logo / assets used

```text
Copied from the mobile repo (read-only) and downscaled to 320x320 with macOS
`sips` (no dependency added) to keep them web-light:

  public/brand/bantle-mark.png   (from bantle-logo.png; mint "B" mark)  ~43 KB
  public/brand/bantle-icon.png   (from icon.png; dark app icon)         ~93 KB

Usage:
  - bantle-mark.png renders in the hero "app preview" top bar (alt="" — it sits
    next to the visible "Bantle" wordmark text, so it is decorative there).
  - bantle-icon.png is copied for future use (e.g., social/app-mark contexts);
    it is a clean, public-safe brand asset.
The existing CSS BrandMark (used in shared Header/Footer) was left as-is.
```

---

## 7. Homepage redesign details

```text
- Dark premium background (#02211C / #03261F / #04231E section bands) with soft
  mint radial glow in the hero and CTA.
- Mint/green accents via existing teal-300/400 tokens; cream text.
- Rounded glass cards (border-white/10, bg-white/[0.04], backdrop-blur).
- Hero: brand-mark + "Coming soon · Made in India" eyebrow, headline
  "Split subscriptions with more trust.", founder-supplied subcopy, three trust
  pills (propose first / payments outside Bantle / private trust verification),
  store badges, and an HTML/CSS app preview.
- App preview (no screenshots): neutral slots only — Prime Video / Music Premium
  / Cloud Storage with ₹120/mo, ₹70/mo, ₹90/mo, "2 slots left", "Verified host"
  chip, a "Propose a deal" button, and "Chat starts after your deal request" +
  "Identity verification is private and manually reviewed" footnotes.
- HowItWorks expanded to 5 steps: Discover slots → Review details → Propose a
  deal (buyers propose first) → Chat after the request → Pay outside Bantle.
- All other sections restyled to the dark system; copy preserved/strengthened.
```

---

## 8. Mobile architecture copy preserved

```text
- "Buyers propose first" — HowItWorks step 3 + SafetyAndLimits + FAQ.
- "Chat opens after a deal request or accepted proposal" — hero preview,
  HowItWorks step 4, AppPreview, SafetyAndLimits, FAQ.
- "Identity verification keeps selfies private, manually reviewed, off public
  profiles, and without location tracking" — SafetyAndLimits + hero footnote.
- "Reviewed and verified badges are trust signals, not guarantees" — SafetyAndLimits.
- "Bantle does not collect, hold, route, verify, insure, or reverse payments" and
  "does not promise access, duration, refunds, compensation, scam recovery, or
  dispute outcomes" — preserved verbatim in SafetyAndLimits.
- Users verify details before paying outside Bantle — HowItWorks step 5.
No banned claims used (no "fraud-proof", "biometric", "liveness",
"100% DPDP compliant", "guaranteed safe"; no payment-processing or guarantee).
```

---

## 9. Privacy / public-asset review

```text
- New public assets are brand-only (mint "B" mark + dark app icon). No personal
  data, no screenshots, no provider logos.
- The two real mobile screenshots (which contained personal/test display names
  flagged in the prior report) were removed from the homepage and deleted.
- The HTML/CSS app preview uses only neutral placeholders approved by the
  founder (Prime Video, Music Premium, Cloud Storage, ₹/mo, slots, Verified
  host). No real names (no "Heena Groups", "Syed Ejaz Ahammed", "syedejaz8470",
  "Danish").
```

---

## 10. Admin untouched confirmation

```text
git status shows NO changes under app/admin, components/admin, lib/admin, admin
API routes, or middleware. Admin layouts, pages, components, navigation, auth,
and action semantics are unchanged.
```

---

## 11. What did not change

```text
- Shared Header and Footer components (kept consistent across all pages).
- BrandMark, MobileNav, ComingSoonBadges, ui/* primitives.
- All other marketing pages (about, how-it-works, safety, faq, privacy, terms,
  refund-policy, community-guidelines, child-safety-standards, account-deletion,
  support, verify, reset-password, opengraph/twitter images).
- DB, migrations, RLS, Supabase/Edge functions, backend, API, admin behavior,
  auth/session logic, middleware.
- Dependencies (no package.json / package-lock.json change).
- Mobile repo (assets read-only).
- Theme tokens / tailwind config / globals.css.
```

---

## 12. Validation results

```text
npx tsc --noEmit  -> PASS
npm run lint      -> PASS (eslint ., 0 errors/warnings)
npm run build     -> PASS (next build; `/` prerendered static)
git diff --check  -> clean
Prerendered .next/server/app/index.html contains the new copy and 0 screenshot
references.

npm run dev: a pre-existing dev server (founder's, PID 37354) was already
running on :3000 (Next 16 blocks a second dev server in the same dir, and it was
not reachable from the tool shell). The only errors in its dev log are
pre-existing dev-only artifacts unrelated to this change: (a) CSP `unsafe-eval`
warnings React emits in dev mode, and (b) a JSON-LD `@context` browser error
from the unchanged structured-data <script> (byte-identical to before this
task). No compile/module errors for page.tsx, HeroSection.tsx, or
FeatureCard.tsx appeared. The production build (authoritative) compiled and
prerendered the homepage cleanly.

Mobile repo (bantle): only pre-existing builds/*.apk deletions (not staged, not
mine); branch feature/face-aligned-selfie-capture unchanged.
```

---

## 13. Files changed

```text
app/(marketing)/page.tsx        (dark redesign; removed SeeInAction; 5-step flow)
components/HeroSection.tsx       (dark premium hero + CSS app preview + brand mark)
components/FeatureCard.tsx       (dark glass card; homepage-only)
public/brand/bantle-mark.png     (added; from mobile bantle-logo.png, 320x320)
public/brand/bantle-icon.png     (added; from mobile icon.png, 320x320)
public/images/app-screens/home-popular-listings.jpg        (deleted)
public/images/app-screens/listing-detail-propose-deal.jpg  (deleted)
reports/WEB_HOMEPAGE_MARKETING_REDESIGN_REPORT.md           (this report)
```

No `.env`, logs, build artifacts, backups, credentials, or unrelated files
included.

---

## 14. Risks / blockers

```text
- Low risk. Homepage-only presentational change; build/lint/tsc pass; reversible.
- The homepage is now dark while the other marketing sub-pages remain light
  (cream). This matches the founder's "homepage only" scope; the shared cream
  Header acts as a light floating nav over the dark hero (intentional). If the
  founder later wants the whole site dark, that is a separate, larger task.
- bantle-icon.png is copied but not yet rendered anywhere; kept as a ready brand
  asset. Remove if unused brand assets should not be committed.
```

---

## 15. Next recommended step

```text
1. Founder visually reviews the dark homepage on desktop + mobile web (Light/Dark
   browser, small screens) and confirms the light sub-pages still look right.
2. Optional: extend the dark/premium treatment to the rest of the marketing
   pages and the shared Header for full-site consistency (separate task).
3. Open a PR on feature/trust-verification-admin-queues for review.
```
