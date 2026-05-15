# Phase 4 Reconnaissance — Platforms Management

Generated on 2026-05-15 against production Supabase project (`fpoviccitrraonvvgont`). All queries are read-only.

## Section 1 — Does a platforms table exist?

### Query 1a — Tables matching %platform%

[query]
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name ILIKE '%platform%'
ORDER BY table_name;
```
[/query]

[result]
| table_name |
|---|
| platforms |

A single `platforms` table exists.
[/result]

### Query 1b — Platforms schema

[query]
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'platforms'
ORDER BY ordinal_position;
```
[/query]

[result]
| column_name | data_type | is_nullable | column_default |
|---|---|---|---|
| id | text | NO | — |
| label | text | NO | — |
| category | text | NO | — |
| default_monthly_price | integer | NO | — |
| brand_color | text | NO | — |
| brand_initials | text | NO | — |
| is_active | boolean | YES | true |
| display_order | integer | YES | 0 |
| created_at | timestamp with time zone | YES | now() |

Notes:
- `id` is `text` (not uuid) — admin must supply a slug (`spotify`, `youtube_music`). No default.
- `default_monthly_price` is `integer` — Rupees, matching listings.monthly_price.
- No `updated_at` column; only `created_at`.
[/result]

### Query 1c — Platforms CHECK constraints

[query]
```sql
SELECT con.conname, pg_get_constraintdef(con.oid)
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'platforms' AND con.contype = 'c';
```
[/query]

[result]
| conname | definition |
|---|---|
| platforms_category_check | `CHECK ((category = ANY (ARRAY['music'::text, 'video'::text, 'cloud'::text, 'work'::text])))` |

Category is constrained to four values: `music`, `video`, `cloud`, `work`. Adding a new category requires a migration to update the CHECK.
[/result]

### Query 1d — Platforms indexes

[query]
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'platforms';
```
[/query]

[result]
| indexname | indexdef |
|---|---|
| platforms_pkey | `CREATE UNIQUE INDEX platforms_pkey ON public.platforms USING btree (id)` |
| platforms_category_idx | `CREATE INDEX platforms_category_idx ON public.platforms USING btree (category) WHERE (is_active = true)` |
| platforms_active_idx | `CREATE INDEX platforms_active_idx ON public.platforms USING btree (is_active)` |

Partial index on category for active rows — read path is optimized for filtering active platforms by category.
[/result]

## Section 2 — How does listings.platform work today?

### Query 2a — Distinct platform values

[query]
```sql
SELECT platform, COUNT(*) as count
FROM listings
GROUP BY platform
ORDER BY count DESC;
```
[/query]

[result]
| platform | count |
|---|---|
| netflix | 3 |
| microsoft_365 | 3 |
| spotify | 3 |
| youtube_music | 3 |
| jiohotstar | 2 |
| apple_music | 2 |
| youtube | 2 |
| sony_liv | 2 |
| prime_video | 2 |
| apple_one | 1 |
| google_one | 1 |

11 distinct values, all snake_case. Total: 24 listings.
[/result]

### Query 2b — FKs on listings

[query]
```sql
SELECT conname, pg_get_constraintdef(con.oid)
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'listings'
  AND con.contype = 'f';
```
[/query]

[result]
| conname | definition |
|---|---|
| listings_user_id_fkey | `FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE` |

**No FK from `listings.platform` to `platforms.id`.** The relationship is conventional — clients are expected to write valid slugs, but the database does not enforce it. Phase 4 must decide whether to add the FK (would require backfilling missing rows + cleaning bad data) or keep the soft relationship.
[/result]

## Section 3 — Mobile app platform usage

### 3a — All "platform" references (mobile)

[query]
```bash
grep -rn "platform" --include="*.ts" --include="*.tsx" \
  ~/Documents/GitHub/bantle/app ~/Documents/GitHub/bantle/stores \
  ~/Documents/GitHub/bantle/lib | grep -v node_modules | grep -v "\.d\.ts" | head -50
