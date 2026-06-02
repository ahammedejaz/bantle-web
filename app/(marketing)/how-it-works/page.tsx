import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export const metadata = {
  title: "How it works",
  description:
    "How Bantle helps users coordinate monthly sharing and one-time access while payment and access confirmation stay outside Bantle.",
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
      "Use Bantle chat to confirm access, duration, price, rules and timing. Keep the arrangement clear before either side coordinates outside Bantle.",
      "Bantle keeps monthly sharing and one-time access labels separate so one-time prices are never shown as monthly prices.",
    ],
  },
  {
    n: 4,
    title: "Propose and accept with a safety acknowledgement",
    body: [
      "Before a proposal or acceptance completes, Bantle asks users to acknowledge that payment happens outside Bantle and Bantle does not process payments or guarantee access.",
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

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="How it works"
        title="From listed terms to direct coordination, in six steps."
        intro="Bantle coordinates monthly sharing and one-time access. Payment and access confirmation happen directly between users outside Bantle."
      />
      <article className="container-x py-12 md:py-16 prose-bantle max-w-3xl">
        <ol className="not-prose space-y-12">
          {steps.map((s) => (
            <li key={s.n} className="flex flex-col md:flex-row gap-6 md:gap-10">
              <span
                aria-hidden="true"
                className="shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-full border border-teal-900 text-teal-900 font-serif text-xl"
              >
                {s.n}
              </span>
              <div className="flex-1">
                <h2 className="font-serif text-2xl md:text-3xl text-teal-900 mb-4">
                  {s.title}
                </h2>
                <div className="space-y-4">
                  {s.body.map((p, i) => (
                    <p
                      key={i}
                      className="text-[15px] leading-7 text-ink"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-16">
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
      </article>
    </>
  );
}
