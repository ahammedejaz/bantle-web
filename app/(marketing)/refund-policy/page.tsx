import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CONTACT_EMAIL, POLICY_EFFECTIVE_DATE } from "@/lib/constants";

export const metadata = {
  title: "Refund policy",
  description:
    "Bantle is free to use and never holds your money. Here's exactly how refunds, disputes and money flow work on Bantle.",
};

export default function RefundPolicyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Refund policy"
        title="Bantle doesn't hold your money. Here's how that affects refunds."
        intro={`Last updated ${POLICY_EFFECTIVE_DATE}.`}
      />
      <article className="container-x py-12 md:py-16 prose-bantle max-w-3xl">
        <section>
          <h2>1. Bantle is free</h2>
          <p>
            Posting a listing, browsing the feed, chatting with other
            members, accepting a deal and leaving ratings are all entirely
            free. We do not charge fees, transaction commissions, or
            subscription costs for using the App today.
          </p>
        </section>

        <section>
          <h2>2. We do not handle money between users</h2>
          <p>
            Bantle does not collect, process, hold, escrow or transmit
            money on behalf of any member. When you and another member
            agree on a split, all payments happen directly between the two
            of you through UPI or any other method you mutually choose.
            Bantle is not in the money flow at any point.
          </p>
        </section>

        <section>
          <h2>3. How refund disputes are resolved</h2>
          <p>
            Because every payment is direct between members, refund
            disputes are also between members. The right path depends on
            what happened:
          </p>
          <ul>
            <li>
              <strong>Wrong amount or duplicate UPI transfer.</strong> Raise
              a dispute inside your UPI app (PhonePe, Google Pay, Paytm,
              and so on) — they have their own resolution flows backed by
              NPCI.
            </li>
            <li>
              <strong>Refund agreed between members.</strong> If both
              parties agree on a refund, settle it directly on UPI in the
              other direction. There is nothing Bantle needs to do.
            </li>
            <li>
              <strong>Refund disputed.</strong> Both members can use direct
              negotiation, consumer-protection channels under the Consumer
              Protection Act, 2019, or appropriate police channels for
              fraud cases. We can supply records of the in-app chat for a
              valid legal request.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. What Bantle can and cannot do</h2>
          <p>
            We can take behavioural action — warn, suspend or permanently
            remove an account that violates our{" "}
            <Link href="/community-guidelines">community guidelines</Link>{" "}
            or <Link href="/terms">terms of service</Link>. We can ensure
            that a member with repeated bad-faith behaviour does not stay
            on the platform.
          </p>
          <p>
            We cannot reverse a UPI transfer, recover money that has
            already been sent between members, guarantee that the other
            member will refund you, or act as an arbitrator with binding
            authority over your dispute.
          </p>
        </section>

        <section>
          <h2>5. If Bantle ever introduces paid features</h2>
          <p>
            This policy applies to Bantle as it exists today: a free,
            chat-and-discovery service. If we ever introduce paid features
            (for example, premium hosting tools or boosted listings), we
            will update this page to describe the refund treatment for
            those specific charges and notify all active users in-app
            before any payment is taken.
          </p>
        </section>

        <section>
          <h2>6. Contact</h2>
          <p>
            For questions about this policy, email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </section>
      </article>
    </>
  );
}
