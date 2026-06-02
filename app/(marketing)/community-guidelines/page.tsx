import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CONTACT_EMAIL, POLICY_EFFECTIVE_DATE } from "@/lib/constants";

export const metadata = {
  title: "Community guidelines",
  description:
    "What we expect from every Bantle member: honest listing terms, honoured deals, civil chat, and clear outside-Bantle coordination.",
};

export default function CommunityGuidelinesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Community guidelines"
        title="The way Bantle works only if everyone keeps it small and kind."
        intro={`Last updated ${POLICY_EFFECTIVE_DATE}. These guidelines sit alongside our terms of service and apply to every Bantle member.`}
      />
      <article className="container-x py-12 md:py-16 prose-bantle max-w-3xl">
        <section>
          <h2>1. Be honest</h2>
          <ul>
            <li>
              Your name, photo, bio and ratings should reflect who you
              actually are. No fake personas, no stand-in avatars, no rented
              identities.
            </li>
            <li>
              Listings should accurately describe the subscription, how
              many slots are genuinely available, the realistic monthly
              price, or the one-time price and months remaining for
              one-time access. Do not advertise more slots or longer
              access than you have.
            </li>
            <li>
              If something changes during a deal — access changes, the
              plan is moved, a renewal fails, or the remaining access
              period changes — tell your sharing partner promptly.
            </li>
          </ul>
        </section>

        <section>
          <h2>2. Be respectful</h2>
          <ul>
            <li>
              No harassment, slurs, threats, or discriminatory language.
              This includes religion, caste, region, gender, sexual
              orientation, language, disability, body size, or any other
              attribute.
            </li>
            <li>
              Disagreements happen. Keep them civil. Walk away from a chat
              before it gets ugly. Reporting is fine — escalating is not.
            </li>
            <li>
              Sexual content, pickup attempts, and inappropriate comments
              about appearance are not okay on Bantle, ever. Bantle is for
              splitting subscriptions, not dating.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. Honour your deals</h2>
          <ul>
            <li>
              Settle your share on or before the date you agreed on,
              using whatever outside-Bantle method both members confirmed
              directly.
            </li>
            <li>
              Maintain access to the shared plan for the agreed duration.
              Hosts don&apos;t quietly drop sharers mid-deal or
              misrepresent one-time access duration.
            </li>
            <li>
              Communicate proactively if your circumstances change.
              Switching cities? Cancelling the plan? Family situation
              changed? Tell the other side as early as you can so a graceful
              wind-down or transition is possible.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Keep it on Bantle</h2>
          <ul>
            <li>
              Don&apos;t pressure other members to move conversations to
              WhatsApp, Telegram or Instagram before access details,
              duration, price and terms are confirmed. In-app chat exists
              so we can act on reports if something goes wrong.
            </li>
            <li>
              Don&apos;t try to circumvent our identity, ratings or report
              systems. Don&apos;t create alt accounts to dodge a suspension
              or inflate your own ratings.
            </li>
            <li>
              Payment or contact details exchanged inside a Bantle chat
              are for the specific deal. Don&apos;t use them for unrelated
              solicitation.
            </li>
          </ul>
        </section>

        <section>
          <h2>5. No unrelated offers</h2>
          <ul>
            <li>
              Bantle is for monthly sharing and one-time access
              coordination. It is not a place to offer credentials,
              pirated streams, unrelated digital goods, or anything else
              outside that scope.
            </li>
            <li>
              Recruitment, MLM pitches, crypto schemes, course bundles and
              other unrelated offers are not allowed in chats or listings.
            </li>
          </ul>
        </section>

        <section>
          <h2>6. No illegal content</h2>
          <p>
            Child sexual abuse material, content that endangers minors,
            scams, fraudulent listings, stolen credentials, content
            inciting violence, or anything that would violate Indian law
            is grounds for immediate, permanent removal and may be
            reported to law enforcement.
          </p>
        </section>

        <section>
          <h2>7. Report problems</h2>
          <p>
            If you see behaviour that breaks these guidelines, please use
            the in-app report flow. Open the relevant chat or profile, tap
            the menu, choose Report, and pick the category that fits.
            Reports are private and reviewed quickly. For anything urgent,
            email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </section>

        <section>
          <h2>8. Consequences</h2>
          <p>
            Our default response to first-time, non-serious violations is a
            warning that explains what went wrong. Repeated or serious
            violations lead to suspensions (typically 7 to 30 days). Severe
            violations — fraud, harassment, illegal content, repeated
            offending — lead to permanent bans without further notice.
          </p>
          <p>
            If you believe a decision was wrong, you can appeal by writing
            to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with
            your account details and a short explanation of why the
            decision should be reviewed.
          </p>
        </section>

        <section>
          <h2>One more thing</h2>
          <p>
            Bantle works because most people are quietly decent to each
            other. These guidelines exist for the small fraction of
            situations where they aren&apos;t. Read them once, follow them
            casually, and you&apos;ll never need to think about them again.
          </p>
          <p>
            See also our{" "}
            <Link href="/terms">terms of service</Link> and{" "}
            <Link href="/safety">safety page</Link>.
          </p>
        </section>
      </article>
    </>
  );
}
