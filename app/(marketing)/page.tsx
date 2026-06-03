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
  title: `${BRAND_NAME} — coordinate subscription access.`,
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
            Built for clear, direct coordination.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={HandCoins}
            title="Keep terms visible"
            body="Coordinate monthly sharing or one-time access for subscriptions you already manage. Clear listing terms and chat context help both sides understand what they are discussing."
          />
          <FeatureCard
            icon={HeartHandshake}
            title="Coordinate directly"
            body="Listings, chat and deal states keep the arrangement clear. Bantle provides structure while users confirm access, provider rules and any outside-Bantle payment directly."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Stay in control"
            body="Bantle never touches money and does not verify payment, access or duration. Users stay responsible for following each provider's household or family-plan rules."
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
      title: "Add monthly sharing or one-time access",
      body: "Pick the subscription access you are coordinating, choose monthly sharing or one-time access, and add the safe notes the other person should confirm in chat.",
    },
    {
      icon: MessageCircle,
      title: "Confirm details in chat",
      body: "Use chat to confirm access, provider rules, timing and expectations directly. Bantle requires safety acknowledgements before proposal and acceptance, but does not guarantee the arrangement.",
    },
    {
      icon: HandCoins,
      title: "Coordinate outside Bantle",
      body: "Payment happens outside Bantle by whatever method users mutually choose. Bantle does not collect, process, verify or insure payments, and does not provide refunds or compensation.",
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
            Three steps from listed terms to a clear conversation.
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
              Subscription coordination already happens across India,
              often through chat threads where plan terms, access
              expectations and renewal timing get lost. We built Bantle to make those
              details clearer before users coordinate directly.
            </p>
            <p className="text-[16px] leading-8 text-ink">
              That means email verification on every account, gentle
              reminders, type-aware listing terms, and a clear separation
              between coordination and money. We host the structure. Users
              confirm the arrangement directly.
            </p>
            <ul className="grid gap-3 mt-6">
              {[
                "Email-verified accounts",
                "Monthly sharing and one-time access terms",
                "Free to use — Bantle doesn't earn from your arrangements",
                "No payment handling — users coordinate directly",
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
          Bantle is opening up in early access. Drop us a line if
          you&apos;d like to be one of the first invites, or bookmark the
          store badges below.
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
