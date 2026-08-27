# SEO audit and implementation — bantle.in

**Date:** 27 August 2026
**Scope:** the public marketing site's SEO surface — canonical host, metadata,
structured data, sitemap, robots, crawler access, passage addressability.
**Explicitly out of scope:** the admin panel, all API routes, all app
functionality, `next.config.mjs`, and every word of visible page copy.

Audited with the installed `seo` skill suite: four specialist passes
(technical, schema, content/E-E-A-T, GEO) run against the **live** site, plus
independent verification of every finding before acting on it. Several
specialist claims turned out to be wrong or ambiguous on inspection and were
not acted on — those are listed in §6.

---

## 1. The headline finding

**Every canonical URL the site published pointed at a host that redirects.**

The server serves `www.bantle.in`. Everything the site *declared* — canonical
tags, `og:url`, all twelve `<loc>` values in the sitemap, the `Host:` line in
robots.txt, and every schema.org `@id` — said `bantle.in`. The apex
307-redirects to www.

```
https://bantle.in/faq   ->  307 Temporary Redirect  ->  https://www.bantle.in/faq
https://www.bantle.in/faq  ->  200, canonical = "https://bantle.in"   <-- points back at the redirect
```

So the sitemap submitted twelve redirects rather than twelve pages, and each
page told Google "the canonical version of me is over there", where "there"
bounced straight back. On top of that a **307 is a *temporary* redirect**, which
tells Google specifically *not* to consolidate signals permanently.

This is the kind of defect that quietly caps everything else. It was confirmed
independently by three of the four specialist passes and by direct measurement.

**Resolved.** You chose www as the canonical host, which made this a pure code
fix with no infrastructure change: `SITE_URL` now reads `https://www.bantle.in`,
and canonicals, sitemap, robots, OG tags and schema `@id`s all derive from it.
Every URL the site publishes now returns 200 directly.

---

## 2. The second finding: schema that referenced nothing

Eleven of twelve routes emitted page-level structured data that pointed at
entities which were not defined in that document:

```json
{ "@type": "AboutPage",
  "isPartOf":  { "@id": "https://bantle.in/#website" },       // not defined here
  "about":     { "@id": "https://bantle.in/#organization" },  // not defined here
  "publisher": { "@id": "https://bantle.in/#organization" } } // not defined here
```

`organizationNode` and `webSiteNode` were only ever included on the homepage.
The code comment stated the assumption explicitly — *"Google resolves the
Organization and WebSite nodes once and links every page-level node back to
them"* — and that assumption is wrong. **Google parses structured data per
document.** It keeps no cross-URL `@id` graph.

Measured on the live site before the fix:

```
/                 4 defined | dangling: []
/about            1 defined | dangling: ['#organization', '#website']
... identical on 10 more routes
```

So on eleven pages the publisher, the organisation and the site-membership
signal all silently evaporated — including on every legal and policy page,
which is exactly where an entity anchor matters most.

**Resolved.** A `siteEntityNodes` export now ships the Person, Organization and
WebSite nodes on every route. Verified: **0 of 12 routes have a dangling
reference.**

---

## 3. Everything implemented

### Canonical and indexing

| Change | Before | After |
|---|---|---|
| Canonical host | `bantle.in` (redirects) | `www.bantle.in` (serves 200) |
| Sitemap URLs | 12 URLs that all 307 | 12 URLs that all return 200 |
| Sitemap `lastmod` | one build timestamp on all 12, changing every deploy | three real content dates (`2026-06-28` terms, `2026-05-14` policies, `2026-08-26` product pages) |
| robots.txt `Host:` | `Host: https://bantle.in` | removed — Yandex-only, deprecated by them in 2021, and takes a bare hostname, so the emitted value was invalid syntax anyway |
| Root canonical | `canonical: "/"` on the root layout | removed — it leaked onto the 404 route, where a canonical pointing at the homepage is a textbook soft-404 signal |
| `/favicon.ico` | 404 | real 3-size ICO (16/32/48), 200 |
| Search Console | no verification tag, no way to add one | reads `GOOGLE_SITE_VERIFICATION` from env; emits the tag when set, omits it entirely when not |

