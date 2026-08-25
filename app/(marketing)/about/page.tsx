import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { OG_BASE, TWITTER_BASE } from "@/lib/seo";
import { ProseShell } from "@/components/site/ProseShell";
import { JsonLd } from "@/components/site/JsonLd";
import {
  breadcrumbNode,
  jsonLd,
  webPageNode,
} from "@/lib/structured-data";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata = {
  title: "About",
  description:
    "Bantle is a small, India-first team building a clearer way to coordinate monthly sharing and one-time access for subscriptions.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    ...OG_BASE,
    url: "/about",
    title: "About",
    description: "Bantle is a small, India-first team building a clearer way to coordinate monthly sharing and one-time access for subscriptions.",
  },
  twitter: {
    ...TWITTER_BASE,
    title: "About",
    description: "Bantle is a small, India-first team building a clearer way to coordinate monthly sharing and one-time access for subscriptions.",
  },
};

const structuredData = jsonLd([
  webPageNode({
    path: "/about",
    name: String(metadata.title),
    description: String(metadata.description),
    type: "AboutPage",
  }),
  breadcrumbNode([{ name: "About", path: "/about" }]),
]);

const principles = [
  {
    title: "Money is personal",
    body: "We don't process or verify your payments. We don't earn a percentage of your arrangements. Every rupee moves directly between users outside Bantle.",
  },
  {
    title: "Coordination over processing",
    body: "Bantle keeps listing terms, chat and deal states clear. It does not become a payment processor, payment checker, access checker or provider-rule judge.",
  },
  {
    title: "India first",
    body: "We're built around rupee-aware pricing, familiar chat habits and Indian support expectations. We don't pretend to be global. We work for the way Indians already coordinate subscriptions directly.",
  },
  {
    title: "Simple beats clever",
    body: "There is no matching algorithm doing magic behind the scenes. You add monthly sharing or one-time access terms, confirm in chat, and coordinate directly. That's the product.",
  },
  {
    title: "Provider rules matter",
    body: "Every provider has its own access rules. Bantle does not verify compliance, so users must confirm that their arrangement is allowed before coordinating it.",
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <PageHeader
        crumb="About"
        title="A clearer way to coordinate subscription access."
        intro="Bantle exists because subscription coordination usually happens in messy chats. We keep monthly sharing and one-time access terms visible, while payment and access confirmation stay direct between users."
      />
      <ProseShell>
        <section>
          <h2>Our story</h2>
          <p>
            Bantle started with a small observation: subscription
            coordination already happens in India, but the important
            details are scattered across chats. Price, duration, access
            rules, renewal timing and safety expectations are often
            unclear at the exact moment someone is deciding whether to
            coordinate directly.
          </p>
          <p>
            That pattern is everywhere in urban India. Some people want
            monthly sharing for an ongoing slot. Others want one-time
            access for a remaining subscription period. In both cases, the
            practical need is the same: clear terms, chat context, and a
            reminder that payment happens outside Bantle.
          </p>
          <p>
            Bantle is a coordination tool for that exact situation. Add
            the listing, keep monthly sharing and one-time access labels
            separate, confirm terms in chat, and coordinate directly
            outside Bantle. The app does not process payments, verify
            payments, or promise access.
          </p>
          <p>
            Bantle is built and maintained by a small independent team
            focused on shipping useful tools for India. We&apos;re not
            venture funded, we don&apos;t sell ads, and we don&apos;t take
            a cut of your arrangements. The plan is simple: keep the app
            free and unobtrusive, and let it grow because the people on it
            want clearer subscription coordination.
          </p>
        </section>

        <section>
          <h2>What we believe</h2>
          <div className="not-prose mt-7 grid">
            {principles.map((principle) => (
              <div
                key={principle.title}
                className="border-b border-edge py-6 first:border-t"
              >
                <h3 className="mb-2 font-display text-[19px] font-semibold tracking-tight text-heading">
                  {principle.title}
                </h3>
                <p className="text-[15.5px] leading-[1.75] text-fg-muted">
                  {principle.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>What we don&apos;t do</h2>
          <p>
            Knowing what an app refuses to do is often more useful than
            knowing what it offers. Bantle, by design, does not:
          </p>
          <ul>
            <li>Process, verify or hold payments — payment happens directly between users outside Bantle.</li>
            <li>Sell, rent, or hand off your data to advertisers or brokers.</li>
            <li>Verify remaining access duration, provider compliance or payment status.</li>
            <li>Promise access, refunds, compensation or dispute outcomes.</li>
          </ul>
        </section>

        <section>
          <h2>Talk to us</h2>
          <p>
            We&apos;re a small team and we read every email. Product
            feedback, weird edge cases, partnership ideas, or just a hello —
            you can reach us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. If you
            run into trouble inside the app, the{" "}
            <Link href="/support">support page</Link> has the fastest path
            to a human reply.
          </p>
        </section>
      </ProseShell>
    </>
  );
}
