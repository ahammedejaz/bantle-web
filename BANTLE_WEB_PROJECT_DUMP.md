# Bantle Web — Project Dump

A comprehensive context document for future Claude Code sessions and contributors working on the bantle-web repository.

Last updated: 2026-05-14

---

## 1. What this is

`bantle-web` is the marketing + legal site for Bantle, served at https://bantle.in. It is a separate codebase from the mobile app (`~/Documents/GitHub/bantle/`).

Bantle is a mobile app for sharing subscription family plans in India — Spotify, YouTube Premium, Apple One, Microsoft 365, etc. The mobile app is the product; this website exists to:

- Explain what Bantle is to non-users (landing, about, how-it-works, safety pages)
- Host legal documents required by India's DPDP Act 2023 and P2P marketplace context (privacy, terms, refund policy, community guidelines)
- Serve as the contact surface (support, faq pages) that the mobile app's Settings screen links into
- Handle post-email-verification UX for Supabase Auth flows (/verify)

The site has no backend, no database, no auth — it is a fully static Next.js site rendered at build time, served from Vercel's edge CDN with the custom domain `bantle.in` (DNS managed at Hostinger, pointed at Vercel).

---

## 2. Tech stack

- **Framework**: Next.js 14.2.35 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4 with custom design tokens
- **UI primitives**: Radix UI dialog (for mobile nav sheet), lucide-react icons
- **Utilities**: `clsx` + `tailwind-merge` (via `cn()` helper in `lib/utils.ts`)
- **Hosting**: Vercel (auto-deploy on push to `main`)
- **Domain**: `bantle.in` via Hostinger DNS pointing at Vercel
- **SSL**: Vercel-managed, auto-renewed
- **No backend, no database, no auth, no analytics yet**

`package.json` scripts:
- `npm run dev` — local dev at http://localhost:3000
- `npm run build` — production build (must pass before commit)
- `npm run start` — serve the built site locally
- `npm run lint` — run Next.js' ESLint config

---

## 3. Project structure

```
.
├── .claude            # Claude Code project-local config (not committed)
├── .vercel            # Vercel CLI metadata (not committed)
├── app                # Next.js App Router pages
│   ├── about
│   ├── community-guidelines
│   ├── faq
│   ├── how-it-works
│   ├── privacy
│   ├── refund-policy
│   ├── safety
│   ├── support
│   ├── terms
│   └── verify         # NEW (added 2026-05-12)
├── components         # Shared React components
│   └── ui             # Lower-level UI primitives (sheet, button)
├── lib                # Constants + utility helpers
└── public             # Static assets (favicons, og images)
```

Top-level files of note:
- `app/layout.tsx` — root layout, font loaders, Header + Footer
- `app/page.tsx` — landing page
- `app/globals.css` — Tailwind layers + custom utilities (`container-x`, `prose-bantle`, `text-balance`)
- `app/icon.svg`, `app/apple-icon.svg`, `app/opengraph-image.tsx` — auto-discovered metadata assets
- `tailwind.config.ts` — design tokens
- `lib/constants.ts` — single source of truth for brand strings, emails, legal identity
- `lib/utils.ts` — `cn()` helper

---

## 4. Pages inventory