### Titles — the largest on-page gap

Eight of twelve titles were bare-noun labels using a third of the available
SERP width, and two repeated the brand twice because the layout template
appends `| Bantle` to a title that already began with "Bantle".

| Route | Before | After |
|---|---|---|
| `/about` | `About \| Bantle` (14) | `About: who builds it, and what it refuses to do \| Bantle` (56) |
| `/safety` | `Safety \| Bantle` (15) | `Safety: verified profiles, badges and real limits \| Bantle` (58) |
| `/support` | `Support \| Bantle` (16) | `Support: get help with an account or a deal \| Bantle` (52) |
| `/how-it-works` | `How it works \| Bantle` (21) | `How it works: split or buy a subscription slot \| Bantle` (55) |
| `/refund-policy` | `Refund policy \| Bantle` (22) | `Refund policy: why payments stay outside the app \| Bantle` (57) |
| `/privacy` | `Privacy policy \| Bantle` (23) | `Privacy policy: what we collect, and what we don't \| Bantle` (59) |
| `/terms` | `Terms of service \| Bantle` (25) | `Terms of service: the rules for using the app \| Bantle` (54) |
| `/community-guidelines` | `Community guidelines \| Bantle` (29) | `Community guidelines: honest terms, kept deals \| Bantle` (55) |
| `/faq` | `Frequently asked questions \| Bantle` (35) | `FAQ: subscription sharing, safety and payments \| Bantle` (55) |
| `/child-safety-standards` | `Bantle Child Safety Standards \| Bantle` (38, doubled brand) | `Child safety standards: prevention and reporting \| Bantle` (57) |
| `/account-deletion` | `Bantle Account and Data Deletion \| Bantle` (41, doubled brand) | `Account and data deletion: how to request it \| Bantle` (53) |

**The homepage title is unchanged at 51 characters.** `lib/constants.ts`
records it as explicitly requested by you, so I left it alone.

### Meta descriptions

The homepage description was 199 characters and lost its final clause to
truncation. It is now 148. Two descriptions that were leaving room unused —
`/account-deletion` (77) and `/child-safety-standards` (100) — were expanded.
All twelve now sit between 118 and 150 characters.

Where a description used internal product vocabulary ("monthly sharing",
"one-time access") it now also uses the words a person would actually type
("split", "the access you have left"), without changing any claim.

### Structured data

- **`HowTo` removed.** Google retired HowTo rich results in September 2023; it
  was dead weight that Search Console reports as a deprecated type. Replaced
  with `ItemList`, which is current, carries the same six-step sequence for AI
  answer engines, and claims no retired rich result. The existing `#step-1..6`
  anchors are preserved.
- **`founder` added** to the Organization node, as a `Person`. Not a new claim:
  the privacy policy and terms already name the operator, and both store
  listings publish the same developer name.
- **Second `ContactPoint` added** for `feedback@bantle.in`, which was published
  on `/support` but invisible to every parser.
- **`dateModified` added** to the four policy pages, using only dates those
  pages already display (`2026-06-28` for terms, `2026-05-14` for the rest).
  `/child-safety-standards` shows only "June 2026", so it was left without a
  date rather than inventing a day.
- **De-duplicated descriptions.** Organization, WebSite and MobileApplication
  each had the identical site description and near-identical URL — four
  entities named "Bantle" that a parser could collapse into one. Each now has a
  description scoped to what it is, and `MobileApplication.url` points at the
  Play Store listing rather than the marketing homepage.
- **Addressable breadcrumbs** — `BreadcrumbList` nodes now carry `@id`s and
  page nodes reference them.
- **No `aggregateRating`, no `Review`, no `Product`.** Deliberate. Bantle has no
  first-party ratings, and restating a store's rating on your own domain is
  precisely what Google's review-snippet policy prohibits.

