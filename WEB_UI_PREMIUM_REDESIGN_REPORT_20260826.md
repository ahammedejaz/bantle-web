# Premium UI redesign of bantle.in

**Date:** 26 August 2026
**Scope:** the public marketing site (`app/(marketing)/*`, `components/*`), plus SEO/indexing.
**Explicitly out of scope:** the admin panel, every API route, all app functionality, and all product copy claims.

---

## 1. What was wrong

I audited the live site at 1440x900 and 390x844 before changing anything. The
problem was not any single ugly element. It was that the page had one idea and
repeated it eight times.

| # | Finding | Evidence |
|---|---|---|
| 1 | **Every section was the same layout family.** Uppercase eyebrow → serif headline → grid of identical white rounded cards with a mint icon chip. Seven of eight sections. | `WhyBantle`, `HowItWorks`, `AppPreview`, `TrustHighlights`, `FAQPreview` all rendered the same card grid. |
| 2 | **A kicker label above every single section.** Seven across eight sections. That rhythm is the single most recognisable "generated page" tell. | `<Eyebrow>` in `page.tsx`, `eyebrow` on every `PageHeader`. |
| 3 | **The hero failed its job.** A three-line 60px italic headline, a 45-word four-line paragraph, three pills, then the store badges. On a 900px laptop the call to action sat below the fold. | Measured: CTA bottom at 780px, viewport 773px. |
| 4 | **No colour.** `#FAFBFA` page, `#FFFFFF` cards, mint icon chips. The brand's best asset, the deep green `#003C2F`, appeared only as text and in the footer. The page read as a wireframe. | Full-page screenshots. |
| 5 | **Serif italic display type.** Lora italic at display sizes reads as editorial/wedding, not as a trust-first marketplace for cost-conscious buyers. Only weights 400/500 were loaded, so there was no weight contrast anywhere. | `app/layout.tsx`, `globals.css`. |
| 6 | **A dead cream gap between the dark CTA band and the dark footer.** A real layout bug: `<footer className="mt-24">` put ~96px of page background between two dark sections. | Visible in the pre-change screenshots. |
| 7 | **The "What Bantle does not do" panel had a large empty bottom.** `justify-center` inside a `h-full` flex against a taller left column. | Visible in the pre-change screenshots. |
| 8 | **No motion.** Two CSS keyframes existed and were used only in the hero. Nothing revealed on scroll. No `:active` state on any control. | `globals.css`, `components/ui/button.tsx`. |
| 9 | **One shadow, repeated.** The same large soft shadow at every size, so nothing had elevation hierarchy. | `shadow-[0_10px_30px_-14px_...]` repeated across components. |
| 10 | **The store badges were wrong.** The "iOS" glyph was a phone outline, not the Apple mark. | `components/StoreBadges.tsx`. |
| 11 | **The site looked nothing like the app.** A light cream marketplace page selling a near-black mint-accented mobile app. | The app screenshots. |

SEO gaps found in the same pass:

- Structured data existed only on the homepage, and only `Organization` + `WebSite`.
- No canonical URL on any page except `/`.
- No `FAQPage`, `HowTo`, `BreadcrumbList`, `MobileApplication`, or per-page `WebPage` nodes.
- No web app manifest, no `llms.txt`.
- The social card was low-contrast text on cream, which converts poorly in a feed.
- `sitemap.xml` used a hardcoded past date and a flat priority for every page.

---

## 2. Design direction

### The first pass, and why it was wrong

The first version of this redesign built the site out of the brand's deep green
(`#00251E`): a dark green frame around a light body. Reviewed against
screenshots of the actual Bantle app, that was the wrong call, and the founder's
words for it were "too AI-ish" and "I don't like that full green colour". Both
are fair. A page that is one hue top to bottom reads as a colour wash rather
than as a designed surface, and it did not look like the product it was selling.

The app is **near-black with a single mint accent**, with small vivid category
tiles. Sampling the screenshots gave the real system:

| | Value | Role |
|---|---|---|
| Ground | `#060908` | page, never pure black |
| Raised | `#0A1C15`, `#0E261D` | cards, panels, inputs |
| Lines | `#1A3A2E`, `#265241` | hairlines and borders |
| Text | `#FFFFFF`, `#ECF5F1`, `#8FA69C` | heading, body, muted |
| Accent | `#5FE3A8` | one accent, everywhere |

The site is now that system, in one direction. It is not a dark variant of a
light page: there is no light mode, because committing to one look is what makes
a page feel authored. A visitor who installs the app after reading the site
lands somewhere they already recognise.

### What separates the sections, now that everything is dark

Elevation and light, not colour. Bands step between `canvas` and `canvas-2`; a
raised surface earns its separation with three things at once, and all three
matter: a shadow with a real offset, a hairline border, and a one-pixel top
highlight. A dark rectangle without that highlight reads as *lighter*, not as
*lit*, which is the single most common way dark UI looks cheap.

