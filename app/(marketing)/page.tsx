import Link from "next/link";
import {
  HandCoins,
  HeartHandshake,
  ShieldCheck,
  MessageCircle,
  ListChecks,
} from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import { FeatureCard } from "@/components/FeatureCard";
import { ComingSoonBadges } from "@/components/ComingSoonBadges";
import { BRAND_NAME, SITE_DESCRIPTION } from "@/lib/constants";

export const metadata = {
  title: `${BRAND_NAME} — coordinate your household's subscriptions.`,
  description: SITE_DESCRIPTION,
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <WhyBantle />
      <HowItWorks />
      <TrustSection />
      <ComingSoonCTA />
    </>
  );
}

function WhyBantle() {
  return (
    <section className="border-t border-line">
      <div className="container-x py-16 md:py-24">
        <div className="max-w-2xl mb-12 md:mb-16">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
            Why Bantle
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-teal-900 leading-tight tracking-tightish text-balance">
            Built for the people who already share your fridge.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={HandCoins}
            title="Save real money"
            body="A family Spotify plan in India costs around ₹179 a month. Split across six household members, that's under ₹30 each. Repeat for YouTube Premium, Apple One and Microsoft 365. The maths quietly adds up to thousands a year."
          />
          <FeatureCard
            icon={HeartHandshake}
            title="Coordinate, don't negotiate"
            body="Bantle is for households that already share a roof — roommates, family, partners. No stranger search, no marketplace. Just a calm place to track who pays for what and when the next renewal lands."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Stay in control"
            body="Bantle never touches your money. You and your housemates coordinate payment directly outside Bantle. No balances to chase, no fees to anyone."
          />
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: ListChecks,
      title: "Add the family plan you already share",
      body: "Pick the plan you're hosting for the household — Spotify Family, YouTube Premium Family, Apple One, Microsoft 365 Family, and so on. Bantle remembers the slots, the per-person cost, and the renewal date so nobody has to.",
    },
    {
      icon: MessageCircle,
      title: "Invite your household",
      body: "Send your roommates, family or partner an invite from the app. Each member confirms their slot, agrees on what they'll pay, and signs in with email — quick, no SMS, no phone hassle.",
    },
    {
      icon: HandCoins,
      title: "Coordinate each monthly split",
      body: "When the bill lands, Bantle reminds everyone what they owe. Settlement happens directly between household members outside Bantle. Bantle never holds money, never takes a cut.",
    },
  ];

  return (
    <section className="bg-cream-card border-t border-line">
      <div className="container-x py-16 md:py-24">
        <div className="max-w-2xl mb-12 md:mb-16">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
            How it works
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-teal-900 leading-tight tracking-tightish text-balance">
            Three steps from one bill to a cleanly split household.
          </h2>
        </div>
        <ol className="grid gap-10 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-4">
              <span
                aria-hidden="true"
                className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-teal-900 text-teal-900 font-medium"
              >
                {i + 1}
              </span>
              <h3 className="font-serif text-xl text-teal-900">
                {step.title}
              </h3>
              <p className="text-[15px] leading-7 text-ink-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
        <div className="mt-12">
          <Link
            href="/how-it-works"
            className="text-teal-600 underline underline-offset-2 hover:text-teal-900 text-[15px]"
          >
            Read the full walk-through →
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="border-t border-line">
      <div className="container-x py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16 md:items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
              Trust
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-teal-900 leading-tight tracking-tightish text-balance">
              Built for India, by Indians.
            </h2>
          </div>
          <div className="space-y-5">
            <p className="text-[16px] leading-8 text-ink">
              Subscription sharing already happens in every Indian household
              &mdash; between siblings, flatmates, parents and partners
              &mdash; but everywhere outside Bantle it&apos;s a WhatsApp
              thread that nobody updates and a payment somebody always
              forgets. We built Bantle to make that pattern reliable for
              the people who already live with each other.
            </p>
            <p className="text-[16px] leading-8 text-ink">
              That means email verification on every account, gentle
              monthly reminders, and a clear separation between coordination
              and money. We host the structure. Your household does the
              splitting.
            </p>
            <ul className="grid gap-3 mt-6">
              {[
                "Email-verified members on every plan",
                "Built for household members who already know each other",
                "Free to use — Bantle doesn't earn from your splits",
                "No payment handling — direct between members",
              ].map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3 text-[15px] text-ink"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-600 shrink-0"
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function ComingSoonCTA() {
  return (
    <section className="bg-teal-900 text-cream border-t border-teal-800">
      <div className="container-x py-16 md:py-24 text-center">
        <h2 className="font-serif italic text-3xl md:text-5xl tracking-tightish text-balance max-w-3xl mx-auto">
          Be the first to know when we launch.
        </h2>
        <p className="mt-5 text-lg leading-8 text-cream/80 max-w-2xl mx-auto">
          Bantle is opening up to Indian households in early access. Drop
          us a line if you&apos;d like to be one of the first invites, or
          bookmark the store badges below.
        </p>
        <div className="mt-10">
          <ComingSoonBadges align="center" />
        </div>
        <p className="mt-8 text-sm text-cream/70">
          <Link
            href="/support"
            className="underline underline-offset-2 hover:text-cream"
          >
            Request early access →
          </Link>
        </p>
      </div>
    </section>
  );
}