### Passage addressability (AI search)

This is where the site had the most unclaimed value, and none of it required
changing a word of copy.

- **28 FAQ questions were `<span>` inside `<summary>`.** The whole page had 7
  heading elements for 28 answers, so heading-based chunkers saw five large
  blobs. Each question is now an `<h3>`, and each disclosure has a stable
  anchor, so `/faq#is-bantle-free-to-use` addresses a single answer. The same
  slugs are now emitted as `@id`s on each schema `Question`. Rendering is
  pixel-identical; heading order verified with no skipped levels.
- **71 section anchors added** across eight prose pages (`/safety` 8, `/terms`
  17, `/privacy` 13, `/community-guidelines` 9, `/child-safety-standards` 8,
  `/account-deletion` 6, `/refund-policy` 6, `/about` 4). `/safety` previously
  had **zero** — its best-shaped content could not be deep-linked at all.

### Crawler access

- Added **Amazonbot**, **Meta-ExternalAgent**, **Applebot** and **DuckDuckBot**
  as explicit groups. They were allowed by wildcard fallthrough; now the
  decision is on the record.
- `llms.txt` gained a **Quick facts** block (free, no fee, no ads, Android 9+,
  iOS, India, operator, contact) and a policy date. Every fact is one the site
  already states — verified against `/faq` before adding.
- `llms.txt` now also disambiguates the entity: "Bantle" is a German surname
  with an established Wikipedia footprint, and the app has none, so the file
  says plainly that it describes the mobile app.

### Stale values corrected

`theme_color` and the viewport theme colour were still `#00251E` — the deep
green from the first design pass, discarded in the rebuild. The manifest's
`background_color` was `#F4F7F5`, a light splash for a near-black site. Both
now use `#050807`, the ground the site actually renders.

---

## 4. Verification

Everything below was measured against the **production build**, not the dev
server.

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npx eslint .` | clean |
| `npm test` | 28/28 passing |
| `npm run build` | succeeds |
| Dangling schema `@id` references | **0 of 12 routes** (was 11 of 12) |
| Canonical host consistency | 12/12 canonical, sitemap, OG and schema all on the serving host |
| Sitemap URLs returning 200 directly | 12/12 (was 0/12) |
| Distinct `lastmod` values | 3 real dates (was 1 build timestamp) |
| Titles within 50–60 chars | 12/12 |
| Meta descriptions within 118–150 chars | 12/12 |
| Duplicate titles or descriptions | none |
| `HowTo` present | no; `ItemList` present |
| FAQ anchors / headings | 28 unique anchors, 28 `<h3>`, no skipped heading levels |
| Prose section anchors | 71 across 8 pages |
| `/favicon.ico` | 200, `image/x-icon`, 3 sizes |
| Console errors / horizontal overflow, 12 routes x 4 viewports (390/768/1440/1920) | **none** |
| WCAG AA contrast, every text node vs worst gradient stop | passing |
| Impeccable design detector | **0 findings** |
| LCP / CLS (production, local) | 88 ms / 0 |
| Live Core Web Vitals, mobile, before changes | LCP 296–580 ms, CLS 0, TTFB ~200 ms — already excellent, and not the bottleneck |

Admin panel untouched: no admin file is in the diff, and no shared token or
component changed behaviour.

---

## 5. Two things you need to do — I cannot

**1. Verify the site in Google Search Console and submit the sitemap.**
This is the single highest-value remaining action, and it needs your Google
account. The plumbing is already in place:

- In Search Console, add the property **`https://www.bantle.in`** (this exact
  host — that is now the canonical one).
- Choose the HTML-tag verification method and copy the token.
- In Vercel → Project → Settings → Environment Variables, add
  `GOOGLE_SITE_VERIFICATION` = that token, then redeploy.
- Submit `https://www.bantle.in/sitemap.xml` and use **Request Indexing** on
  the homepage, `/how-it-works`, `/safety` and `/faq`.

