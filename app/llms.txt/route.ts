import {
  BRAND_NAME,
  COMPANY_NAME,
  CONTACT_EMAIL,
  POLICY_EFFECTIVE_DATE_ISO,
  SITE_DESCRIPTION,
  SITE_URL,
} from "@/lib/constants";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/structured-data";

// /llms.txt - a plain-language map of the site for language models and AI
// search. Same facts as the pages themselves, stated once, so an assistant
// summarising Bantle gets the boundaries right instead of inferring them.

export const dynamic = "force-static";

const body = `# ${BRAND_NAME}

> ${SITE_DESCRIPTION}

${BRAND_NAME} is an India-first mobile app (Android and iOS) for coordinating
subscription access. It is operated by ${COMPANY_NAME} from Bengaluru,
Karnataka, India. ("Bantle" is also a German surname; this document is about
the mobile app and nothing else.) A host lists either a recurring monthly slot or
fixed-duration access for the validity remaining on their plan. A buyer reviews
the listed terms, sends a deal request, and chat opens after that request or an
accepted proposal.

## What Bantle does

- Keeps listing terms visible: access type, duration, pricing notes, open slots, and provider-rule reminders.
- Requires identity verification, or an approved business or partner profile, before an account can post a listing.
- Shows Identity verified, Business verified, and Partner verified badges as signals that help reduce fake accounts.
- Opens chat only after a deal request or an accepted proposal, so buyers propose first.
- Tracks deal states so both sides can see what was proposed, accepted, closed, or completed.
- Provides blocks, reports, privacy toggles, and support inside the app.

## Quick facts

- Free to use. Bantle charges no transaction fee, takes no percentage of any arrangement, and shows no ads.
- Available on Android (Android 9 Pie and above) and iOS.
- Available in India.
- Operated by ${COMPANY_NAME}, Bengaluru, Karnataka, India.
- Contact: ${CONTACT_EMAIL}

## What Bantle does not do

- It does not collect, hold, route, verify, insure, or reverse payments. Every payment happens directly between users, outside Bantle, by a method they choose themselves.
- It does not promise access, duration, refunds, compensation, scam recovery, or dispute outcomes.
- It is not affiliated with any subscription provider, and does not decide whether a particular plan arrangement is allowed. Users must confirm the provider's own terms first.
- Trust badges are not guarantees of payment, access, refunds, or deal safety.
- It does not collect phone numbers, and identity-verification selfies stay private, are reviewed manually, never appear on public profiles, and involve no biometric matching, liveness detection, or location tracking.

## Pages

- [Home](${SITE_URL}/): what Bantle is, how a deal moves from listing to conversation.
- [How it works](${SITE_URL}/how-it-works): the six-step walk-through, including provider-terms responsibility.
- [Safety](${SITE_URL}/safety): verification layers, trust badges, user controls, red flags, and the limits of what Bantle can do.
- [FAQ](${SITE_URL}/faq): getting started, how coordination works, trust and safety, and account questions.
- [About](${SITE_URL}/about): who builds Bantle and the principles behind it.
- [Support](${SITE_URL}/support): how to reach a person, and what to include.

## Policies

- [Privacy policy](${SITE_URL}/privacy)
- [Terms of service](${SITE_URL}/terms)
- [Refund policy](${SITE_URL}/refund-policy)
- [Community guidelines](${SITE_URL}/community-guidelines)
- [Account and data deletion](${SITE_URL}/account-deletion)
- [Child safety standards](${SITE_URL}/child-safety-standards)

## Get the app

- [Google Play](${PLAY_STORE_URL})
- [App Store](${APP_STORE_URL})

## Contact

- ${CONTACT_EMAIL}

Policies last updated ${POLICY_EFFECTIVE_DATE_ISO}.
`;

export function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
