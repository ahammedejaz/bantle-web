import Link from "next/link";
import {
  HandCoins,
  HeartHandshake,
  ShieldCheck,
  MessageCircle,
  Wallet,
  ListChecks,
} from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import { FeatureCard } from "@/components/FeatureCard";
import { ComingSoonBadges } from "@/components/ComingSoonBadges";
import { BRAND_NAME, SITE_DESCRIPTION } from "@/lib/constants";

export const metadata = {
  title: `${BRAND_NAME} — share subscription costs. Keep your savings.`,
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
            Real savings. Real people. No middleman taking a cut.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={HandCoins}
            title="Save real money"
            body="A family Spotify plan in India costs around ₹179 a month. Split between six people, that's under ₹30 each. Now repeat that for YouTube Premium, Apple One and Microsoft 365. The maths adds up to thousands a year."
          />
          <FeatureCard
            icon={HeartHandshake}
            title="Find trusted partners"
            body="Every member signs in with a verified phone number. Profiles build a star rating over time through Day 30, 60 and 90 check-ins. Talk before you share — coordinate over chat first, commit second."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Stay in control"
            body="Bantle never touches your money. You and your sharing partner settle in rupees on whatever UPI app you already use. No wallets to top up, no balances to chase, no fees to anyone."
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
      title: "Post or browse a plan",
      body: "Open the home feed to see listings around you, or post your own family plan. Listings show the platform, how many slots are open, the monthly price per person, and how long the host plans to keep the plan running.",
    },
    {
      icon: MessageCircle,
      title: "Chat with a potential partner",
      body: "Tap a listing and start a conversation. Ask the questions you would ask any flatmate-style arrangement — how payments work, whether everyone uses the plan within the same household, what happens if access changes.",
    },
    {
      icon: Wallet,
      title: "Settle outside the app via UPI",
      body: "Agree on terms, accept the deal in-app, and exchange UPI handles. From there it's a normal UPI payment between two people. Bantle stays out of the money flow, which is faster, cheaper and safer for everyone.",
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
            Three simple steps from listing to your first split.
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
              Subscription sharing already happens — between siblings,
              flatmates, and college groups — but everywhere outside Bantle
              it&apos;s informal, awkward and easy to forget. We built Bantle to
              make that pattern dependable, with the kind of trust signals
              that help an honest stranger feel like a familiar neighbour.
            </p>
            <p className="text-[16px] leading-8 text-ink">
              That means phone verification on every account, a ratings
              system that rewards people who actually pay on time, and a
              clear separation between discovery and money. We host the
              conversation. You do the splitting.
            </p>
            <ul className="grid gap-3 mt-6">
              {[
                "Phone-verified members on every listing",
                "Star ratings after the 30, 60 and 90-day marks",
                "Free to use — Bantle doesn't earn from your splits",
                "No payment handling — UPI directly between users",
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
          Bantle is opening up to Indian users in early access. Drop us a
          line if you&apos;d like to be one of the first invites, or
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
