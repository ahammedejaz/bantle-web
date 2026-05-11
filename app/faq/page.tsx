import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata = {
  title: "Frequently asked questions",
  description:
    "Common questions about Bantle: what it is, how subscription sharing works, what we do about trust and safety, account management, and supported devices.",
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
            Bantle is an Indian mobile app that helps you find trusted
            partners to share family subscription plans like Spotify,
            YouTube Premium, Apple One and Microsoft 365. Listings are
            organised by platform and price, and a built-in chat lets you
            talk to a potential sharer before committing. Bantle handles
            discovery and conversation only — money moves between users
            directly on UPI.
          </p>
        ),
      },
      {
        q: "Is Bantle free to use?",
        a: (
          <p>
            Yes. Posting and browsing listings, chatting with hosts, and
            running deals through their full lifecycle are all free. Bantle
            doesn&apos;t charge a transaction fee, doesn&apos;t take a
            percentage of your split, and doesn&apos;t show ads.
          </p>
        ),
      },
      {
        q: "Do I need a phone number to use Bantle?",
        a: (
          <p>
            Yes. A working Indian mobile number is required to sign up. We
            send a one-time code via SMS to verify the number, which becomes
            the primary identifier for your account. This single step is the
            backbone of how Bantle keeps the community honest.
          </p>
        ),
      },
      {
        q: "Can I sign in with email instead of phone?",
        a: (
          <p>
            You can also link Google sign-in or an email address as a second
            sign-in method, but a verified phone number is required as the
            primary identity. This is non-negotiable for now — we may
            revisit it once the network is larger.
          </p>
        ),
      },
    ],
  },
  {
    heading: "How sharing works",
    items: [
      {
        q: "Which subscriptions can I share on Bantle?",
        a: (
          <p>
            Any subscription that legally supports a family or shared plan
            and that you have the right to offer to others. Common ones
            today include Spotify Family, YouTube Premium Family, Apple
            One, Microsoft 365 Family, Netflix family plans (where the
            provider permits), JioCinema/Hotstar bundles and similar
            services. Bantle does not verify provider compliance — read the
            provider&apos;s terms before posting.
          </p>
        ),
      },
      {
        q: "How do payments work?",
        a: (
          <p>
            Bantle never holds money. Once a deal is accepted in-app, you
            and your sharing partner exchange UPI handles in the chat and
            pay each other directly each month, the same way you would pay
            anyone else on PhonePe, Google Pay or Paytm.
          </p>
        ),
      },
      {
        q: "What if my partner stops paying mid-deal?",
        a: (
          <p>
            The host can revoke access at any time, end the deal early and
            file a rating that reflects what happened. Bantle can act on
            behavioural reports, suspend the offending account, and prevent
            them from joining new deals. Bantle cannot recover a UPI
            payment — that&apos;s handled via your UPI app&apos;s dispute
            mechanism or directly between the two of you.
          </p>
        ),
      },
      {
        q: "How long is a typical deal?",
        a: (
          <p>
            Hosts pick the duration when they post a listing. Common
            choices are 1 month (trial), 3 months, 6 months and 12 months.
            Twelve-month deals get the most renewals because they line up
            with how many providers bill family plans annually.
          </p>
        ),
      },
    ],
  },
  {
    heading: "Trust and safety",
    items: [
      {
        q: "How do I know other users are real?",
        a: (
          <p>
            Every account is tied to a verified Indian phone number, and
            most active accounts also have a verified email and Google
            sign-in linked. The strongest trust signal, though, is the
            ratings history: hosts and sharers who have been on the platform
            for a few months carry a public track record that is much
            harder to fake than any badge.
          </p>
        ),
      },
      {
        q: "What if someone is rude or scammy?",
        a: (
          <p>
            Open the chat, tap the menu, and report. Reports are private,
            actioned by our moderation queue, and usually resolved within
            24 hours. For anything urgent or unclear, you can also email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        ),
      },
      {
        q: "Can I block someone?",
        a: (
          <p>
            Yes. Open their profile or your chat with them, tap the menu,
            and block. A blocked member can&apos;t see your listings, send
            you messages or propose deals. You can unblock at any time.
          </p>
        ),
      },
      {
        q: "Does Bantle moderate listings and ratings?",
        a: (
          <p>
            We don&apos;t moderate listings before they go live, but every
            listing is subject to our{" "}
            <Link href="/community-guidelines">community guidelines</Link>{" "}
            and can be removed if reported. We only intervene in ratings if
            they are clearly abusive — ratings are designed to be honest
            signals, not curated reviews.
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
            change your mind. After 7 days, your profile, listings, deals
            history and chat content are deleted from active databases.
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
        q: "Can I change my phone number?",
        a: (
          <p>
            Yes. From Settings → Edit profile → Phone, you can start a
            number change. We verify the new number via OTP and migrate your
            account, ratings and chat history to it. We strongly recommend
            doing this from a stable network and with both SIMs handy in
            case you need to fall back.
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
            shortly after. Android 9 (Pie) and above is supported. There is
            no Bantle website experience for end users beyond this marketing
            site — listings, chat, and deals all live in the mobile app.
          </p>
        ),
      },
      {
        q: "Why am I not getting verification emails?",
        a: (
          <p>
            Check your spam, promotions or junk folder first — transactional
            emails from new domains sometimes land there until you mark them
            as not spam. If you still don&apos;t see anything after a few
            minutes, request the email again from the app. If the second
            attempt also fails, write to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and
            we&apos;ll resend manually.
          </p>
        ),
      },
      {
        q: "I can't sign in — what should I do?",
        a: (
          <p>
            The most common cause is a network issue while the OTP is being
            delivered. Force-quit the app, switch from Wi-Fi to mobile data
            (or vice versa), and try again. If the OTP itself never arrives,
            tap &quot;resend&quot;. If your number recently changed
            providers (MNP), the SMS route can take 24-48 hours to stabilise
            — Google sign-in is a good fallback in the meantime.
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
