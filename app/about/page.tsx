import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata = {
  title: "About",
  description:
    "Bantle is a small, India-first team building a calmer way to split subscription costs with people you trust.",
};

const principles = [
  {
    title: "Money is personal",
    body: "We don't process your payments. We don't earn a percentage of your splits. Every rupee moves directly between two people who agreed on a deal, on a UPI app you already trust.",
  },
  {
    title: "Trust over speed",
    body: "We would rather slow down a match by a day than match you with somebody who turns out to be a no-show. Phone verification, ratings and check-ins exist to grow trust quietly over time.",
  },
  {
    title: "India first",
    body: "We're built around UPI, WhatsApp-style chat habits and rupee-aware pricing. We don't pretend to be global. We work for the way Indians already share things — within families, within buildings, within friend groups.",
  },
  {
    title: "Simple beats clever",
    body: "There is no matching algorithm doing magic behind the scenes. You see real listings, you talk to a real person, you decide together. That's the entire product.",
  },
  {
    title: "Sharing is normal",
    body: "Family plans were designed to be shared. Splitting them isn't a hack or a trick — it's how the world has always handled costs that scale with people. Bantle just makes that easier between strangers who want to act like neighbours.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="A calmer way to split subscription costs."
        intro="Bantle exists because subscriptions in India keep multiplying, and the people who built family plans always meant for them to be shared."
      />
      <article className="container-x py-12 md:py-16 prose-bantle max-w-3xl">
        <section>
          <h2>Our story</h2>
          <p>
            The first version of Bantle started as a back-of-the-envelope
            calculation. If a family of four pays ₹179 a month for Spotify,
            and a family of six pays the same amount, then for every flatmate
            or sibling who shares a plan there is a quiet, dependable saving
            sitting on the table. Multiply that by the ten or twelve
            subscriptions a typical urban Indian household pays for in a
            year and you get a real number — sometimes tens of thousands of
            rupees.
          </p>
          <p>
            What stopped most people from claiming those savings wasn&apos;t
            apathy. It was friction. Finding a trustworthy person to share
            with usually meant asking a friend who already had a plan, or
            posting in a building WhatsApp group, or making peace with the
            slow churn of strangers on Reddit. None of those have any sense
            of identity, accountability, or follow-through. So sharing
            stayed informal and most people just paid full price.
          </p>
          <p>
            Bantle is a small attempt to change the social fabric around
            this — to make sharing a family plan feel as casual as splitting
            a Zomato order. Phone-verified profiles. A short, honest chat.
            Ratings that build over months, not minutes. And payments that
            stay between two people on UPI, the way Indians already prefer.
          </p>
          <p>
            Bantle is built and maintained by a small independent team
            focused on shipping useful tools for India. We&apos;re not venture
            funded, we don&apos;t sell ads, and we don&apos;t take a cut of your
            splits. The plan is simple: keep the app free and unobtrusive,
            and let it grow because the people on it want to bring more
            people on it.
          </p>
        </section>

        <section>
          <h2>What we believe</h2>
          <div className="not-prose grid gap-6 mt-6">
            {principles.map((p) => (
              <div
                key={p.title}
                className="bg-cream-card border border-line rounded-card p-6"
              >
                <h3 className="font-serif text-xl text-teal-900 mb-2">
                  {p.title}
                </h3>
                <p className="text-[15px] leading-7 text-ink-muted">
                  {p.body}
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
            <li>Process or hold payments — settlements are UPI to UPI between users.</li>
            <li>Sell, rent, or hand off your data to advertisers or brokers.</li>
            <li>Promote paid placements — every listing on the feed is organic.</li>
            <li>Moderate user-submitted ratings except in clear abuse cases.</li>
            <li>Verify whether the subscription you&apos;re sharing complies with the provider&apos;s terms — that&apos;s on you and the host.</li>
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
      </article>
    </>
  );
}
