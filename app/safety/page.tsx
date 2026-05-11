import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata = {
  title: "Safety",
  description:
    "How Bantle helps you spot good-faith sharers, control your account, and report issues. Bantle is a discovery and chat app — money flows happen outside it.",
};

export default function SafetyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Trust &amp; safety"
        title="A quiet, layered approach to keeping Bantle safe."
        intro="No identity layer eliminates risk on the open internet, but together — phone verification, ratings, blocks and reports — they make bad-faith behaviour expensive and obvious."
      />
      <article className="container-x py-12 md:py-16 prose-bantle max-w-3xl">
        <section>
          <h2>How we keep Bantle safe</h2>
          <p>
            Bantle is a peer-to-peer space, which means most of the safety
            work happens at the edges: making it hard to sign up
            anonymously, making it easy to walk away from a bad
            conversation, and making it normal to leave a record after a
            deal. We don&apos;t intervene in the middle of a chat unless
            something is reported. We do listen carefully when it is.
          </p>
        </section>

        <section>
          <h2>Verification layers</h2>
          <ul>
            <li>
              <strong>Phone OTP.</strong> Every account is bound to a
              working Indian mobile number, verified via SMS through MSG91
              at sign-up.
            </li>
            <li>
              <strong>Email verification.</strong> A confirmed email is
              required before posting a listing or proposing a deal — it
              gives both sides a backup channel if push notifications fail.
            </li>
            <li>
              <strong>Google sign-in.</strong> An optional second identity
              signal for members who prefer it.
            </li>
            <li>
              <strong>Ratings over time.</strong> The most powerful trust
              signal on Bantle is months-old. A host with twelve consistent
              ratings has done the work that no badge can simulate.
            </li>
          </ul>
        </section>

        <section>
          <h2>What you control</h2>
          <ul>
            <li>
              <strong>Block.</strong> Block any user from any chat. Blocked
              members can&apos;t see your listings, send you messages, or
              propose deals.
            </li>
            <li>
              <strong>Report.</strong> A single in-app report puts the
              other member&apos;s account in front of our moderation queue.
              Reports are private — the reported member is never told who
              filed it.
            </li>
            <li>
              <strong>Hide listings.</strong> Pause or hide your own
              listings whenever you don&apos;t want new chats coming in.
            </li>
            <li>
              <strong>Privacy.</strong> Toggle online presence, last-seen,
              and read receipts in Settings.
            </li>
          </ul>
        </section>

        <section>
          <h2>Red flags to watch for</h2>
          <p>
            The vast majority of Bantle conversations end with two people
            quietly sharing a plan and forgetting about us. A small number
            don&apos;t. Here&apos;s what to watch for before you commit:
          </p>
          <ul>
            <li>
              A rush to send the first month&apos;s payment within minutes
              of opening the chat. Honest hosts let you ask questions
              first.
            </li>
            <li>
              Pressure to move the conversation to WhatsApp or another
              platform before any agreement is reached.
            </li>
            <li>
              Requests for payment to multiple UPI handles, or a different
              UPI handle than the one shared earlier in the chat.
            </li>
            <li>
              Vague or contradictory answers about who runs the master
              account, how access is shared, or what happens at renewal.
            </li>
            <li>
              Any pressure to share OTPs, account passwords, or your
              primary email password — never required for a normal split.
            </li>
            <li>
              A profile with no ratings and a listing far below market
              price. Not always a scam, but always worth a slower chat.
            </li>
          </ul>
        </section>

        <section>
          <h2>If something goes wrong</h2>
          <ol>
            <li>
              <strong>Stop the share if you can.</strong> If the deal is
              still pending and money hasn&apos;t moved, decline the deal
              and block the user.
            </li>
            <li>
              <strong>File a report.</strong> Open the chat, tap the menu,
              choose Report. Pick the category that fits and include any
              detail you have. Reports go to our queue and most are
              actioned within 24 hours.
            </li>
            <li>
              <strong>Leave an honest rating.</strong> If the deal already
              progressed, your rating becomes a real-time signal for the
              next person who considers sharing with the same host.
            </li>
            <li>
              <strong>Email us if it&apos;s serious.</strong> Write to{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with
              a short summary if you need direct human help.
            </li>
          </ol>
        </section>

        <section>
          <h2>Important: Bantle is discovery and chat only</h2>
          <p>
            Bantle does not hold, route, or insure your payments. Every
            rupee that changes hands moves directly between you and your
            sharing partner on UPI. If a payment dispute occurs — wrong
            amount sent, duplicate transfer, refund needed — those are
            resolved inside your UPI app&apos;s own dispute process, with
            your bank, or directly between the two of you.
          </p>
          <p>
            What we can do: act on behavioural issues, suspend or remove
            accounts that violate our{" "}
            <Link href="/community-guidelines">community guidelines</Link>,
            and make sure repeat offenders don&apos;t get a second chance.
            What we can&apos;t do: reverse a UPI transfer, refund your money,
            or guarantee the outcome of any specific deal.
          </p>
        </section>
      </article>
    </>
  );
}