### Typography

| | Before | After |
|---|---|---|
| Display | Lora, serif, italic, weight 500 | **Bricolage Grotesque** variable, 600-700, tracking -0.038em |
| Body / UI | Inter, weights 400/500 only | **Geist** variable |
| Tabular figures | none | **Geist Mono** |

Headline sizes are planned against the column width at each breakpoint, so the
H1 holds at two lines from `sm` upward: `text-[38px] sm:text-[46px] lg:text-[40px]
xl:text-[50px] 2xl:text-[56px]`. The dip at `lg` is deliberate; that is where the
column is narrowest.

Lora is still loaded, with `preload: false`, purely so the admin panel's
`font-serif` headings are untouched. Marketing pages never fetch it.

### Two rules I applied that cut real work out of the page

**Kickers are banned, not rationed.** The small tracked-out uppercase label
above a section heading is the most recognisable generated-page tell there is.
The first pass reduced them from seven to three. This pass deletes all of them,
and `Section` deliberately exposes no `kicker` prop so they cannot come back.

**Cards are not the page structure.** Same-size icon-heading-paragraph cards
repeated down a page is the lazy container. Most sections are now hairline
lists, a connected rail, or a disclosure list. The bento is the one card moment,
and its four cells are deliberately four different surfaces, one of which
inverts to solid mint so the grid has a focal tile instead of four equal panels.

### Section rhythm

Eight sections, eight different layout families, no two alike:

1. **Hero** - split, copy left, 3D device right, trust strip along the bottom.
2. **Why Bantle** - editorial two-column, sticky heading, hairline principles.
3. **How it works** - a connected rail: horizontal on desktop, vertical on mobile.
4. **App preview** - four-cell bento, each cell a different surface carrying a
   real piece of interface rather than an icon over a paragraph.
5. **Trust** - the badge system shown as badges, then facts as a hairline grid.
6. **Safety and limits** - asymmetric split with a sticky "does not do" panel.
7. **FAQ preview** - a disclosure list, first answer open.
8. **Download** - a centred statement band, flush against the footer.

### Motion: one authored moment

The reference material is blunt about this: *one* authored moment, not a
generic fade-and-rise repeated on every section. A scroll reveal is not a
thesis. So the page has a thesis, and it is specific to this product.

**The focal moment: the hero device performs a deal.** Bantle's entire claim is
that a buyer proposes, the proposal is accepted, and only then does chat open.
The site kept asserting that in prose. Now the device demonstrates it, once, on
first view, in three beats over about three seconds:

1. A press sweeps across the "Propose a deal" control (`clip-path`, 850ms linear).
2. The control's own label becomes the receipt: "Deal request sent".
3. A notification arrives at the top of the device: "Proposal accepted, chat is
   now open". It sits at `translateZ(60px)`, so it parallaxes against the screen
   under the pointer tilt rather than moving in lockstep with it.

It plays once. It never loops.

**The 3D.** The device sits in a real perspective scene (`perspective: 1300px`,
`transform-style: preserve-3d`) and tilts toward the pointer. The rotation is
driven by a small spring integrator rather than mapped straight from cursor
position, because a direct mapping has no momentum and reads as computed; the
spring keeps velocity through direction changes, which is what makes it feel
like an object rather than a value. Written with `requestAnimationFrame` and
direct `transform` writes: no animation library, no React state per frame, and
about 3 KB of JavaScript in total.

**Supporting motion**, and nothing more: a pointer-following highlight on the
bento (one listener for the whole group, writing onto a dedicated empty layer
inside each card rather than onto a CSS variable on the card, because changing a
variable invalidates style for the entire subtree), press feedback on every
control, the disclosure open/close, and the drawer. Sibling stagger survives
only where a list genuinely appears as a list.

**There are no infinite animations anywhere on the page.** The rAF loop starts
on pointer entry and stops the moment the device settles back to rest, clearing
`will-change` behind it.

**Every path degrades correctly**, verified in a headless browser:

| Condition | Result |
|---|---|
| Pointer tilt | engages on hover, springs back, loop stops (`will-change` cleared) |
| Coarse pointer / touch | no tilt listeners attached at all |
| `prefers-reduced-motion: reduce` | no tilt, no sequence; the device shows its resting state plus the accepted notification |
| JavaScript disabled | same as reduced motion; every section fully visible |
| Hydration never happens | a 4s inline failsafe drops the `js` flag and everything becomes visible |

## 3. SEO and indexing

