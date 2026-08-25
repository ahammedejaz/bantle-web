# Pre-Production P2 Fix — Support Page Auth & Platform Copy (Web)

## 1. Summary

The public `/support` page contained troubleshooting copy that
contradicted Bantle's real authentication and platform model. It implied
**OTP/SMS** delivery, **phone-number sign-in**, and **Play-Store-only**
availability. Bantle uses **email-based sign-in** (no SMS, no phone
number as identifier) and targets **Android and iOS**. This is a
copy-only fix to the support page; no other page, component, or logic
was changed.

## 2. Branch

`feature/trust-verification-admin-queues`

## 3. Audit finding (P2-1)

> `app/(marketing)/support/page.tsx` references OTP/SMS/phone sign-in and
> Play-Store-only wording. This contradicts Bantle's current email-only
> sign-in model and Android+iOS positioning.

## 4. Copy issue

Three spots on the support page were inaccurate:

| Location | Old copy (incorrect) |
| --- | --- |
| "Before you email" bullet | "…especially when an **OTP** hasn't arrived. **SMS** delivery can be carrier-dependent." |
| "Before you email" bullet | "Update Bantle **from the Play Store**…" (Android-only) |
| "What to include" bullet | "The **phone number** or email you use to sign in…" |

These contradicted `/privacy`, `/faq`, and `/terms`, which correctly state
Bantle does **not** collect phone numbers and does **not** use SMS.

## 5. Fix implemented

Rewrote the three spots to match the email-only, cross-platform model:

| Location | New copy |
| --- | --- |
| Email troubleshooting | "Check your inbox, spam, and promotions folders for emails from Bantle, especially when a sign-in or verification email hasn't arrived. Switching between Wi-Fi and mobile data can also help." |
| App update | "Update Bantle to the latest available version for your device on Android or iOS. Once we go live, we'll push fixes regularly and older versions sometimes hit edge cases." |
| What to include | "The email address you use to sign in (so we can find your account)." |

No mention of OTP, SMS, phone-number sign-in, or Play-Store-only remains.

## 6. What did NOT change

- No other marketing page (privacy/faq/terms/safety correctly already say
  "no SMS / no phone numbers" — left intact).
- No SEO title, tagline, metadata, JSON-LD, robots, or sitemap.
- No admin panel, auth, middleware, service-role, or API logic.
- No DB/RLS/functions/storage.
- No components or shared constants.

## 7. Validation results

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | PASS (exit 0) |
| `npm run lint` | PASS (exit 0) |
| `npm run build` | PASS (exit 0) |
| `git diff --check` | clean |
| Stale-copy grep on `support/page.tsx` for `OTP\|SMS\|phone number\|Play Store` | no matches |

## 8. Files changed

- `app/(marketing)/support/page.tsx` — three copy edits.
- `reports/PRE_PRODUCTION_P2_SUPPORT_COPY_FIX_REPORT.md` — this report.

## 9. Risks / blockers

- None. Copy-only, statically rendered page; no behavioral change.

## 10. Next step

Optional P3 polish (separate task): align the OG/Twitter image headline to
the full "split or buy" tagline and confirm the canonical home `<title>`
string. Not part of this P2 fix.
