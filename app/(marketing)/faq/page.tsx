import { isValidElement, type ReactNode } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { OG_BASE, TWITTER_BASE } from "@/lib/seo";
import { JsonLd } from "@/components/site/JsonLd";
import {
  breadcrumbNode,
  faqPageNode,
  jsonLd,
} from "@/lib/structured-data";
import { ArrowLink } from "@/components/site/ArrowLink";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata = {
  title: "Frequently asked questions",
  description:
    "Common questions about Bantle: monthly sharing, one-time access, safety, account management, and why payment happens outside Bantle.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    ...OG_BASE,
    url: "/faq",
    title: "Frequently asked questions",
    description: "Common questions about Bantle: monthly sharing, one-time access, safety, account management, and why payment happens outside Bantle.",
  },
  twitter: {
    ...TWITTER_BASE,
    title: "Frequently asked questions",
    description: "Common questions about Bantle: monthly sharing, one-time access, safety, account management, and why payment happens outside Bantle.",
  },
};

interface QA {
  q: string;
  a: React.ReactNode;
}

interface Section {
  heading: string;
  items: QA[];
}

const sections: Section[] = [
  {
    heading: "Getting started",
    items: [
      {
        q: "What is Bantle?",
        a: (
          <p>
            Bantle is an Indian mobile app for coordinating subscription
            access. Hosts can list monthly sharing or one-time access for
            a remaining subscription period, then both sides confirm
            terms in chat. Any payment moves directly between users
            outside Bantle.
          </p>
        ),
      },
      {
        q: "Is Bantle free to use?",
        a: (
          <p>
            Yes. Adding listings, chatting, proposing deals and accepting
            deals are free. Bantle doesn&apos;t charge a transaction fee,
            doesn&apos;t take a percentage of your arrangement, and
            doesn&apos;t show ads.
          </p>
        ),
      },
      {
        q: "How do I sign in?",
        a: (
          <p>
            Bantle uses email-based sign-in. You enter your email, we send
            a verification message, you confirm, and you&apos;re in.
            Optionally you can link Google sign-in for one-tap access.
            No SMS step is involved.
          </p>
        ),
      },
      {
        q: "Do I need to give Bantle my phone number?",
        a: (
          <p>
            No. Bantle does not collect phone numbers. Your email is the
            single identifier we use, and it&apos;s also how the people
            you coordinate a plan with send each other invites.
          </p>
        ),
      },
    ],
  },
  {
    heading: "How coordination works",
    items: [
      {
        q: "Which subscriptions can I coordinate on Bantle?",
        a: (
          <p>
            Any subscription access that you have the right to
            coordinate and that does not violate the provider&apos;s terms.
            Bantle supports monthly sharing and one-time access listings,
            but does not verify provider compliance — read the
            provider&apos;s terms before you add a listing.
          </p>
        ),
      },
      {
        q: "Does Bantle only work for people in the same household?",
        a: (
          <p>
            No. Bantle helps people split or buy subscription access
            wherever the provider&apos;s terms allow it. Some
            &ldquo;family&rdquo; or &ldquo;household&rdquo; plans do
            require members to live at the same address or belong to an
            approved family group, while other arrangements may be
            permitted more broadly. Providers set and enforce those rules
            differently, so you must check and follow the
            provider&apos;s own terms before listing, requesting, or
            buying access. Bantle is not a tool for bypassing provider
            rules.
          </p>
        ),
      },
      {
        q: "Can I share with friends who don't live with me?",
        a: (
          <p>
            You should only coordinate access when the provider&apos;s
            rules allow it. Many household or family-plan subscriptions
            require the same residence or an approved family group. Bantle
            is not a tool for bypassing those rules, and users remain
            responsible for provider consequences if they coordinate
            access in a way the provider does not permit.
          </p>
        ),
      },
      {
        q: "What is one-time access?",
        a: (
          <p>
            One-time access means a host is offering access for the
            remaining period shown, for a one-time price. It is not an
            account sale or ownership transfer. Bantle does not verify the
            remaining duration, process payments, or promise access.
            Confirm the details directly in chat before paying outside
            Bantle.
          </p>
        ),
      },
      {
        q: "How do payments work?",
        a: (
          <p>
            Bantle never holds money. For monthly sharing or one-time
            access, payment happens directly between users outside Bantle
            by a method they mutually choose. Bantle does not process or
            verify payments, promise access, or promise duration.
            Confirm access details directly before paying.
          </p>
        ),
      },
      {
        q: "Can I list household or family subscriptions?",
        a: (
          <p>
            Only when the provider&apos;s own terms allow it. Some family,
            household, or location-based plans may require members to be in
            the same household or location. Bantle does not override provider
            rules or verify whether your arrangement is permitted — you are
            responsible for confirming that before you list, request, or buy
            access. When posting a monthly household plan, Bantle asks you to
            confirm you are sharing within your household.
          </p>
        ),
      },
      {
        q: "Do I need identity verification to post a listing?",
        a: (
          <p>
            Yes. To post a listing on Bantle you must complete identity
            verification (a private selfie review) or be approved as a
            business or partner profile. Verification helps reduce fake
            accounts; it does not guarantee deals, payment, or access.
          </p>
        ),
      },
      {
        q: "What trust badges can I see on Bantle?",
        a: (
          <p>
            Bantle shows <strong>Identity verified</strong>,{" "}
            <strong>Business verified</strong> and{" "}
            <strong>Partner verified</strong> badges. A badge signals that
            Bantle reviewed an account and helps reduce fake accounts, but
            it is not a guarantee of payment, access, refunds, or deal
            safety.
          </p>
        ),
      },
      {
        q: "Why is my activity limited before I verify?",
        a: (
          <p>
            Unverified accounts have limited deal activity — for example,
            keeping only one pending or active deal at a time — until
            identity verification, or business/partner approval, is
            completed.
          </p>
        ),
      },
      {
        q: "How often can I change my display name?",
        a: (
          <p>
            Up to 2 approved name changes per year (within any 365 days).
            An approved name change may require you to verify your identity
            again to restore your Identity verified badge.
          </p>
        ),
      },
      {
        q: "Can a business or partner sell on Bantle?",
        a: (
          <p>
            Yes. Businesses and partners can reach out to Bantle to be
            reviewed for a business or partner profile — email{" "}
            <a href="mailto:support@bantle.in">support@bantle.in</a>.
            Approved profiles can post listings and may receive a Business
            verified or Partner verified badge.
          </p>
        ),
      },
      {
        q: "What happens if my household composition changes?",
        a: (
          <p>
            People move, families shift, partners come and go. From inside
            any plan you can remove the member who&apos;s leaving,
            reassign their slot, add a new household member, or close the
            plan entirely. Past settlement history stays intact so
            nobody has to remember whether September was settled.
          </p>
        ),
      },
      {
        q: "What if a household member stops paying?",
        a: (
          <p>
            The host can remove the slot at any time and rebalance the
            split across the remaining members. Bantle can also act on
            behavioural reports if there&apos;s a pattern across multiple
            plans. Bantle cannot recover a payment, refund or compensate
            you, verify whether payment happened, or promise access.
            Disputes are handled with your payment provider, your bank,
            appropriate legal channels, or directly between the members
            involved.
          </p>
        ),
      },
    ],
  },
  {
    heading: "Trust and safety",
    items: [
      {
        q: "How does Bantle keep things safe?",
        a: (
          <p>
            Every account is email-verified, and users can also submit a
            selfie for identity verification that our team reviews manually
            and keeps private — it is never shown on public profiles. Plans
            and chats stay private to the people involved, buyers propose
            before full chat opens, and any member can report or block at any
            time. A reviewed badge is a helpful signal, not a guarantee about
            any user.
          </p>
        ),
      },
      {
        q: "Is my identity verification selfie public?",
        a: (
          <p>
            No. If you submit a selfie for identity verification, it is
            uploaded to private storage, reviewed manually by our team through
            short-lived access, and is never shown on your public profile or
            used for marketing. Bantle does not use biometric matching or
            liveness detection, and does not request your location for
            verification. You can read more in our{" "}
            <Link href="/privacy">privacy policy</Link>.
          </p>
        ),
      },
      {
        q: "What if someone in my plan is rude or behaves badly?",
        a: (
          <p>
            Open the chat or plan, tap the menu, and report. Reports are
            private, actioned by our moderation queue, and usually
            resolved within 24 hours. For anything urgent or unclear, you
            can also email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        ),
      },
      {
        q: "Can I block someone?",
        a: (
          <p>
            Yes. Open their profile or your chat with them, tap the menu,
            and block. A blocked member can&apos;t see your plans, send
            you messages or request to join. You can unblock at any time.
          </p>
        ),
      },
      {
        q: "Does Bantle moderate content?",
        a: (
          <p>
            Bantle plans are private by design, so there isn&apos;t much
            public content to moderate in the first place. What we do
            moderate, on report, is behaviour inside chats and plans
            that violates our{" "}
            <Link href="/community-guidelines">community guidelines</Link>.
          </p>
        ),
      },
    ],
  },
  {
    heading: "Account",
    items: [
      {
        q: "How do I delete my account?",
        a: (
          <p>
            Go to Settings → Account → Delete account. You&apos;ll see a
            7-day grace window before everything is permanently removed —
            this is to protect you in case you tap delete by accident or
            change your mind. After 7 days, your profile, plans, history
            and chat content are deleted from active databases.
          </p>
        ),
      },
      {
        q: "Will my data be removed after deletion?",
        a: (
          <p>
            Yes. After the 7-day grace period your active data is hard
            deleted. Anonymised analytics events (which never contain your
            identity) remain for up to 24 months. We retain transactional
            audit logs strictly to the extent that Indian law requires.
            More detail lives in our{" "}
            <Link href="/privacy">privacy policy</Link>.
          </p>
        ),
      },
      {
        q: "How do I change my email address?",
        a: (
          <p>
            From Settings → Edit profile → Email, start an email change.
            We send a verification message to the new address, and once
            you confirm it your account migrates over with all your
            plans, history and chats intact.
          </p>
        ),
      },
    ],
  },
  {
    heading: "Technical",
    items: [
      {
        q: "What devices does Bantle support?",
        a: (
          <p>
            Bantle is available on Google Play and the App Store.
            Android 9 (Pie) and above is supported. There
            is no Bantle website experience for end users beyond this
            marketing site — plans, chat and settlement all live in the
            mobile app.
          </p>
        ),
      },
      {
        q: "Why am I not getting verification emails?",
        a: (
          <p>
            Check your spam, promotions or junk folder first &mdash;
            transactional emails from new domains sometimes land there
            until you mark them as not spam. If you still don&apos;t see
            anything after a few minutes, request the email again from
            the app. If the second attempt also fails, write to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and
            we&apos;ll resend manually.
          </p>
        ),
      },
      {
        q: "I can't sign in — what should I do?",
        a: (
          <p>
            Email-based sign-in failures usually trace back to one of
            three things: the verification email landed in spam, the
            email address has a typo, or the device is offline. Check
            spam, retype the address carefully, and switch networks if
            needed. If you&apos;ve linked Google sign-in earlier, that
            route is a quick fallback.
          </p>
        ),
      },
    ],
  },
];