Without this, indexing is passive and you have no visibility into what Google
is actually doing. A `site:` check during this audit surfaced only one indexed
page.

**2. Change the apex redirect from 307 to 308.**
`bantle.in` → `www.bantle.in` is currently a 307 (temporary). It should be 308
(permanent) so signals from the apex consolidate onto www. This is a Vercel
domain setting, not code. Much less urgent now that every URL the site
advertises is the www one, but worth doing.

Optional, lower value: `Strict-Transport-Security` is missing
`includeSubDomains; preload`. That lives in `next.config.mjs`, which I left
untouched, and it needs care — your CSP references `auth.bantle.in`, so confirm
that subdomain is HTTPS-only before adding `includeSubDomains`.

---

## 6. Findings I did NOT act on, and why

The specialist passes surfaced several things that look like defects but are
either your decision or genuinely ambiguous. I flagged rather than guessed.

**"Settlement" language on `/faq`, `/privacy` and `/safety`.** The GEO pass
called this the site's highest-risk contradiction — phrases like *"Past
settlement history stays intact"* and *"whether September was settled"* reading
as if Bantle handles money, against the core "payments stay outside Bantle"
claim. **I think that reading is probably wrong.** An app can track a
settled/unsettled flag as a shared record without ever touching a rupee, and
that is a normal feature. Only you know what the app actually does. If it does
keep such a record, the copy is accurate and should stay. Note that `/privacy`
is a compliance document — if it describes data the app really stores, removing
that description would make the policy *less* accurate, not more.

**"A small independent team" vs "an individual".** `/about` and `/support` say
"a small team"; `/privacy` §1 says *"an individual based in India"*. The content
pass rated this the highest-severity item in its audit, on the grounds that a
money-adjacent site whose About page obscures the operator is exactly what
quality raters are told to penalise. It is a real inconsistency — but which
statement is true is yours to say, not mine to assume. One of the two needs to
change.

I did sidestep it in one place without asserting anything: the `/about` meta
description used to open "Bantle is a small, India-first team…". It now
describes the page instead, so the claim is not repeated in the SERP snippet.

**Three unsupported statistics, still live:**

| Claim | Page |
|---|---|
| *"about three quarters of support emails turn out to be questions already answered there"* | `/support` |
| *"most are actioned within 24 hours"* | `/safety` |
| *"usually resolved within 24 hours"* | `/faq` |

Each requires data a newly-launched app is unlikely to have. The cheap fix is to
reframe them as intentions rather than measurements — *"we aim to review every
report within 24 hours"* — which is what `/support` already does correctly with
*"We aim to reply within two business days"*. I have not touched them because I
cannot tell whether you have the data.

**Stale copy on `/support`:** *"Once we go live, we'll push fixes regularly"*,
while the homepage says "Bantle is live" and both store links work.