```
[/query]

[result]
```
app/saved.tsx:181            <PlatformTile platform={listing.platform} size="md" />
app/hidden-listings.tsx:209  <PlatformTile platform={listing.platform} size="md" />
app/my-listings.tsx:296      const platform = row.platform ?? '';
app/my-listings.tsx:320      <PlatformTile platform={platform} size="sm" />
app/rate/[dealId].tsx:133    listing:listings(title, platform),
app/rate/[dealId].tsx:298    platform={context.listingPlatform ?? ''}
app/chat/archived.tsx:16     import { findPlatform } from '../../lib/platforms';
app/chat/archived.tsx:24     import { usePlatformsStore } from '../../stores/platforms';
app/chat/archived.tsx:130    const platform = usePlatformsStore((s) =>
app/chat/archived.tsx:132        ? findPlatform(s.platforms, conversation.listing.platform)
app/deal/[id].tsx:116        listing:listings(id, title, platform, monthly_price, duration_months),
app/deal/[id].tsx:336        platform={deal.listing?.platform ?? ''}
app/chat/[conversationId].tsx:327  listings(id, title, platform, monthly_price, duration_months),
app/chat/[conversationId].tsx:1500 <PlatformTile platform={platform} size="sm" />
app/(tabs)/index.tsx:43      import { usePlatformsStore } from '../../stores/platforms';
app/(tabs)/index.tsx:338     `title.ilike.%${safe}%,platform.ilike.%${safe}%`,
app/(tabs)/index.tsx:443     // Prime the platforms cache in parallel — auth init already does this on
app/(tabs)/index.tsx:1061    <PlatformTile platform={listing.platform} size="md" />
app/dev/components.tsx:12    import { usePlatformsStore } from '../../stores/platforms';
app/dev/components.tsx:39    const platforms = usePlatformsStore((s) => s.platforms);
app/(tabs)/chat.tsx:14       import { findPlatform } from '../../lib/platforms';
app/(tabs)/chat.tsx:24       import { usePlatformsStore } from '../../stores/platforms';
```

Mobile already has a fully built read path:

- `stores/platforms.ts` — Zustand store that fetches all platforms once per auth init.
- `lib/platforms.ts` — `findPlatform(platforms, id)` resolver helper.
- `components/ui/PlatformTile.tsx` — renders the colored tile with brand initials.
- Used by: home feed, saved, hidden listings, my-listings, post-listing, edit-listing, chat list (archived + main), chat conversation, deal detail, rate/[dealId], dev components.
- Search uses `platform.ilike.%X%` against the listings column (string match, not joined).
[/result]

### 3b — Hardcoded platform names

[query]
```bash
grep -rn "Netflix\|Prime Video\|Spotify\|YouTube Premium\|Disney" \
  --include="*.ts" --include="*.tsx" --include="*.json" \
  ~/Documents/GitHub/bantle/ | grep -v node_modules | head -30
```
[/query]

[result]
```
app/settings.tsx:53                  const SHARE_MESSAGE = `Find sharing partners for Spotify, Netflix, Apple One on Bantle: ${INVITE_URL}`;
app/(auth)/tos-acceptance.tsx:125    Spotify Family, YouTube Premium Family, or Apple One Family.
app/(auth)/tos-acceptance.tsx:178    of service (e.g. Spotify, YouTube Premium, Apple One)
app/(onboarding)/index.tsx:18        'Browse Spotify, YouTube and more\nfamily plans posted by verified users',
lib/platforms.ts:45                  // (e.g. "Spotify Family" instead of "spotify") still resolves to a tile.
lib/platforms.ts:52                  // Spotify regardless of the real listing.
```

All hardcoded references are in **marketing/onboarding copy** (share message, TOS, onboarding carousel) or in `lib/platforms.ts` comments. No hardcoded picker list — the picker reads from the store.
[/result]

### 3c — Listing creation screens

[query]
```bash
ls -la ~/Documents/GitHub/bantle/app/list*.tsx ~/Documents/GitHub/bantle/app/listing*.tsx ~/Documents/GitHub/bantle/app/create*.tsx ~/Documents/GitHub/bantle/app/\(tabs\)/list*.tsx
```
[/query]

[result]
The literal glob matches returned `no matches found` — the listing-creation screens live elsewhere. From Section 3d below, the actual screens are:

- `app/(tabs)/post-listing.tsx` — primary creation screen (uses `usePlatformsStore((s) => s.platforms)` for the picker)
- `app/listing/edit/[id].tsx` — edit existing listing (same store usage)

There's also `app/(tabs)/_layout.tsx` registering `post-listing` as a tab, and `app/listing/[id].tsx` for the listing detail view.
[/result]

### 3d — Platforms-fetching calls

[query]
```bash
grep -rn "from('platforms')\|\.platforms" --include="*.ts" --include="*.tsx" \
  ~/Documents/GitHub/bantle/ | grep -v node_modules | head -20
```
[/query]

[result]
```
app/chat/archived.tsx:132              ? findPlatform(s.platforms, conversation.listing.platform)
app/(tabs)/chat.tsx:207                ? findPlatform(s.platforms, conversation.listing.platform)
app/(tabs)/post-listing.tsx:57         const allPlatforms = usePlatformsStore((s) => s.platforms);
app/dev/components.tsx:39              const platforms = usePlatformsStore((s) => s.platforms);
app/listing/edit/[id].tsx:117          const allPlatforms = usePlatformsStore((s) => s.platforms);
stores/platforms.ts:39                 if (state.loaded) return state.platforms;
stores/platforms.ts:46                   .from('platforms')
components/ui/PlatformTile.tsx:25      const def = usePlatformsStore((s) => findPlatform(s.platforms, platform));
```

The only `from('platforms')` call lives in `stores/platforms.ts` — a single fetch, cached behind the `loaded` flag. All consumers go through the store.
[/result]

## Section 4 — Web app platform usage

### 4a — bantle-web platform references

[query]
```bash
grep -rn "platform" --include="*.ts" --include="*.tsx" \
  ~/Documents/GitHub/bantle-web/app ~/Documents/GitHub/bantle-web/lib \
  ~/Documents/GitHub/bantle-web/components | grep -v node_modules | head -30
```
[/query]

[result]
```
app/admin/page.tsx:54                                      platforms. Listings, deals, audit log, and broadcasts arrive
app/admin/api/users/[id]/listings/route.ts:26              "id, title, platform, category, monthly_price, slots_total, duration_months, status, created_at, archived_at",
app/(marketing)/refund-policy/page.tsx:78                  on the platform.
app/(marketing)/community-guidelines/page.tsx:8            "What we expect from every Bantle member: honest profiles..."
app/(marketing)/terms/page.tsx:230                         Spam, off-platform solicitation, or attempts to redirect
app/(marketing)/terms/page.tsx:231                         users to competing platforms or unrelated services.
lib/admin-actions.ts:19                                    | "platform_created"
lib/admin-actions.ts:20                                    | "platform_updated"
lib/admin-actions.ts:21                                    | "platform_deleted"
components/HeroSection.tsx:57                              <MockListing platform="Spotify" colour="#1ED760" price="₹40" />
components/HeroSection.tsx:58                              <MockListing platform="YouTube Premium" colour="#FF0000" price="₹60" />
components/HeroSection.tsx:59                              <MockListing platform="Apple One" colour="#000000" price="₹125" />
components/admin/AdminNav.tsx:14                           { href: "/admin/platforms", label: "Platforms", icon: Layers },
components/admin/UserListingsTab.tsx:10                    platform: string;
components/admin/UserListingsTab.tsx:128                   <td className="px-4 py-3 text-ink-muted">{listing.platform}</td>
```

Key findings:

- `lib/admin-actions.ts` already defines three audit log kinds: `platform_created`, `platform_updated`, `platform_deleted`. The audit-log infra expects Phase 4 to write these.
- `components/admin/AdminNav.tsx` already has the `/admin/platforms` nav link wired up (icon: Layers).
- `components/admin/UserListingsTab.tsx` displays the raw platform slug in the user-listings table (no resolution to label/brand_color yet).
- `app/admin/api/users/[id]/listings/route.ts` selects `platform` as a column when listing a user's listings — also raw slug.
- Marketing pages reference "platform" generically (Bantle-as-a-platform language) and HeroSection has hardcoded mock listings — unrelated to the catalog.
[/result]

### 4b — Current admin platforms placeholder

[query]
```bash
cat ~/Documents/GitHub/bantle-web/app/admin/platforms/page.tsx
```
[/query]

[result]
```tsx
export const metadata = {
  title: "Platforms — Bantle admin",
  robots: { index: false, follow: false },
};

export default function AdminPlatformsPage() {
  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-3xl mx-auto">
      <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
        Platforms
      </p>
      <h1 className="font-serif italic text-3xl md:text-4xl text-teal-900 leading-[1.1]">
        Platforms
      </h1>
      <p className="mt-5 text-lg text-ink-muted max-w-xl">
        Coming in Phase 4.
      </p>
    </div>
  );
}
```

Server-rendered placeholder with noindex/nofollow. No client logic, no data fetch.
[/result]

## Section 5 — Data quality

### Query 5a — Top platforms by listing count

[query]
```sql
SELECT platform, COUNT(*) as listing_count
FROM listings
GROUP BY platform
ORDER BY listing_count DESC
LIMIT 10;
```
[/query]

[result]
| platform | listing_count |
|---|---|
| netflix | 3 |
| microsoft_365 | 3 |
| spotify | 3 |
| youtube_music | 3 |
| jiohotstar | 2 |
| apple_music | 2 |
| youtube | 2 |
| sony_liv | 2 |
| prime_video | 2 |
| apple_one | 1 |

(Same top values as Query 2a since there are only 11 distinct platforms total. `google_one` (1) is the eleventh and falls outside this LIMIT 10.)
[/result]

### Query 5b — Casing/spacing duplicates

[query]
```sql
SELECT
  LOWER(platform) as normalized,
  COUNT(DISTINCT platform) as variant_count,
  STRING_AGG(DISTINCT platform, ', ') as variants
