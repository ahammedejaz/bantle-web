import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata = {
  title: "Frequently asked questions",
  description:
    "Common questions about Bantle: monthly sharing, one-time access, safety, account management, and why payment happens outside Bantle.",
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
            single identifier we use, and it&apos;s also how the people in
            your household send each other invites to a plan.
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
        q: "Why is Bantle household-only?",
        a: (
          <p>
            Almost every &ldquo;family&rdquo; or &ldquo;household&rdquo;
            subscription tier was designed for people living at the same
            address or belonging to an approved family group. Providers
            set and enforce those rules in different ways. A
            stranger-discovery model for these plans can violate provider
            terms and put both sides in an awkward position. Bantle is
            built for the coordination use cases providers commonly
            allow.
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
            We&apos;re launching on Android first, with iOS to follow
            shortly after. Android 9 (Pie) and above is supported. There
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

export default function FAQPage() {
  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Common questions, answered directly."
        intro="If you don't see your question here, write to us — we read every email and update this page when patterns emerge."
      />
      <article className="container-x py-12 md:py-16 max-w-3xl">
        <div className="space-y-14">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-serif text-2xl md:text-3xl text-teal-900 mb-6 tracking-tightish">
                {section.heading}
              </h2>
              <div className="space-y-6">
                {section.items.map((item) => (
                  <details
                    key={item.q}
                    className="group border border-line bg-cream-card rounded-card p-5 open:bg-cream-card"
                  >
                    <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                      <span className="font-medium text-[16px] text-ink leading-snug">
                        {item.q}
                      </span>
                      <span
                        aria-hidden="true"
                        className="shrink-0 text-teal-600 mt-1 transition-transform group-open:rotate-45 text-xl leading-none"
                      >
                        +
                      </span>
                    </summary>
                    <div className="mt-4 prose-bantle text-[15px] leading-7">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="mt-16 bg-teal-100 border border-line rounded-card p-6">
          <p className="text-[15px] text-teal-900">
            Still stuck?{" "}
            <Link
              href="/support"
              className="underline underline-offset-2 hover:text-teal-700"
            >
              Head to the support page
            </Link>{" "}
            for the fastest way to reach a real person.
          </p>
        </div>
      </article>
    </>
  );
}