**Stale footer line:** *"A coordination and chat app for household and
family-plan arrangements in India."* This appears on all twelve pages and
contradicts your own FAQ (*"Does Bantle only work for people in the same
household?" — "No."*). Your own `lib/tos.ts` v3.0 changelog records the
repositioning away from household-only. This one is a one-line change and I
think it is clearly stale — but it is brand copy, so it is your call.

**The 404 page emits two `<title>` tags** and two conflicting `robots` metas,
because the root layout metadata leaks into Next's built-in not-found route. I
fixed the part that matters for SEO (the canonical pointing at the homepage —
a soft-404 signal). The duplicate title is cosmetic on a page that correctly
returns HTTP 404 and `noindex`, and fixing it properly means adding a custom
404 page, which is new UI rather than SEO. Left alone deliberately.

**IndexNow is not implemented.** It would help Bing/Yandex pick up policy
changes faster, but it needs a deploy-pipeline step to submit URLs, which is
infrastructure rather than SEO markup.

**The technical pass recommended the opposite canonical host** — making
`bantle.in` primary in Vercel and redirecting www to it, on the grounds that
DNS has the apex as primary. That is a legitimate alternative. You chose www,
which needs no infrastructure access and takes effect on the next deploy. Both
resolve the defect; only the direction differs.

---

## 7. The honest answer about ranking first

The site's technical SEO is now genuinely strong. Performance is excellent
(live mobile LCP under 600 ms, CLS 0), rendering is fully server-side, internal
linking puts every page one click from the homepage, the schema graph is clean,
and AI crawlers are explicitly welcomed. There is very little technical work
left to do.

**That is necessary, not sufficient.** Technical SEO removes obstacles; it does
not by itself create rankings. Two things do, and neither is code:

**Content that answers questions people actually search.** The site is written
entirely in its own vocabulary. Across all twelve pages, the content pass
measured: *OTT* 0 occurrences, *UPI* 0, *streaming* 0, *Netflix / Spotify /
Prime / Hotstar* 0, *"family plan"* 1, *split* 8. Meanwhile the internal terms
dominate — *"one time"* 33, *"outside Bantle"* 32, *"monthly sharing"* 17.
"Monthly sharing" and "one-time access" are Bantle coinages. Nobody types them.
And of 107 headings across the site, exactly **one** is shaped like a question.

Your competitors in this space — Fleek, SplitSub, Sharesub, GoSplit,
CancelMates — rank for the money terms through guides, not product pages.
Search results for the category are dominated by articles like "How to Split
Subscription Costs with Friends" on competitor blogs.

The highest-value asset you could publish is a **dated, sourced page on what
each major provider's terms actually say about sharing in India** — with
question-shaped headings, per-provider anchors and links to the providers' own
terms. It targets a real, high-intent query ("is it legal to share a Netflix
account in India"), it is something you are unusually well-placed to answer
honestly, and there is no good existing source. Your `/how-it-works` "note on
subscription provider terms" is already most of the answer, buried at the
bottom of the site's thinnest important page.

One caution the content pass got right: **do not chase provider brand names in
your product copy.** Targeting "Netflix account sharing" as a service claim
would contradict `/terms` §2 and invite exactly the provider conflict the site
has carefully engineered around. The fake brands in the hero illustration
("Video Premium", "Music Family") are the correct call. The distinction is
between *category and legality vocabulary*, which is safe and valuable, and
*service claims about named providers*, which is not.

**Entity presence off-site.** "Bantle" currently resolves to a German surname —
Wikipedia has a disambiguation page for it, and a web search for the product
returns one result out of seven that is actually you, alongside a law firm, an
insurer and a competing App Store entity. On-site work cannot fix that alone.
`sameAs` lists only the two store URLs. A Wikidata item, a LinkedIn page, and
genuine participation where the audience already is would each do more for
rankings now than any further markup change.

**Expect a lag.** Nothing here is instant. The canonical fix has to be
recrawled before Google reconsolidates, which typically takes days to weeks.
Search Console verification is what turns that from guesswork into something
you can watch.

---

## 8. Files changed

**Foundational**
- `lib/constants.ts` — canonical host, trimmed site description, ISO policy date
- `lib/structured-data.ts` — `siteEntityNodes`, founder, second contact point,
  `stepListNode` replacing `howToNode`, per-node descriptions, dates,
  addressable breadcrumbs

**Site-wide**
- `app/layout.tsx` — removed the leaking root canonical, added Search Console
  plumbing, corrected the theme colour
- `app/robots.ts` — four more named crawlers, removed the invalid `Host:` line
- `app/sitemap.ts` — real per-page `lastmod`, no build timestamps
- `app/manifest.ts` — corrected theme and background colours
- `app/llms.txt/route.ts` — quick facts, operator, entity disambiguation, date
- `app/favicon.ico` — new

**All twelve marketing routes** — entity anchors in the graph, rewritten titles
and descriptions, section anchors. `/faq` additionally gained per-question
headings and anchors; `/how-it-works` swapped `HowTo` for `ItemList`; the four
policy pages gained `dateModified`.

No page copy was changed. No admin file, API route, or `next.config.mjs` was
touched.
