import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export const metadata = {
  title: "How it works",
  description:
    "From browsing a listing to your first UPI split, here's exactly how Bantle helps you share subscription costs in six steps.",
};

const steps = [
  {
    n: 1,
    title: "Browse or post",
    body: [
      "The home feed shows listings posted by people in your part of India who want to share their family plan. Each listing tells you what platform it's for — Spotify, YouTube Premium, Apple One, Microsoft 365, Netflix and so on — how many slots are still open, the host's per-person monthly price, and how long they intend to keep the plan running.",
      "If nothing on the feed fits, you can post your own listing in under a minute. Pick the platform, set how many sharers you need, write a short note about who you are, and publish. New listings appear immediately for other Bantle members.",
    ],
  },
  {
    n: 2,
    title: "Chat to verify fit",
    body: [
      "Tap a listing and tap chat. Bantle's chat works like any other messenger — read receipts, typing indicators, the works — but every conversation is tied to the specific listing, so you can keep multiple active threads without losing context.",
      "Good first questions: which household members will actually use the slot, how is payment timed each month, who manages the account password and primary email, and what happens if the host decides to switch plans. The point of the chat is to surface anything that would make the share awkward later.",
    ],
  },
  {
    n: 3,
    title: "Propose a deal",
    body: [
      "When you're both comfortable, the host (or the buyer) sends a deal proposal directly inside the chat. The proposal locks in three things: monthly price per person, duration in months, and which slot of the host's plan you're taking.",
      "The other party accepts or declines from the same chat. An accepted deal sits in your My Deals tab and starts counting down from Day 0 — that timer becomes the spine of your share for the rest of the agreement.",
    ],
  },
  {
    n: 4,
    title: "Pay each other via UPI",
    body: [
      "Once a deal is accepted, both sides exchange UPI handles inside the chat. Bantle does not hold or move money. It doesn't have a wallet. It doesn't take a percentage. You send the host your share via PhonePe, Google Pay, Paytm or any other UPI app — whichever you already use.",
      "Why we kept it this way: UPI in India is faster and cheaper than any in-app payment we could build, the dispute mechanisms inside UPI apps are already familiar, and removing money from the platform meaningfully changes how seriously people behave on it.",
    ],
  },
  {
    n: 5,
    title: "Rate at milestones",
    body: [
      "On Day 30, Day 60 and Day 90 of an active deal, Bantle quietly nudges both members for a short check-in. You confirm whether things are going well, mark any issues, and leave a star rating. Both sides rate each other, so a long-standing host and a long-standing sharer both build a reputation that other members can see.",
      "Ratings are honest, short, and primarily about reliability — did the host keep access open, did the sharer pay on time. They aren't optional reviews of personality or taste. The system rewards the people who actually do what they agreed to do.",
    ],
  },
  {
    n: 6,
    title: "Renew or move on",
    body: [
      "When a deal ends — say after twelve months — both members are prompted to renew or wrap up. Renewing carries forward your accumulated ratings and saves you the trouble of starting over. Wrapping up closes the deal cleanly and frees the slot for someone else.",
      "If something changes mid-deal — moving cities, switching plans, family additions — you can reopen the chat and renegotiate, or end the deal early with mutual consent. Bantle doesn't lock you in to anything you signed up for.",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="How it works"
        title="From a listing on the feed to a working monthly split, in six steps."
        intro="Bantle does discovery and chat. Everything else — payments, household coordination, the actual subscription — stays where it already works."
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
            Some streaming services allow family plans to be shared only
            among members of the same household. The exact rules vary
            between providers and change over time. Bantle does not enforce
            those rules and cannot tell whether your specific sharing
            arrangement complies with them. Read the relevant provider&apos;s
            terms before you commit to a plan, and use Bantle responsibly.
          </p>
          <p>
            See our{" "}
            <Link href="/terms">terms of service</Link> and{" "}
            <Link href="/community-guidelines">community guidelines</Link>{" "}
            for more on what we ask of every Bantle member.
          </p>
        </section>
      </article>
    </>
  );
}
