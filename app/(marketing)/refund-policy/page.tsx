import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { OG_BASE, TWITTER_BASE } from "@/lib/seo";
import { JsonLd } from "@/components/site/JsonLd";
import {
  breadcrumbNode,
  jsonLd,
  siteEntityNodes,
  webPageNode,
} from "@/lib/structured-data";
import { ProseShell } from "@/components/site/ProseShell";
import {
  CONTACT_EMAIL,
  POLICY_EFFECTIVE_DATE,
  POLICY_EFFECTIVE_DATE_ISO,
} from "@/lib/constants";

export const metadata = {
  title: "Refund policy: why payments stay outside the app",
  description:
    "Bantle is free to use and never holds your money. Here is exactly how refunds, disputes and money flow work on Bantle.",
  alternates: {
    canonical: "/refund-policy",
  },
  openGraph: {
    ...OG_BASE,
    url: "/refund-policy",
    title: "Refund policy: why payments stay outside the app",
    description: "Bantle is free to use and never holds your money. Here is exactly how refunds, disputes and money flow work on Bantle.",
  },
  twitter: {
    ...TWITTER_BASE,
    title: "Refund policy: why payments stay outside the app",
    description: "Bantle is free to use and never holds your money. Here is exactly how refunds, disputes and money flow work on Bantle.",
  },
};

const structuredData = jsonLd([
  ...siteEntityNodes,
  webPageNode({
    path: "/refund-policy",
    name: String(metadata.title),
    description: String(metadata.description),
    type: "WebPage",
    // The date this page itself displays. Never a build timestamp.
    dateModified: POLICY_EFFECTIVE_DATE_ISO,
  }),
  breadcrumbNode([{ name: "Refund policy", path: "/refund-policy" }]),
]);

export default function RefundPolicyPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <PageHeader
        crumb="Refund policy"
        title="Bantle doesn't hold your money. Here's how that affects refunds."
        intro={`Last updated ${POLICY_EFFECTIVE_DATE}.`}
      />
      <ProseShell>
        <section id="1-bantle-is-free" className="scroll-mt-28">
          <h2>1. Bantle is free</h2>
          <p>
            Posting a listing, browsing the feed, chatting with other
            members, accepting a deal and leaving ratings are all entirely
            free. We do not charge fees, transaction commissions, or
            subscription costs for using the App today.
          </p>
        </section>

        <section id="2-we-do-not-handle-money-between-users" className="scroll-mt-28">
          <h2>2. We do not handle money between users</h2>
          <p>
            Bantle does not collect, process, hold, verify or transmit
            money on behalf of any member. When you and another member
            agree on monthly sharing or one-time access, all payments
            happen directly between the two of you outside Bantle by a
            method you mutually choose. Bantle is not in the money flow at
            any point.
          </p>
        </section>

        <section id="3-how-refund-disputes-are-resolved" className="scroll-mt-28">
          <h2>3. How refund disputes are resolved</h2>
          <p>
            Because every payment is direct between members, refund
            disputes are also between members. The right path depends on
            what happened:
          </p>
          <ul>
            <li>
              <strong>Wrong amount or duplicate transfer.</strong> Raise
              a dispute through your payment provider or bank. Their
              dispute and reversal processes are outside Bantle.
            </li>
            <li>
              <strong>Refund agreed between members.</strong> If both
              parties agree on a refund, settle it directly outside
              Bantle. There is nothing Bantle needs to process.
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

        <section id="4-what-bantle-can-and-cannot-do" className="scroll-mt-28">
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
            We cannot reverse a transfer, recover money that has already
            been sent between members, verify whether a payment happened,
            promise access or subscription duration, compensate you for
            scams, losses or failed access, promise that the other
            member will refund you, or act as an arbitrator with binding
            authority over your dispute.
          </p>
          <p>
            For one-time access, Bantle also does not verify the remaining
            access period or promise that the access will continue for
            the months shown. Confirm details directly in chat before
            paying outside Bantle.
          </p>
        </section>

        <section id="5-if-bantle-ever-introduces-paid-features" className="scroll-mt-28">
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

        <section id="6-contact" className="scroll-mt-28">
          <h2>6. Contact</h2>
          <p>
            For questions about this policy, email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </section>
      </ProseShell>
    </>
  );
}
