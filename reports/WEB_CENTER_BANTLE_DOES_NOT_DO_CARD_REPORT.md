# Bantle Web — Center "What Bantle does not do" Card Report

**Status:** Visual hotfix (single className change)
**Date:** 2026-06-27
**Web repo:** `/Users/syedejazahammed/Documents/GitHub/bantle-web`
**Branch:** `hotfix/center-bantle-does-not-do-card` → `main`
**Mobile repo:** not modified

## 1. Summary
Vertically centered the homepage "What Bantle does not do" card content within
the card height. No copy, SEO, legal, or other section changed.

## 2. Branch
`hotfix/center-bantle-does-not-do-card` (cut from clean `main`), merged `--no-ff`.

## 3. Founder issue
Card content sat too high at the top of the card; it should be vertically
centered within the card.

## 4. Exact file / card changed
`app/(marketing)/page.tsx` — the `SafetyAndLimits()` right-hand card
(`<div>` wrapping the Ban icon, "What Bantle does not do" heading, and the
limits list).

## 5. Layout fix
Added `flex h-full flex-col items-center justify-center` to that card div. The
2-column grid already stretches the card to the taller left column's height, so
`h-full` + `justify-center` vertically centers the icon/heading/list. Existing
`text-center` and `items-center` keep horizontal centering. On mobile (single
column) the card height equals its content, so this stays visually balanced.

## 6. What did not change
- All text/copy, SEO/metadata/title, legal/safety/FAQ/privacy wording.
- The left-side safety bullet list and every other homepage section.
- Colors, brand, global spacing. Admin, DB/backend/RLS/functions, mobile.
- Dependencies. No screenshots reintroduced.

## 7. Validation results
- `npx tsc --noEmit` → PASS
- `npm run lint` → PASS (0 errors/warnings)
- `npm run build` → PASS (44/44 static)
- `git diff --check` → clean
- Diff = one className change only; no copy/metadata changes.
- Mobile repo: only pre-existing builds/*.apk deletions; unchanged.

## 8. Files changed
```text
app/(marketing)/page.tsx   (one card div className)
reports/WEB_CENTER_BANTLE_DOES_NOT_DO_CARD_REPORT.md  (this report)
```

## 9. Next step
Founder hard-refreshes to confirm the card content is vertically centered on
desktop and looks balanced on mobile. Deploy `main`.