| Area | Before | After |
|---|---|---|
| Canonical URLs | `/` only | every page |
| Structured data | `Organization`, `WebSite` on `/` | `Organization`, `WebSite`, `MobileApplication`, `WebPage`/`AboutPage`/`ContactPage`, `FAQPage`, `HowTo`, `BreadcrumbList`, all wired through shared `@id`s in `lib/structured-data.ts` |
| FAQ schema | none | all **28** questions, with answers derived at build time from the rendered JSX so the schema can never drift from the visible page |
| HowTo schema | none | built from the same `steps` array the page renders |
| Breadcrumbs | none | visible trail in every `PageHeader`, plus matching `BreadcrumbList` |
| Social card | cream, plain text | deep-green card at the stable path `/og.png`, referenced by every page |
| `robots.txt` | one wildcard rule | wildcard plus explicit rules for GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, CCBot, Bingbot |
| `sitemap.xml` | hardcoded past date, flat priority | live `lastModified`, priorities 1.0 → 0.4, per-page change frequency |
| `llms.txt` | none | `/llms.txt` stating what Bantle does and, more importantly, what it does **not** do, so an assistant summarising Bantle gets the payment and guarantee boundaries right |
| Manifest | none | `/manifest.webmanifest`, standalone, `en-IN`, theme colour `#00251E` |
| `theme-color` | none | set for both colour schemes |

**One thing worth knowing:** I found and fixed a subtle trap. Declaring a per-page `openGraph` block in Next silently opts that route out of the hashed `opengraph-image` file convention, so all eleven interior pages had shipped with **no social image at all**. The card now lives at a stable `/og.png` route and is referenced from `lib/seo.ts` (`OG_BASE`, `TWITTER_BASE`), which every page spreads. This also means social platforms keep a single cache entry for it.

I also removed a duplicate `FAQPage` entity on `/faq` (one from the page node, one from the FAQ node) and dropped the redundant `FAQPage` from the homepage, so `/faq` is now the single authority for those questions.

---

## 4. Bugs found and fixed along the way

1. **Hydration mismatch.** The inline script that flags the document as JavaScript-capable mutates `<html>`'s class list before hydration, which React reported as an attribute diff on every page load. Fixed with `suppressHydrationWarning` on `<html>` (the documented fix for exactly this pattern).
2. **Missing social images** on eleven pages. See above.
3. **The cream gap** between the CTA band and the footer.
4. **The half-empty "does not do" panel.**
5. **`header a` inherited the body's dark ink** over the dark canvas. No visible text was affected, but anything added to the header later would have been invisible. The header now sets `text-canvas-fg`.
6. **Contrast below AA in three places**, caught by a programmatic sweep over every text node at two viewports in both colour schemes:
   - store badge caption at 3.70:1 → raised to ~5.5:1
   - inactive tab labels in the device rendering at 2.55:1 → `#98A5A0` → `#6E7C77`
   - body copy on the mint tile at 4.29:1 against the darkest end of its gradient → alpha raised
7. **Store badges would have overflowed the mobile nav sheet** between 640px and 767px, where the sheet is open and `sm:flex-row` applies inside a 295px container. Forced to stay stacked there.
8. **The hero trust strip and the bento** were squeezed to a ~140px measure in the same 640-767px band. Both now break at `md` instead of `sm`.

---

## 5. Verification

Everything below was run against the **production build**, not the dev server.

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npx eslint .` | clean |
| `npm test` | 28/28 passing |
| `npm run build` | succeeds; 50 pages prerendered |
| Console errors, 13 routes x 3 viewports | **none** |
| Horizontal overflow at 390 / 768 / 1440 | **none** |
| Exactly one `<h1>` per page | yes |
| No skipped heading levels | yes |
| Every `<img>` has `alt` | yes |
| Canonical, description, `og:image`, valid JSON-LD per page | yes, all 12 |
| WCAG AA contrast, every text node, 3 viewports | passing |
| Skip link is the first tab stop and becomes visible on focus | yes |
| Mobile nav opens, navigates, and closes | yes |
| FAQ disclosures open and reveal their answer | yes |
| Header CTA anchors to `#get-the-app` and the target exists | yes |
| Impeccable design detector | **0 findings** |
| 3D tilt, spotlight, sequence, reduced motion, touch, no-JS | all correct |
| LCP (production, local) | 72 ms |
| CLS | 0 |

Screenshots were captured for 9 routes across mobile (390x844), tablet (768), and desktop (1440x900), in light and dark. The browser extension could not resize its viewport, so all responsive verification was done through headless Chromium at real device sizes rather than by eyeballing a desktop window.

### Performance

| | Before | After |
|---|---|---|
| Font payload | 282 KB (Bricolage was loading three variable axes: `opsz`, `wdth`, `wght`) | **129 KB** — only the weight axis is loaded, and Geist Mono uses its variable file instead of two statics |
| Brand mark | 39 KB PNG rendered at 24-32px on every page | **7 KB** via `next/image`, `priority` on the header instance only |

`display: swap` on every face, so no face blocks first paint.

