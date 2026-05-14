import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata = {
  title: "About",
  description:
    "Bantle is a small, India-first team building a calmer way for households to split the family-plan subscriptions they already share.",
};

const principles = [
  {
    title: "Money is personal",
    body: "We don't process your payments. We don't earn a percentage of your splits. Every rupee moves directly between household members on the UPI app they already use.",
  },
  {
    title: "Household over marketplace",
    body: "Bantle is for people who already live together — roommates, family, partners. We're not a stranger marketplace. The trust signals we lean on are the ones you already built when you signed your rent agreement.",
  },
  {
    title: "India first",
    body: "We're built around UPI, WhatsApp-style chat habits and rupee-aware pricing. We don't pretend to be global. We work for the way Indians already share things — within families, within flats, within partners.",
  },
  {
    title: "Simple beats clever",
    body: "There is no matching algorithm doing magic behind the scenes. You add a plan, you invite your housemates, you split the bill. That's the entire product.",
  },
  {
    title: "Sharing is normal",
    body: "Family plans were designed to be shared. Splitting one with the people you live with isn't a hack or a trick — it's how every provider intended the family tier to work. Bantle just keeps the maths honest.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="A calmer way for households to share subscription costs."
        intro="Bantle exists because most Indian households already pay for the same family plans twice — once by you, once by someone else under the same roof. Family plans were always meant to be shared. We just keep the maths honest."
      />
      <article className="container-x py-12 md:py-16 prose-bantle max-w-3xl">
        <section>
          <h2>Our story</h2>
          <p>
            Bantle started with a small, slightly embarrassing observation
            at home. Our family was paying for four different Spotify
            accounts even though one Family plan would have covered all of
            us. The problem was never access — it was coordination. Who
            pays this month, when does it renew, did anyone settle for
            September, why is the bill on someone&apos;s personal card.
          </p>
          <p>
            That pattern is everywhere in urban India. Flatmates each pay
            for their own YouTube Premium. Couples maintain parallel Apple
            One subscriptions on different cards. Siblings end up paying
            full price for Microsoft 365 because somebody forgot to add
            them to the family plan. The money lost across a year is real,
            usually thousands of rupees, occasionally tens of thousands.
          </p>
          <p>
            Bantle is a coordination tool for that exact situation. It
            isn&apos;t a marketplace for finding strangers to share with —
            most family plans aren&apos;t designed for that, and the
            providers are increasingly strict about it. Bantle is for the
            people you already live with: roommates, family, partners.
            Add the plan, invite the people on it, settle each month on
            UPI. The whole thing is meant to feel as natural as splitting
            a Zomato order.
          </p>
          <p>
            Bantle is built and maintained by a small independent team
            focused on shipping useful tools for India. We&apos;re not
            venture funded, we don&apos;t sell ads, and we don&apos;t take
            a cut of your splits. The plan is simple: keep the app free
            and unobtrusive, and let it grow because the people on it want
            to bring more of their own household on it.
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
            <li>Process or hold payments — settlements are UPI to UPI between household members.</li>
            <li>Sell, rent, or hand off your data to advertisers or brokers.</li>
            <li>Match you with strangers or run any kind of marketplace — Bantle is for the people you already live with.</li>
            <li>Verify whether the subscription you&apos;re sharing complies with the provider&apos;s terms — that&apos;s on you and the rest of your household.</li>
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