| Route | Purpose | Audience |
|-------|---------|----------|
| `/` | Marketing landing — hero, features, comparison vs splitwise/manual | Visitors finding Bantle via search, social, word of mouth |
| `/about` | What Bantle is, why it exists, who's behind it | People evaluating whether to trust the app |
| `/how-it-works` | Step-by-step explanation of the discovery/chat flow | Prospective users wanting more detail before installing |
| `/safety` | Trust & safety stance, what Bantle does + doesn't do | Skeptical or cautious users |
| `/faq` | Common questions. Linked from the mobile app's Settings → Help & FAQ | Existing users hitting friction |
| `/support` | Email contacts (support@, feedback@). Linked from app's Settings buttons | Existing users needing help |
| `/privacy` | DPDP Act 2023 compliant privacy policy, India legal context | Legally required, plus due-diligence visitors |
| `/terms` | P2P marketplace terms of service | Legally required |
| `/refund-policy` | Refund/non-refund policy (Bantle doesn't handle payments) | Legally required |
| `/community-guidelines` | Behavior expectations for users | Mostly referenced from in-app moderation flows |
| `/verify` | Post-email-verification landing for Supabase Auth flows. Smart state detection: shows "Email verified" when URL has Supabase auth params (`token_hash`, `token`, `access_token`, `code`, `type`), shows neutral welcome otherwise. **`noindex`** (no SEO) — added 2026-05-12 | Users clicking verification links from Supabase emails |

All pages share the same `app/layout.tsx` shell (Header + Footer), use sentence case, warm conversational voice, and the same design tokens.

---

## 5. Components inventory

| Component | Purpose |
|-----------|---------|
| `Header.tsx` | Top nav. Logo + nav links (desktop) + mobile menu trigger |
| `Footer.tsx` | Bottom footer. Legal links, brand, copyright |
| `MobileNav.tsx` | Mobile nav sheet (Radix Dialog). Opened from Header on small screens |
| `HeroSection.tsx` | Landing-page hero with phone mock and tagline |
| `FeatureCard.tsx` | Reusable card for landing-page features section |
| `PageHeader.tsx` | Standard hero for non-landing pages. Takes `eyebrow`, `title` (italic serif), `intro`. Used by every page except `/` |
| `ComingSoonBadges.tsx` | Disabled Play Store + App Store badges. Used until the mobile app reaches a public store listing |
| `ui/sheet.tsx` | Radix-based sheet primitive used by MobileNav |
| `ui/button.tsx` | Button variant helpers via class-variance-authority |

When adding a new page, the typical imports are `PageHeader` from `@/components/PageHeader` plus any constants from `@/lib/constants`. Most pages don't need anything else.

---

## 6. Design system (concise summary)

**Color tokens** (defined in `tailwind.config.ts`):

| Token | Hex | Usage |
|-------|-----|-------|
| `teal-900` | `#04342C` | Primary brand color, headlines, primary buttons |
| `teal-700` | `#0A5E48` | Button hover |
| `teal-600` | `#0A7C7C` | Accent / eyebrow text, links |
| `cream` (DEFAULT) | `#FAF5EC` | Page background, button text on dark surfaces |
| `cream-card` | `#FFFDF7` | Elevated card surfaces |
| `line` | `#E5E0D5` | Borders |
| `ink` (DEFAULT) | `#1A1A1A` | Body text |
| `ink-muted` | `#6B6B6B` | Secondary body text |
| `positive` | `#1A7B5C` | (Reserved — not currently used in marketing site) |
| `negative` | `#B94A3C` | (Reserved — not currently used in marketing site) |

Additional `teal` shades (50, 100, 200, 300, 400, 500, 800) are defined but rarely used.

**Typography**:
- Headings: Lora (serif), loaded via `--font-lora` CSS var, weight 500 default
- Hero headlines: `font-serif italic` (Lora italic)
- Body: Inter (sans), loaded via `--font-inter` CSS var, weight 400 default
- Body emphasis: `font-medium` (500) — never use 600 or 700
- Letter-spacing: custom `tightish` token (`-0.01em`) applied to headings

**Layout utilities** (defined in `app/globals.css`):
- `container-x` — mx-auto with `max-w-content` (1200px) and responsive horizontal padding
- `prose-bantle` — opinionated typography for long-form content (p, h2, h3, ul, ol, a, strong)
- `text-balance` / `text-pretty` — text-wrap helpers

**Border radius**:
- `rounded-card` (14px) — cards, primary buttons
- `rounded-button` (12px) — smaller buttons / badges

**Visual rules**:
- No shadows, no gradients, no blur
- Flat design with border-based depth (always `border border-line`)
- Sentence case throughout — never Title Case, never ALL CAPS (except small uppercase eyebrows with `tracking-[0.14em]`)
- Lucide icons only — no emoji in UI

Reference file: `tailwind.config.ts` and `app/globals.css`.

---

## 7. Constants (`lib/constants.ts`)

Single source of truth for brand, email, and legal-identity strings. Always import from here — never hard-code these values in page components.

**Brand**:
- `BRAND_NAME` — "Bantle"
- `TAGLINE` — "Share subscription costs."
- `SITE_URL` — "https://bantle.in"
- `SITE_DESCRIPTION` — full descriptive paragraph

**Email addresses** (all forwarded via ImprovMX catch-all → real inbox):
- `CONTACT_EMAIL` — support@bantle.in
- `FEEDBACK_EMAIL` — feedback@bantle.in
- `PRIVACY_EMAIL` — privacy@bantle.in
- `LEGAL_EMAIL` — legal@bantle.in
- `GRIEVANCE_EMAIL` — grievance@bantle.in

**Legal entity**:
- `COMPANY_NAME` — "Syed Ejaz Ahammed" (operates as a sole proprietor individual, NOT a registered company)
- `JURISDICTION_CITY` — "Bengaluru"
- `GRIEVANCE_OFFICER_NAME` — "Syed Ejaz Ahammed"
- `POSTAL_ADDRESS` — "Bengaluru, Karnataka, India" (generic placeholder until a real address is needed at scale)

**Navigation**:
- `NAV_LINKS` — array of `{ href, label }` for the main nav
- `LEGAL_LINKS` — array of `{ href, label }` for the legal/policy footer

**Policy dates**:
- `POLICY_EFFECTIVE_DATE` — "11 May 2026" (update when privacy or terms is materially changed)

**Update safety:**
- Safe to update standalone: `COMPANY_NAME`, `POSTAL_ADDRESS`, `POLICY_EFFECTIVE_DATE`, the five email constants, `BRAND_NAME`, `TAGLINE`
- Coordinated changes required: `NAV_LINKS` / `LEGAL_LINKS` (the target route must exist), `SITE_URL` (only change if the production domain changes — affects metadata, og-image, etc.)
- Constants that imply legal context: if `COMPANY_NAME` ever changes from an individual's name to a registered company name, the prose in `/privacy` §1 and `/terms` must be reviewed for matching phrasing (sole proprietor language vs. company language)

---

## 8. Deployment

- **Vercel** auto-deploys on every push to `origin/main`. Typical deploy time is 30–60 seconds.
- **Custom domain**: `bantle.in` (apex) — DNS managed at Hostinger, A/AAAA records pointed at Vercel
- **SSL**: managed by Vercel, auto-renewed Let's Encrypt
- **CDN**: Vercel's edge network. Static pages are served as cached HTML; you can verify a cache HIT with:

```sh
curl -sI https://bantle.in/ | grep -i "x-vercel"
```

Look for `x-vercel-cache: HIT` (or `STALE` / `MISS` depending on edge state). The `server: Vercel` header confirms Vercel is serving the response.

There is no staging environment — `main` is production. Test changes locally with `npm run dev` before pushing.

Rolling back: use Vercel's Dashboard → Deployments → click an earlier deployment → "Promote to Production".

---

## 9. Critical pages explained

- **`/` (landing)** — Primary marketing page. First impression. Hero phone mock + "what Bantle does" + comparison vs splitwise/manual + footer CTA.
- **`/privacy`** — DPDP Act 2023 (India) compliant privacy policy. 12 sections covering identity, data, retention, vendors, rights, grievance redressal. **Note**: §1 was updated 2026-05-12 to say "an individual" rather than "a company" because Syed operates Bantle as a sole proprietor.
- **`/terms`** — Terms of service for a P2P marketplace context. Bantle facilitates discovery and chat between users; it does not process payments or guarantee deal completion.
- **`/faq`** — The mobile app's Settings → Help & FAQ button deep-links here at https://bantle.in/faq. Answers common questions about how Bantle works, what fees there are (none), why payments are off-platform, etc.
- **`/support`** — Targets of the mobile app's Settings → Support / Send Feedback / Report a Problem buttons (all `mailto:` to support@ or feedback@). Lists the main email addresses + troubleshooting tips + what to include when writing in.
- **`/verify`** — NEW (added 2026-05-12). Smart post-email-verification landing for Supabase Auth flows. The page is a server component (with `metadata` and `robots: noindex`) wrapping a Suspense boundary around `VerifyClient.tsx` (a `"use client"` component). The client component reads URL search params via `useSearchParams()` and the URL hash fragment via `window.location.hash`. If any of `token_hash`, `token`, `access_token`, `type`, `code` is present in either the query string or the hash, it renders the "Email verified" state. Otherwise it renders the neutral "this page is for verifying your Bantle email" state. The same pattern handles password reset (`type=recovery`), magic links (`type=magiclink`), invite (`type=invite`), and email change (`type=email_change`) — all are detected by the presence of `type`.

---

## 10. Email integration coordination

The mobile-app Supabase project (`fpoviccitrraonvvgont`) sends user-facing emails (verification, password reset, magic link) through Resend. Each email contains an action link that Supabase generates with a configured `redirect_to`. After the URL Configuration update (manual task — see Open items), that link points at `https://bantle.in/verify?…`.

When the user clicks the link:
1. Their browser opens `https://bantle.in/verify?token_hash=…&type=signup` (or similar)
2. The `/verify` page detects the auth parameters and renders the Verified state
3. The user taps "Open Bantle" → the `bantle://` deep link opens the mobile app on their phone
4. The mobile app finishes the session locally

Direct visits to `https://bantle.in/verify` (no params) render the Neutral state instead — useful for phishing-reuse protection and search-engine crawls (`noindex` on top of that).

Inbound email at `*@bantle.in` is handled by ImprovMX (catch-all) forwarding to Syed's personal inbox.

---

## 11. Coordination with mobile app

The mobile app at `~/Documents/GitHub/bantle/` deep-links into several pages on this site from its Settings screen. The mobile app stores these URLs as string constants (see the mobile app's `app/settings.tsx`):

| Mobile setting | Target URL |
|----------------|------------|
| Privacy policy | https://bantle.in/privacy |
| Terms of service | https://bantle.in/terms |
| Help & FAQ | https://bantle.in/faq |
| Support | `mailto:support@bantle.in` (handled by ImprovMX) |
| Send Feedback | `mailto:feedback@bantle.in` |
| Report a Problem | `mailto:support@bantle.in` with a prefilled subject |

Any time a route here is renamed or removed, the corresponding mobile-app constant must be updated and shipped in a new app build. As of 2026-05-12, all URLs are verified working.

The reverse direction — `bantle://` deep links from this site into the mobile app — is used on the `/verify` page (the "Open Bantle" button) and is the only place this site links into the app.

---

## 12. Change log

Chronological session log. Dates are absolute (ISO-style).

- **2026-05-11** — Initial 10-page site built (Claude Code session). Pages: `/`, `/about`, `/how-it-works`, `/safety`, `/faq`, `/support`, `/privacy`, `/terms`, `/refund-policy`, `/community-guidelines`.
- **2026-05-11** — Deployed to Vercel, DNS pointed at Vercel, SSL active, verified live at https://bantle.in.
- **2026-05-12 (morning)** — Hero polish: added icons to the phone-mock bottom nav (commit `a75ffda`); filled in legal identity placeholders in `lib/constants.ts` (commit `882f9f6`).
- **2026-05-12 (this commit)** — Three deliverables in one commit:
  - `/privacy` §1 — "a company based in India" → "an individual based in India" (Syed operates Bantle as a sole proprietor, not a registered company)
  - New `/verify` route — smart state detection for post-email-verification UX. Server-component page with `noindex` metadata, Suspense-wrapped `VerifyClient.tsx` that reads URL params + hash. Two render states (Verified vs Neutral). Reusable for future Supabase Auth flows (password reset, magic link, invite, email change).
  - This `BANTLE_WEB_PROJECT_DUMP.md`.
- **2026-05-13 (web-based password reset)** — `lib/supabase.ts` browser-anon-key factory + `/reset-password` route (server component `page.tsx` + client form `ResetPasswordClient.tsx`) + `@supabase/supabase-js` dependency added; `/verify` `RecoveryState` branch removed since recovery URLs now redirect straight to `/reset-password`. Commit `7162c26`. See `~/Documents/GitHub/bantle/project_context_dump.md` §2 "Phase 11 — Web-based password reset" for full design context.
- **2026-05-13 (this commit)** — Removed the `bantle://` "Open Bantle" deep-link button from `/reset-password`'s success state in `ResetPasswordClient.tsx`. Replaced with plain instructional text matching the Instagram / LinkedIn pattern. Motivated by mobile app freezing on splash when launched via the browser deep link. After this change, `/verify` is once again the only page on this site that links into the mobile app via `bantle://`.
- **2026-05-14 (phase 2.2 — terms v2.0 + household reframing)** — Major web copy purge for Play Store policy compliance. Created `lib/tos.ts` as the source of truth for `CURRENT_VERSION` (now `"2.0"`) and `EFFECTIVE_DATE` (`2026-05-14`). Rewrote `/terms` to v2.0 with explicit user attestations about household-only use, stronger user responsibility for third-party platform compliance, and a visible "what changed" callout. Reframed `/` (homepage), `/about`, `/how-it-works`, `/safety`, `/faq`, `/privacy`, `/verify` and the `HeroSection` component away from "stranger marketplace" language toward "household coordination tool for roommates, family and partners." Removed all references to MSG91, SMS OTP and phone verification (Bantle uses email verification only — phone numbers are never collected). Removed Netflix from the supported-platforms list. Bumped `POLICY_EFFECTIVE_DATE` in `lib/constants.ts` to `"14 May 2026"` so privacy and terms display the same effective date. Mobile-side blocking re-acceptance modal (which reads `profile.tos_version_accepted` and compares against `CURRENT_VERSION`) lands in the next bantle mobile-app session (phase 2.3).

---

## 13. Open items

- ☐ Update Supabase URL Configuration to point Site URL at `https://bantle.in/verify` (manual Dashboard task — see "Next steps for user" in the session report)
- ☐ Replace coming-soon Play Store badge with real link once the mobile app reaches Play Store Internal Testing
- ☐ Replace coming-soon App Store badge with real link once iOS launches (currently deferred indefinitely)
- ☐ When user base reaches ~5,000 or revenue starts: upgrade `POSTAL_ADDRESS` from generic "Bengaluru, Karnataka, India" to a real address (virtual office or PO Box)
- ☐ Lawyer review of Privacy + Terms before Production launch (~₹5,000–10,000 in India). Then update `POLICY_EFFECTIVE_DATE`.
- ☐ Replace cosmetic placeholders in `lib/constants.ts` if Syed ever registers Bantle as a Pvt Ltd company (would also require coordinated privacy + terms copy updates — see Constants section above)
- ☐ Optional: build `/blog` or `/changelog` routes once there's meaningful product news to share

---

## 14. How to add a new page

Step-by-step for future Claude Code agents:

1. Create `app/[route]/page.tsx`
2. Export `metadata` (title + description; add `robots: { index: false, follow: false }` if it's a transient page like `/verify`)
3. Use `PageHeader` from `@/components/PageHeader` for the hero — `eyebrow` (small uppercase), `title` (italic serif), `intro` (optional supporting line)
4. Wrap content in:
   ```tsx
   <article className="container-x py-12 md:py-16 max-w-3xl">
     …
   </article>
   ```
   Use `max-w-2xl` for narrower transient pages (`/verify`-style).
5. Use the `prose-bantle` class on long-form sections (it styles `p`, `h2`, `h3`, `ul`, `ol`, `a`, `strong` consistently)
6. Match the warm, India-aware, conversational voice. Sentence case everywhere. No marketing-speak.
7. Add to `NAV_LINKS` in `lib/constants.ts` if it's a main nav item, or `LEGAL_LINKS` if it's a legal/policy page. Skip both for transient pages like `/verify`.
8. Test locally: `npm run dev` → http://localhost:3000/[route]
9. Verify build: `npm run build` — must complete with zero errors and the new route must appear in the route table
10. Commit + push to `main`. Vercel auto-deploys in ~30 seconds.

### When the page needs URL search params

Next.js 14 App Router requires `useSearchParams()` to be inside a `"use client"` component wrapped in `<Suspense>`. Also, `metadata` exports only work in server components. The pattern is:

- `app/[route]/page.tsx` — server component with `metadata` + Suspense wrapper
- `app/[route]/[Route]Client.tsx` — `"use client"` component that reads `useSearchParams()` and renders content

See `app/verify/page.tsx` and `app/verify/VerifyClient.tsx` for the canonical example.