---

## 6. Decisions I made, and why

**The device rendering is HTML/CSS, not a screenshot.** No image-generation tool was available in this environment and there are no app screenshots in the repo. Rather than ship a text-only hero, I built the phone as a deliberate product *illustration*: a real device chassis, a `role="img"` with a full description, neutral sample data, and a visible caption reading "Illustrative preview. Sample listings, not live data." I also replaced the real provider names that were in the old mock (Prime Video, Music Premium, Microsoft 365 Family) with neutral categories, because the site states plainly that Bantle is not affiliated with any provider and the mock was undercutting that.

**This is still the single biggest remaining upgrade.** See follow-ups.

**The hero copy was trimmed, not rewritten.** The subheading went from 45 words to 20. Every claim it makes is unchanged and still accurate; the material that came out (verified sellers, proposal-first chat, payments outside Bantle) now has its own trust strip directly below, with more room than it had before.

**Legal prose punctuation was left alone.** The design guidance I was working from bans em-dashes outright. I removed them from everything I authored, but I did not repunctuate the founder's long-form policy text across `/privacy`, `/terms`, `/refund-policy`, `/community-guidelines`, `/account-deletion`, or `/child-safety-standards`. Rewriting legal copy for aesthetics carries real risk and no visual payoff.

**The website is now bolder than the app.** The README previously documented "flat design, no heavy shadows/gradients/blur" as a rule that "matches the Bantle mobile app's design system". The marketing site deliberately no longer follows that rule. This is normal — marketing sites are usually bolder than in-product UI — but it is your call whether you want the app to move toward this language. I updated `README.md` and `PROJECT_CONTEXT_FOR_AI.md` so the two systems are now documented separately and neither will get "corrected" back by a future agent.

**`components/FeatureCard.tsx` was deleted.** The redesign orphaned it; nothing imported it. `components/ui/button.tsx` was left in place (it was already unused before this work) and gained a press state.

---

## 7. Follow-ups worth doing

Ranked by impact.

1. **Replace the device illustration with real app screenshots.** Three or four screens from the live app would be the single largest remaining lift: the illustration is honest and well built, but a real product shot is more persuasive. Drop-in point is `DeviceShowcase` in `components/HeroSection.tsx`.
2. **Add one or two real photographs.** The site is entirely typography, colour, and UI illustration. A single well-chosen photograph in the "Why Bantle" or "Trust" section would add warmth.
3. **Submit the sitemap in Google Search Console** and request indexing for `/`, `/how-it-works`, `/safety`, and `/faq`. The technical work is done; indexing still needs the manual submission.
4. **Consider embedding Bricolage Grotesque in the social card.** It currently renders in Helvetica/Arial, because Satori cannot use `next/font`'s woff2 files. Embedding the TTF would make the card match the site exactly, at the cost of a build-time font fetch.
5. **Consider a manual light/dark toggle.** The CSS already supports `data-theme` in both directions; only the control is missing.
6. **`PROJECT_CONTEXT_FOR_AI.md` has pre-existing staleness** unrelated to this work (it still references `ComingSoonBadges`, old hex values, and other retired details). I corrected the design-system and component sections; the rest is a separate cleanup.

---

## 8. Files

**Design system**
`app/globals.css` (rewritten), `tailwind.config.ts` (rewritten), `app/layout.tsx`

**New**
`components/site/Section.tsx`, `ArrowLink.tsx`, `ProseShell.tsx`, `JsonLd.tsx`, `NavLink.tsx`, `ScrollReveal.tsx`
`lib/structured-data.ts`, `lib/seo.ts`
`app/manifest.ts`, `app/llms.txt/route.ts`, `app/og.png/route.tsx`

**Rebuilt**
`components/HeroSection.tsx`, `Header.tsx`, `Footer.tsx`, `MobileNav.tsx`, `PageHeader.tsx`, `BrandMark.tsx`, `StoreBadges.tsx`, `ui/sheet.tsx`, `ui/button.tsx`
`app/(marketing)/page.tsx`, `layout.tsx`

**Restyled and given metadata + schema**
`about`, `how-it-works`, `safety`, `faq`, `support`, `privacy`, `terms`, `refund-policy`, `community-guidelines`, `account-deletion`, `child-safety-standards`, `verify`, `reset-password`

**SEO**
`app/sitemap.ts`, `app/robots.ts`

**Docs**
`README.md`, `PROJECT_CONTEXT_FOR_AI.md`

**Deleted**
`components/FeatureCard.tsx` (orphaned), `app/(marketing)/twitter-image.tsx` and `opengraph-image.tsx` (replaced by `/og.png`)

**Untouched**
Everything under `app/admin/*` and `components/admin/*`, every API route, `middleware.ts`, `next.config.mjs`, and all of `lib/` except the two new files.
