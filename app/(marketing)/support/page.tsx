import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CONTACT_EMAIL, FEEDBACK_EMAIL } from "@/lib/constants";

export const metadata = {
  title: "Support",
  description:
    "Reach a real person at Bantle. Support, feedback and press contacts, plus a quick troubleshooting checklist before you write.",
};

export default function SupportPage() {
  return (
    <>
      <PageHeader
        eyebrow="Support"
        title="Talk to a real person at Bantle."
        intro="We're a small team — emails come straight to humans, not a triage queue. We aim to reply within two business days."
      />
      <div className="bg-gradient-to-b from-teal-50/50 via-cream to-cream">
        <article className="container-x py-12 md:py-16 max-w-3xl">
        <section className="grid gap-6 md:grid-cols-2">
          <ContactCard
            label="General support"
            email={CONTACT_EMAIL}
            body="Account questions, trouble using the app, bug reports, listings and deals."
          />
          <ContactCard
            label="Product feedback"
            email={FEEDBACK_EMAIL}
            body="Feature requests, what's confusing, what's working, anything you wish Bantle did differently."
          />
        </section>

        <section className="mt-14 prose-bantle">
          <h2>Before you email</h2>
          <p>
            A surprising number of issues clear up after one of these:
          </p>
          <ul>
            <li>
              Force-quit and reopen the app. Most temporary glitches go
              away.
            </li>
            <li>
              Switch between Wi-Fi and mobile data, especially when an OTP
              hasn&apos;t arrived. SMS delivery can be carrier-dependent.
            </li>
            <li>
              Update Bantle from the Play Store. Once we go live, we&apos;ll
              push fixes weekly and older versions sometimes hit edge
              cases.
            </li>
            <li>
              Check the{" "}
              <Link href="/faq">FAQ</Link> — about three quarters of
              support emails turn out to be questions already answered
              there.
            </li>
          </ul>
        </section>

        <section className="mt-12 prose-bantle">
          <h2>What to include in your email</h2>
          <p>
            We can help much faster if you include a few specifics up front:
          </p>
          <ul>
            <li>The phone number or email you use to sign in (so we can find your account).</li>
            <li>Your device — model, Android or iOS version, app version.</li>
            <li>What you were trying to do, and what happened instead.</li>
            <li>A screenshot if anything looked unusual.</li>
            <li>Any error message you saw, copied or photographed.</li>
          </ul>
        </section>

        <section className="mt-12 prose-bantle">
          <h2>Press and partnerships</h2>
          <p>
            For press inquiries, write to{" "}
            <a href={`mailto:${CONTACT_EMAIL}?subject=%5BPRESS%5D`}>
              {CONTACT_EMAIL}
            </a>{" "}
            with the subject line <code>[PRESS]</code>. For partnership or
            integration ideas, same address with subject{" "}
            <code>[PARTNERSHIP]</code>.
          </p>
        </section>
        </article>
      </div>
    </>
  );
}

function ContactCard({
  label,
  email,
  body,
}: {
  label: string;
  email: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-[0_12px_34px_-20px_rgba(0,60,52,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-24px_rgba(0,60,52,0.3)]">
      <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-3">
        {label}
      </p>
      <a
        href={`mailto:${email}`}
        className="block font-serif text-xl text-teal-900 underline underline-offset-2 hover:text-teal-700"
      >
        {email}
      </a>
      <p className="mt-3 text-[15px] leading-7 text-ink-muted">{body}</p>
    </div>
  );
}