FROM listings
WHERE platform IS NOT NULL
GROUP BY LOWER(platform)
HAVING COUNT(DISTINCT platform) > 1
ORDER BY variant_count DESC;
```
[/query]

[result]
No rows. **No casing or spacing variants exist** — all 11 distinct values are clean snake_case slugs. The mobile picker has been writing canonical slugs consistently.
[/result]

## Section 6 — Findings summary

1. **The `platforms` table is fully built and live.** Columns are `id (text PK)`, `label`, `category`, `default_monthly_price`, `brand_color`, `brand_initials`, `is_active`, `display_order`, `created_at`. The CHECK constraint pins category to four values (`music`, `video`, `cloud`, `work`); admin CRUD that wants to add categories needs a migration first.

2. **`listings.platform` is unenforced text — no FK to `platforms.id`.** A delete or rename in the catalog has no cascade or restriction, so Phase 4 must either add the FK (after backfilling missing rows) or build app-level guards before exposing destructive operations.

3. **Data is clean.** 11 distinct platform values across 24 listings, all canonical snake_case, no casing or spacing duplicates. Canonicalization is not an issue today.

4. **Mobile read path is complete.** `stores/platforms.ts` fetches once at auth init, `lib/platforms.ts` resolves slugs, `PlatformTile` renders. The post-listing and edit-listing pickers already read from the store — adding a new platform via admin should appear in mobile immediately on the next auth init / store rehydrate (no client release needed unless a new category is introduced).

5. **Web admin scaffolding is partially in place.** The nav link `/admin/platforms` is wired in `AdminNav.tsx`, the placeholder page exists at `app/admin/platforms/page.tsx`, and `lib/admin-actions.ts` already defines the three audit log kinds (`platform_created`, `platform_updated`, `platform_deleted`). Phase 4 is filling in the page body + API routes + audit-log writes — no scaffolding work.

6. **No `updated_at` column on `platforms`.** Phase 4 may want to add one (and a trigger) for the admin UI's "last modified" affordance, otherwise admins can't tell when a platform was last edited.

7. **`UserListingsTab.tsx` displays the raw slug.** Once Phase 4 has the catalog wired, that surface could join on `platforms.label` for a nicer display — out of scope for the immediate Phase 4 work but worth flagging.

8. **No hidden picker constants.** All hardcoded platform names in the mobile repo are marketing/onboarding copy (TOS, share string, carousel) — none of them drive the picker. Replacing them would be a separate copy-edit task, not a Phase 4 dependency.
