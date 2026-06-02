import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata = {
  title: "Safety",
  description:
    "How Bantle helps you keep your household's subscription coordination tidy, your account in your control, and any misuse easy to report. Bantle is a coordination tool — money flows happen outside it.",
};

export default function SafetyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Trust &amp; safety"
        title="A quiet, layered approach to keeping Bantle safe."
        intro="Bantle's strongest safety signal isn't a verification badge — it's the fact that everyone on a plan already lives with each other. Email verification, blocks, reports and ratings handle the edge cases."
      />
      <article className="container-x py-12 md:py-16 prose-bantle max-w-3xl">
        <section>
          <h2>Trust starts with your household</h2>
          <p>
            Bantle is designed for the people you already live with —
            roommates, family, partners. The single most important safety
            principle on Bantle is that you should not be coordinating a
            subscription with somebody you wouldn&apos;t hand a spare key
            to. Most subscription providers also require it, and the entire
            structure of the app assumes it.
          </p>
          <p>
            That means we don&apos;t lean on heavy identity checks the way
            a stranger-marketplace would have to. Instead we focus on
            keeping each household&apos;s data tidy, each member&apos;s
            account in their own control, and any misuse easy to surface.
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
              <strong>Household-only invites.</strong> Members join a plan
              only when the host explicitly invites them by email. There
              is no public feed of plans for strangers to browse and join.
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
          <h2>Red flags inside a household plan</h2>
          <p>
            Most Bantle plans quietly settle every month and never need
            our attention. A small number turn awkward. Here&apos;s what
            to watch for, especially when a household composition is in
            flux:
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
              <strong>Pause the plan.</strong> If somebody on your plan is
              behaving badly, pause the plan or remove the slot before
              more money moves.
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
            between household members outside Bantle. If a payment
            dispute occurs — wrong amount sent, duplicate transfer,
            refund needed, failed access or suspected scam — those are
            resolved with your payment provider, your bank, appropriate
            legal channels, or directly between the members involved.
          </p>
          <p>
            What we can do: act on behavioural issues, suspend or remove
            accounts that violate our{" "}
            <Link href="/community-guidelines">community guidelines</Link>,
            and make sure repeat offenders don&apos;t get a second chance.
            What we can&apos;t do: reverse a transfer, refund or
            compensate you, verify a payment, guarantee access or
            subscription duration, or guarantee the outcome of any
            specific household arrangement.
          </p>
        </section>
      </article>
    </>
  );
}
