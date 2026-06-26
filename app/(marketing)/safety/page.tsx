import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata = {
  title: "Safety",
  description:
    "How Bantle helps keep monthly sharing and one-time access coordination clear, with payment and access confirmation outside Bantle.",
};

export default function SafetyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Trust &amp; safety"
        title="A quiet, layered approach to keeping Bantle safe."
        intro="Bantle keeps subscription coordination explicit: email verification, listing terms, chat, blocks, reports, ratings and mandatory deal safety acknowledgements all support safer direct coordination."
      />
      <div className="bg-gradient-to-b from-teal-50/50 via-cream to-cream">
        <div className="container-x py-12 md:py-16">
          <article className="prose-bantle mx-auto max-w-3xl rounded-3xl border border-line bg-white p-6 shadow-[0_22px_60px_-28px_rgba(0,60,52,0.28)] md:p-10">
        <section>
          <h2>Trust starts with clear terms</h2>
          <p>
            Bantle is designed to make subscription arrangements explicit
            before anyone coordinates outside the app. Monthly sharing
            shows the monthly price and commitment. One-time access shows
            the one-time price, months remaining, access method and access
            notes.
          </p>
          <p>
            Bantle does not verify payment, access, or duration. The safer
            pattern is to confirm access details directly in chat before
            paying outside Bantle, and to avoid any arrangement that
            appears to violate the provider&apos;s rules.
          </p>
        </section>

        <section>
          <h2>Verification layers</h2>
          <ul>
            <li>
              <strong>Email verification.</strong> Every account is
              confirmed via a verification email at sign-up. The same email
              becomes your sign-in method and your backup channel if push
              notifications fail.
            </li>
            <li>
              <strong>Google sign-in.</strong> An optional second identity
              signal for members who prefer it — useful if you tend to lose
              passwords.
            </li>
            <li>
              <strong>Identity verification.</strong> Users can submit a
              selfie for identity verification. The selfie is stored
              privately, reviewed manually by our team through short-lived
              access, and is never shown on public profiles or used for
              marketing. Bantle does not use biometric matching or liveness
              detection and does not request your location for verification.
              A reviewed badge is a helpful signal, not a guarantee about any
              user.
            </li>
            <li>
              <strong>Deal safety acknowledgement.</strong> Before a deal
              is proposed or accepted, Bantle reminds users that payment
              happens outside Bantle and that Bantle does not verify
              payment, access or duration, or promise any outcome.
            </li>
            <li>
              <strong>Ratings over time.</strong> If a household member
              repeatedly fails to settle on time, the rating they build up
              becomes a useful internal signal for the next time you
              consider adding them to a new plan.
            </li>
          </ul>
        </section>

        <section>
          <h2>What you control</h2>
          <ul>
            <li>
              <strong>Block.</strong> Block any member you no longer want
              involved with your plans or chats. Blocked members can&apos;t
              see your plans, send you messages, or request to be added.
            </li>
            <li>
              <strong>Report.</strong> A single in-app report puts the
              other member&apos;s account in front of our moderation
              queue. Reports are private — the reported member is never
              told who filed it.
            </li>
            <li>
              <strong>Hide or pause your plans.</strong> Pause invitations
              into your plan, or hide it from the rest of the household
              while you sort something out.
            </li>
            <li>
              <strong>Privacy.</strong> Toggle online presence, last-seen
              and read receipts in Settings — the same way you would on
              any modern messenger.
            </li>
          </ul>
        </section>

        <section>
          <h2>Red flags before coordinating</h2>
          <p>
            Most Bantle arrangements should be simple and explicit. Watch
            for anything that contradicts the listing or avoids direct
            confirmation:
          </p>
          <ul>
            <li>
              A member of the plan asks you to add somebody outside the
              household. Bantle is not designed for that; the underlying
              subscription provider typically isn&apos;t either.
            </li>
            <li>
              Someone wants to move the conversation off Bantle to settle
              outside the agreed split — usually a sign that the
              arithmetic is about to get fuzzy.
            </li>
            <li>
              Requests for payment or access details that do not match
              what you already confirmed directly with the other member.
            </li>
            <li>
              One-time access where the host refuses to confirm months
              remaining, access method, access notes, or provider rules.
            </li>
            <li>
              Pressure to share OTPs, account passwords, or your primary
              email password — never required for any normal household
              split.
            </li>
            <li>
              A member who has stopped using the actual subscription but
              keeps occupying a slot. Talk it through; close the slot if
              they&apos;ve effectively moved on.
            </li>
          </ul>
        </section>

        <section>
          <h2>If something goes wrong</h2>
          <ol>
            <li>
              <strong>Pause before paying.</strong> If details do not
              match or a user pressures you, stop coordinating before more
              money moves outside Bantle.
            </li>
            <li>
              <strong>File a report.</strong> Open the chat or plan, tap
              the menu, choose Report. Pick the category that fits and
              include any detail you have. Reports go to our queue and
              most are actioned within 24 hours.
            </li>
            <li>
              <strong>Leave an honest rating.</strong> If the issue
              already played out, your rating becomes a useful signal the
              next time anyone in your household considers adding the
              same person to a plan.
            </li>
            <li>
              <strong>Email us if it&apos;s serious.</strong> Write to{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with
              a short summary if you need direct human help.
            </li>
          </ol>
        </section>

        <section>
          <h2>Important: Bantle is coordination only</h2>
          <p>
            Bantle does not hold, route, process, verify or insure your
            payments. Every rupee that changes hands moves directly
            between users outside Bantle. If a payment dispute occurs —
            wrong amount sent, duplicate transfer, refund needed, failed
            access, unclear one-time access duration or suspected scam —
            those are
            resolved with your payment provider, your bank, appropriate
            legal channels, or directly between the members involved.
          </p>
          <p>
            What we can do: act on behavioural issues, suspend or remove
            accounts that violate our{" "}
            <Link href="/community-guidelines">community guidelines</Link>,
            and make sure repeat offenders don&apos;t get a second chance.
            What we can&apos;t do: reverse a transfer, refund or
            compensate you, verify a payment, promise access or
            subscription duration, or promise the outcome of any
            specific household arrangement.
          </p>
        </section>
          </article>
        </div>
      </div>
    </>
  );
}
