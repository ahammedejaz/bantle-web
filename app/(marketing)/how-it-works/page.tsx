import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { OG_BASE, TWITTER_BASE } from "@/lib/seo";
import { JsonLd } from "@/components/site/JsonLd";
import {
  breadcrumbNode,
  howToNode,
  jsonLd,
  webPageNode,
} from "@/lib/structured-data";
import { ProseShell } from "@/components/site/ProseShell";

export const metadata = {
  title: "How it works",
  description:
    "How Bantle helps users coordinate monthly sharing and one-time access while payment and access confirmation stay outside Bantle.",
  alternates: {
    canonical: "/how-it-works",
  },
  openGraph: {
    ...OG_BASE,
    url: "/how-it-works",
    title: "How it works",
    description: "How Bantle helps users coordinate monthly sharing and one-time access while payment and access confirmation stay outside Bantle.",
  },
  twitter: {
    ...TWITTER_BASE,
    title: "How it works",
    description: "How Bantle helps users coordinate monthly sharing and one-time access while payment and access confirmation stay outside Bantle.",
  },
};


const steps = [
  {
    n: 1,
    title: "Add what you're coordinating",
    body: [
      "Open Bantle and add the subscription access you are coordinating. Choose monthly sharing for recurring access or one-time access for a remaining subscription period.",
      "Monthly sharing captures monthly price, slots and commitment. One-time access captures one-time price, months remaining, access method and access notes.",
    ],
  },
  {
    n: 2,
    title: "Confirm provider rules and access details",
    body: [
      "Before listing or joining, check the underlying provider's terms. Bantle is not affiliated with providers and does not verify whether your arrangement is allowed.",
      "For one-time access, the host must list accurate remaining access details. The buyer should confirm those details directly in chat before paying outside Bantle.",
    ],
  },
  {
    n: 3,
    title: "Talk in chat",
    body: [
      "Buyers propose first. Once a proposal is accepted and the deal is active, full chat opens so both sides can confirm access, duration, price, rules and timing before either side coordinates outside Bantle. Closed, cancelled, rejected or completed deals become read-only.",
      "Bantle keeps monthly sharing and one-time access labels separate so one-time prices are never shown as monthly prices.",
    ],
  },
  {
    n: 4,
    title: "Propose and accept with a safety acknowledgement",
    body: [
      "Before a proposal or acceptance completes, Bantle asks users to acknowledge that payment happens outside Bantle and Bantle does not process payments or promise access.",
      "The deal records the monthly or one-time terms for moderation context, but that record is not payment verification or access verification.",
    ],
  },
  {
    n: 5,
    title: "Coordinate payment outside Bantle",
    body: [
      "Users choose their own outside-Bantle method. Bantle does not collect, hold, route, verify, insure or reverse payments.",
      "If something goes wrong, resolve it with the other user, your payment provider, your bank or appropriate legal channels. Bantle does not provide refunds or compensation.",
    ],
  },
  {
    n: 6,
    title: "Use reports and ratings if something goes wrong",
    body: [
      "If a user misrepresents access, pressures you, or behaves badly, use in-app reports so moderation can review the listing, chat and deal context.",
      "Ratings remain a user signal. They do not mean Bantle confirmed payment, access or provider compliance.",
    ],
  },
];

const structuredData = jsonLd([
  webPageNode({
    path: "/how-it-works",
    name: String(metadata.title),
    description: String(metadata.description),
    type: "WebPage",
  }),
  howToNode({
    name: "How to split or buy subscription access on Bantle",
    description: String(metadata.description),
    path: "/how-it-works",
    steps: steps.map((step) => ({
      name: step.title,
      text: step.body.join(" "),
    })),
  }),
  breadcrumbNode([{ name: "How it works", path: "/how-it-works" }]),
]);

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <PageHeader
        crumb="How it works"
        title="From listed terms to direct coordination, in six steps."
        intro="Bantle coordinates monthly sharing and one-time access. Payment and access confirmation happen directly between users outside Bantle."
      />
      <ProseShell>
        <ol className="not-prose relative grid">
          {steps.map((s) => (
            <li
              key={s.n}
              id={`step-${s.n}`}
              className="relative grid scroll-mt-28 grid-cols-[auto_minmax(0,1fr)] gap-x-5 border-b border-edge py-8 first:border-t sm:gap-x-7"
            >
              {/* The rail runs behind the markers and stops at the last step. */}
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-[19px] top-12 w-px bg-edge sm:left-[23px]"
              />
              <span
                aria-hidden="true"
                className="relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-sub font-mono text-[12px] font-medium text-accent ring-1 ring-edge-2 sm:h-12 sm:w-12 sm:text-[13px]"
              >
                {String(s.n).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h2 className="mb-3 mt-1 font-display text-[22px] font-semibold leading-tight tracking-tight text-heading md:text-[26px]">
                  {s.title}
                </h2>
                <div className="space-y-3.5">
                  {s.body.map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-[15.5px] leading-[1.75] text-fg-muted"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-14">
          <h2>A note on subscription provider terms</h2>
          <p>
            Subscription provider rules vary and change over time. Some
            plans require household membership, some require family-group
            membership, and many prohibit commercialisation or credential
            sharing. Bantle does not police those rules and cannot tell
            whether your specific arrangement qualifies under any given
            provider&apos;s terms.
          </p>
          <p>
            By using Bantle you confirm that you have read the relevant
            provider&apos;s terms of service and that you will not use
            Bantle to coordinate access in a way that violates them. See
            our{" "}
            <Link href="/terms">terms of service</Link> and{" "}
            <Link href="/community-guidelines">community guidelines</Link>{" "}
            for the full version.
          </p>
        </section>
      </ProseShell>
    </>
  );
}
