import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export const metadata = {
  title: "How it works",
  description:
    "From adding your family plan to splitting next month's bill — here's exactly how Bantle helps your household coordinate subscriptions in six steps.",
};

const steps = [
  {
    n: 1,
    title: "Add the plan you're hosting",
    body: [
      "Open Bantle and add the family-plan subscription you (or someone in your household) already pay for — Spotify Family, YouTube Premium Family, Apple One, Microsoft 365 Family, Amazon Prime, and the other plans Bantle supports. Tell us how many slots the plan covers, the monthly cost, and when it renews.",
      "Bantle isn't a marketplace and won't show your plan to strangers. The plan is private to your household and only the people you explicitly invite can see it.",
    ],
  },
  {
    n: 2,
    title: "Invite your household",
    body: [
      "Send an invite to each member of your household who uses (or wants to use) the plan — your roommates, family or partner. They sign in with email, accept the invite, and claim their slot. No SMS, no phone hassle.",
      "By inviting somebody to your plan you're confirming they live in your household, the way the underlying subscription provider expects. Bantle isn't here to verify household composition for you — that part stays your responsibility.",
    ],
  },
  {
    n: 3,
    title: "Agree on how the bill splits",
    body: [
      "By default Bantle splits the monthly cost evenly across active slots. If your household wants a different arrangement — say the host pays a smaller share because they manage the master account — you can adjust the split per member.",
      "Whatever you decide, it's locked in once everyone confirms, and shown the same way on every member's app. No more chasing screenshots of the actual bill.",
    ],
  },
  {
    n: 4,
    title: "Settle each month over UPI",
    body: [
      "When the subscription bills the host's card, Bantle nudges every other member of the plan with what they owe and where to send it. Settlement happens directly on PhonePe, Google Pay, Paytm or any UPI app you already use.",
      "Bantle never holds, routes or insures the money. UPI in India is faster, cheaper and more familiar than any in-app wallet we could build, and the dispute mechanisms inside UPI apps are already mature.",
    ],
  },
  {
    n: 5,
    title: "Get reminded at renewal",
    body: [
      "A few days before the subscription's annual or monthly renewal, Bantle prompts the host to confirm whether the plan is continuing. If it is, everyone's slots roll forward. If it isn't, the plan closes cleanly and the housemates can decide whether to move to a different one.",
      "The point of the reminder is to avoid the silent renewal that nobody noticed and nobody settled — the failure mode that turns a household subscription into a quiet grudge.",
    ],
  },
  {
    n: 6,
    title: "Adjust when your household changes",
    body: [
      "Roommates move out, partners move in, family compositions shift. When that happens you can reassign slots, change the per-member split, or close the plan from inside the app. Past settlement history stays intact so nobody has to remember whether September was settled.",
      "If a member leaves the household, drop them from the plan and add the new person. Bantle handles the bookkeeping; you handle the doorbell.",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="How it works"
        title="From one family plan to a cleanly split household, in six steps."
        intro="Bantle coordinates the family-plan subscriptions you already share with the people you already live with. Discovery, listings and stranger chat aren't part of the product — coordination is."
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
            Almost every family-plan subscription assumes that the people
            on the plan live in the same household. The exact wording
            varies between providers and changes over time — Spotify
            verifies addresses periodically, YouTube Premium has tightened
            its household checks, Apple One requires Family Sharing
            membership, and so on. Bantle does not police those rules and
            cannot tell whether your specific household qualifies under
            any given provider&apos;s terms.
          </p>
          <p>
            By using Bantle you confirm that the members on each plan are
            members of your household and that you have read the relevant
            provider&apos;s terms of service. If your sharing arrangement
            doesn&apos;t qualify, please don&apos;t use Bantle to
            coordinate it. See our{" "}
            <Link href="/terms">terms of service</Link> and{" "}
            <Link href="/community-guidelines">community guidelines</Link>{" "}
            for the full version.
          </p>
        </section>
      </article>
    </>
  );
}