// FAQ answers are authored as JSX so they can carry links and emphasis. The
// schema needs the same words as plain text, so it is derived from the rendered
// tree rather than maintained as a second copy that could drift.
function toPlainText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toPlainText).join("");
  if (isValidElement(node)) {
    return toPlainText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

const structuredData = jsonLd([
  faqPageNode({
    path: "/faq",
    name: String(metadata.title),
    description: String(metadata.description),
    items: sections.flatMap((section) =>
      section.items.map((item) => ({
        question: item.q,
        answer: toPlainText(item.a).replace(/\s+/g, " ").trim(),
      }))
    ),
  }),
  breadcrumbNode([{ name: "FAQ", path: "/faq" }]),
]);

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function FAQPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <PageHeader
        crumb="FAQ"
        title="Common questions, answered directly."
        intro="If you don't see your question here, write to us — we read every email and update this page when patterns emerge."
      />
      <div className="bg-canvas">
        <div className="container-x py-14 md:py-20">
          <div className="mx-auto grid max-w-[64rem] gap-10 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-16">
            {/* Jump list. Sticky on large screens; a plain index above the
                questions everywhere else. */}
            <nav
              aria-label="Question categories"
              className="lg:sticky lg:top-28 lg:self-start"
            >
              <p className="mb-4 text-[12.5px] font-medium text-fg-muted">
                Categories
              </p>
              <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                {sections.map((section) => (
                  <li key={section.heading}>
                    <a
                      href={`#${slugify(section.heading)}`}
                      className="inline-flex rounded-full px-3 py-1.5 text-[14px] font-medium text-fg-muted transition-colors hover:bg-accent-sub hover:text-accent lg:px-3"
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="min-w-0">
              <div className="space-y-16">
                {sections.map((section) => (
                  <section
                    key={section.heading}
                    id={slugify(section.heading)}
                    className="scroll-mt-28"
                  >
                    <h2 className="mb-2 font-display text-[26px] font-semibold tracking-tight text-heading md:text-[30px]">
                      {section.heading}
                    </h2>
                    <div className="grid">
                      {section.items.map((item) => (
                        <details
                          key={item.q}
                          className="disclosure group border-b border-edge first:border-t"
                        >
                          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5">
                            <span className="font-display text-[17px] font-semibold leading-snug tracking-tight text-heading transition-colors group-hover:text-accent">
                              {item.q}
                            </span>
                            <span
                              aria-hidden="true"
                              className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-accent ring-1 ring-edge-2 transition-transform duration-200 ease-out group-open:rotate-45"
                            >
                              <span className="relative block h-3 w-3">
                                <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current" />
                                <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
                              </span>
                            </span>
                          </summary>
                          <div className="prose-bantle pb-5 pr-8">{item.a}</div>
                        </details>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div className="mt-14 rounded-panel bg-surface p-6 shadow-soft ring-1 ring-edge sm:p-7">
                <h2 className="font-display text-[19px] font-semibold tracking-tight text-heading">
                  Still stuck?
                </h2>
                <p className="mt-2 text-[15px] leading-[1.7] text-fg-muted">
                  Support emails go straight to a person, not a triage queue.
                </p>
                <div className="mt-5">
                  <ArrowLink href="/support">Head to the support page</ArrowLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
