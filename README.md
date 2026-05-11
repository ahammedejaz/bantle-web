# Bantle marketing site

The public marketing, support and legal site for **Bantle**, a mobile app for
Indians who want to share family subscription plans (Spotify, YouTube
Premium, Apple One, Microsoft 365, OTT services) with trusted partners.

This site has three purposes:

1. **App store compliance** — hosts the privacy policy and terms of service
   URLs that Google Play and the Apple App Store require for the mobile
   app submission.
2. **Pre-launch landing** — explains what Bantle does and lets potential
   users bookmark "Coming soon" store badges. There are no working store
   download links until the mobile app is live.
3. **Support and brand presence** — a single source for FAQ, safety,
   community guidelines, and support contact.

The mobile app itself lives in a separate repository
(`~/Documents/GitHub/bantle/`) and is not affected by anything in this
repo.

---

## Tech stack

- **Framework:** Next.js 14 (App Router) with TypeScript strict mode.
- **Styling:** Tailwind CSS with a custom Bantle token palette (see
  `tailwind.config.ts`).
- **Typography:** Lora (serif, hero / headings) + Inter (sans, body),
  both via `next/font/google`.
- **UI primitives:** shadcn-style `Button` and `Sheet` components built
  locally (no `shadcn` CLI; only what's needed).
- **Icons:** `lucide-react`.
- **Mobile nav:** `@radix-ui/react-dialog` powers the slide-in sheet.
- **OG image:** generated at the edge via `next/og` (`app/opengraph-image.tsx`).

No animation libraries, no state management, no auth — this is a static
content site.

---

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Useful scripts:

```bash
npm run build   # production build — must finish with 0 errors before deploy
npm run start   # serve the production build locally
npm run lint    # ESLint via next/core-web-vitals + next/typescript
```

---

## Project layout

```
app/
├── layout.tsx                   Root layout (fonts, header, footer)
├── page.tsx                     Landing (/)
├── about/page.tsx               /about
├── how-it-works/page.tsx        /how-it-works
├── safety/page.tsx              /safety
├── faq/page.tsx                 /faq
├── support/page.tsx             /support
├── privacy/page.tsx             /privacy
├── terms/page.tsx               /terms
├── refund-policy/page.tsx       /refund-policy
├── community-guidelines/page.tsx
├── icon.svg                     Favicon (auto-served by Next)
├── apple-icon.svg               Apple touch icon (auto-served by Next)
├── opengraph-image.tsx          Dynamic 1200x630 OG image
└── globals.css                  Tailwind directives + base + .prose-bantle
components/
├── Header.tsx                   Sticky top bar + nav
├── Footer.tsx                   Dark teal footer with all links
├── MobileNav.tsx                Hamburger menu (Sheet)
├── ComingSoonBadges.tsx         Disabled Play Store + App Store badges
├── HeroSection.tsx              Landing hero with phone mock
├── FeatureCard.tsx              "Why Bantle" cards
├── PageHeader.tsx               Top header used on every non-landing page
└── ui/
    ├── button.tsx
    └── sheet.tsx
lib/
├── constants.ts                 Brand strings, emails, nav links, placeholders
└── utils.ts                     cn() helper (clsx + tailwind-merge)
```

---

## Deploying to Vercel

The site is built to drop into Vercel with no custom config beyond what
`create-next-app` already gave us.

1. **Push this repo to GitHub.** Create a new repo under your preferred
   account (the build script in this directory does **not** push for you;
   you can decide which account owns the codebase).

   ```bash
   git remote add origin git@github.com:<your-account>/bantle-web.git
   git push -u origin main
   ```

2. **Connect the repo to Vercel.** Go to https://vercel.com/new, pick the
   GitHub repo, accept Vercel's auto-detected Next.js settings.

3. **Deploy.** Vercel will build and ship the first deploy automatically.

4. **Add the `bantle.in` domain.** In the Vercel project, open
   **Settings → Domains** and add `bantle.in` and `www.bantle.in`. Vercel
   will display the DNS records you need to point at it (an `A` record
   for the apex and a `CNAME` for `www`, or two `A` records depending on
   how Vercel suggests).

5. **Add the DNS records at Hostinger.** Keep the Hostinger nameservers
   exactly as they are — just add the `A` / `CNAME` records Vercel gave
   you, replacing the existing parking-page records.

6. **SSL.** Vercel issues a Let's Encrypt certificate automatically once
   DNS propagation completes, usually within a few minutes.

---

## Placeholders to fill in before launch

A few legal documents include placeholders that need real values before
this site is publicly linked from the app:

| Placeholder                       | Where it appears                              | What to replace it with                                    |
| --------------------------------- | --------------------------------------------- | ---------------------------------------------------------- |
| `{{COMPANY_NAME}}`                | `/privacy`, `/terms`                          | Registered company name (e.g., "Bantle Technologies Pvt Ltd"). |
| `{{CITY}}`                        | `/terms` (jurisdiction)                       | City where the company is registered (e.g., "Hyderabad").  |
| `{{GRIEVANCE_OFFICER_NAME}}`      | `/privacy`                                    | Name of the appointed grievance officer.                   |
| `{{POSTAL_ADDRESS}}`              | `/privacy`                                    | Full registered postal address.                            |

All placeholders are defined in `lib/constants.ts`. Update them there and
the values propagate to every page.

Other content placeholders:

- **Landing hero phone mock** — `components/HeroSection.tsx` currently
  ships an inline ASCII-like preview. Replace with a real mobile-app
  screenshot once you have publishable artwork (export from the Bantle
  mobile app and drop in `public/` then swap the JSX for a `next/image`).

---

## What is intentionally not built (and why)

- **Working store download links.** Until the Bantle mobile app is live
  on Google Play and Apple App Store, every store CTA is a disabled
  "Coming soon" badge. Do not swap these for live links until both
  submissions are approved.
- **Newsletter signup.** No newsletter capture today. We accept early
  access requests via the support email so we don't have to operate a
  list before there is anything to send.
- **Blog.** Held until Phase 12+ in the build plan.
- **Lottie / Framer Motion.** Marketing pages are heavy enough already.
  Tailwind transitions cover the small amount of motion we use (mobile
  nav slide-in, FAQ accordion).
- **JavaScript-heavy interactivity.** Almost every page is statically
  rendered. The only `"use client"` components are the mobile nav and
  Sheet primitives — everything else is server components.

---

## Design rules in force

These match the Bantle mobile app's design system and apply to any
future change in this repo:

- **Flat design.** No shadows, no gradients, no blur effects. Depth
  comes from cream / teal contrast and 1px borders.
- **Sentence case for all UI text.** No Title Case headings, no all
  caps (except the tiny tracked-out eyebrow labels above section
  headers).
- **Font weights.** Only `font-normal` (400) and `font-medium` (500).
  `font-semibold` and `font-bold` are banned.
- **Brand colours.** Use the tokens defined in `tailwind.config.ts`
  (`teal-900`, `cream`, `ink`, `line`). Don't introduce raw hex except
  for the literal store-badge backgrounds.
- **Icons.** Lucide only. No emoji as functional icons.

---

## Quick checks before you ship a change

```bash
npm run build   # must succeed with 0 errors
npm run lint    # should be clean
```

That's it. Push to the main branch and Vercel will redeploy.
