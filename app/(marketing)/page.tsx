import Link from "next/link";
import {
  Ban,
  BadgeCheck,
  CircleHelp,
  FileCheck2,
  HandCoins,
  HeartHandshake,
  ListChecks,
  MessageCircle,
  Search,
  ShieldCheck,
} from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import { FeatureCard } from "@/components/FeatureCard";
import { StoreBadges } from "@/components/StoreBadges";
import {
  BRAND_NAME,
  CONTACT_EMAIL,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/constants";

export const metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: BRAND_NAME,
      url: SITE_URL,
      email: CONTACT_EMAIL,
    },
    {
      "@type": "WebSite",
      name: BRAND_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: "en-IN",
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <HeroSection />
      <WhyBantle />
      <HowItWorks />
      <AppPreview />
      <TrustHighlights />
      <SafetyAndLimits />
      <FAQPreview />
      <DownloadCTA />
    </>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs uppercase tracking-[0.14em] text-teal-600">
      {children}
    </p>
  );
}

function WhyBantle() {
  return (
    <section className="border-t border-line">
      <div className="container-x py-16 md:py-24">
        <div className="mb-12 max-w-2xl md:mb-16">
          <Eyebrow>Why Bantle</Eyebrow>
          <h2 className="text-balance font-serif text-3xl leading-tight tracking-tightish text-teal-900 md:text-4xl">
            A clearer place for direct coordination.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={FileCheck2}
            title="Keep terms visible"
            body="Add the access type, expected duration, pricing notes, slots, and safety context in one place before anyone coordinates directly."
          />
          <FeatureCard
            icon={HeartHandshake}
            title="Coordinate with context"
            body="Listings, chat, and deal states keep both sides aligned while users confirm access, provider rules, and timing themselves."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Stay within the rules"
            body="Bantle reminds users to follow each provider's household or family-plan rules and keeps money handling outside the app."
          />
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Discover monthly slots or one-time access",
      body: "Browse active listings — share a recurring monthly slot, or buy fixed-duration access when a seller has validity remaining. Compare price, duration, and open slots.",
    },
    {
      icon: ListChecks,
      title: "Review the listing details",
      body: "Check provider-rule reminders, host trust signals, and the terms another person should confirm before anything moves forward.",
    },
    {
      icon: HeartHandshake,
      title: "Propose a deal",
      body: "Buyers propose first. Send a deal request on the listing when the details look right for you.",
    },
    {
      icon: MessageCircle,
      title: "Chat after the request",
      body: "Chat opens after a deal request or accepted proposal, so you confirm provider rules, access, timing, and expectations directly.",
    },
    {
      icon: HandCoins,
      title: "Handle payments outside Bantle",
      body: "Verify the details, then choose your own outside-Bantle payment method. Bantle does not collect, route, verify, insure, or reverse payments.",
    },
  ];

  return (
    <section className="border-t border-line bg-cream-card">
      <div className="container-x py-16 md:py-24">
        <div className="mb-12 max-w-2xl md:mb-16">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="text-balance font-serif text-3xl leading-tight tracking-tightish text-teal-900 md:text-4xl">
            From discovering a slot to a direct conversation.
          </h2>
        </div>
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {steps.map((step, i) => {
            const Icon = step.icon;

            return (
              <li
                key={step.title}
                className="group flex h-full flex-col gap-3 rounded-2xl border border-teal-900/10 bg-white p-5 shadow-[0_10px_30px_-14px_rgba(0,60,52,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-[0_22px_46px_-24px_rgba(0,60,52,0.28)]"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-[13px] font-semibold text-cream shadow-[0_8px_18px_-8px_rgba(0,60,52,0.6)]"
                  >
                    {i + 1}
                  </span>
                  <Icon className="h-5 w-5 text-teal-700" strokeWidth={1.8} />
                </div>
                <h3 className="font-serif text-base leading-snug text-teal-900">
                  {step.title}
                </h3>
                <p className="text-[13.5px] leading-6 text-ink-muted">
                  {step.body}
                </p>
              </li>
            );
          })}
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

function AppPreview() {
  const highlights = [
    {
      icon: FileCheck2,
      title: "Listing terms",
      body: "Plan type, access notes, provider-rule reminders, and outside-Bantle payment context stay visible before users coordinate directly.",
    },
    {
      icon: MessageCircle,
      title: "Proposal-first chat",
      body: "Chat opens after a deal request or accepted proposal, so users confirm access, timing, and next steps before moving ahead outside Bantle.",
    },
    {
      icon: ListChecks,
      title: "Status updates",
      body: "Deal states help both sides understand what has been proposed, accepted, closed, or needs attention.",
    },
    {
      icon: ShieldCheck,
      title: "Safety controls",
      body: "Settings, reports, blocks, and support surfaces are part of the app experience without changing payment responsibility.",
    },
  ];

  return (
    <section className="border-t border-line">
      <div className="container-x py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <Eyebrow>App preview</Eyebrow>
            <h2 className="text-balance font-serif text-3xl leading-tight tracking-tightish text-teal-900 md:text-4xl">
              A preview grounded in the real app flow.
            </h2>
            <p className="mt-5 max-w-xl text-[16px] leading-8 text-ink-muted">
              These highlights mirror how the Bantle mobile app keeps discovery,
              proposals, chat, and safety clear for both sides.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="group rounded-3xl border border-teal-900/10 bg-white p-6 shadow-[0_10px_30px_-14px_rgba(0,60,52,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-[0_24px_50px_-22px_rgba(0,60,52,0.28)]"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-teal-50 text-teal-700 ring-1 ring-teal-200/70 transition-colors duration-300 group-hover:text-teal-900">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-5 font-serif text-xl text-teal-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-7 text-ink-muted">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustHighlights() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Private identity review",
      body: "Selfies stay private, are manually reviewed, stay off public profiles, and don't use location tracking.",
    },
    {
      icon: BadgeCheck,
      title: "Trust badges with limits",
      body: "Identity verified, Business verified, and Partner verified are signals that help reduce fake accounts — not guarantees of payment, access, refunds, or outcomes.",
    },
    {
      icon: FileCheck2,
      title: "Verified access to listing",
      body: "Posting a listing requires identity verification or an approved business or partner profile.",
    },
    {
      icon: ListChecks,
      title: "Limited access before verification",
      body: "Unverified accounts have limited deal activity until identity verification is completed.",
    },
    {
      icon: HeartHandshake,
      title: "Partner and business review",
      body: "Businesses and partners who want to sell on Bantle can reach out to be reviewed.",
    },
    {
      icon: MessageCircle,
      title: "Proposal-first chat",
      body: "Buyers propose first, and chat opens after a deal request or accepted proposal.",
    },
  ];

  return (
    <section className="border-t border-line bg-gradient-to-b from-teal-50/60 via-cream to-cream">
      <div className="container-x py-16 md:py-24">
        <div className="mb-12 max-w-2xl md:mb-16">
          <Eyebrow>Why Bantle is different</Eyebrow>
          <h2 className="text-balance font-serif text-3xl leading-tight tracking-tightish text-teal-900 md:text-4xl">
            Trust built into every step.
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <FeatureCard
              key={item.title}
              icon={item.icon}
              title={item.title}
              body={item.body}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function SafetyAndLimits() {
  const safetyNotes = [
    "Buyers propose first, and chat opens after a deal request or accepted proposal.",
    "Posting a listing requires identity verification or an approved business or partner profile.",
    "Identity verification keeps selfies private, manually reviewed, off public profiles, and without location tracking.",
    "Trust badges — Identity verified, Business verified, and Partner verified — are signals that help reduce fake accounts, not guarantees of any outcome.",
    "Unverified accounts have limited deal activity until they complete identity verification.",
    "Businesses and partners who want to sell on Bantle can reach out to be reviewed.",
    "Provider terms still apply — some family or household plans may require members to be in the same household or location, so only list, request, or buy access when the provider's own terms allow it.",
  ];
  const limits = [
    "Bantle does not collect, hold, route, verify, insure, or reverse payments.",
    "Bantle does not promise access, duration, refunds, compensation, scam recovery, or dispute outcomes.",
    "Bantle is not affiliated with subscription providers and does not decide whether a plan arrangement is allowed.",
  ];

  return (
    <section className="border-t border-line bg-cream-card">
      <div className="container-x py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <Eyebrow>Safety and transparency</Eyebrow>
            <h2 className="text-balance font-serif text-3xl leading-tight tracking-tightish text-teal-900 md:text-4xl">
              Built around clear responsibilities.
            </h2>
            <ul className="mt-8 grid gap-4">
              {safetyNotes.map((note) => (
                <li
                  key={note}
                  className="flex gap-3 text-[15px] leading-7 text-ink"
                >
                  <BadgeCheck
                    className="mt-1 h-5 w-5 shrink-0 text-teal-700"
                    strokeWidth={1.8}
                  />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-teal-900/10 bg-white p-6 text-center shadow-[0_18px_50px_-20px_rgba(0,60,52,0.25)] md:p-8">
            <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-teal-50 text-teal-700 ring-1 ring-teal-200/70">
              <Ban className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <h3 className="mt-4 font-serif text-2xl text-teal-900">
              What Bantle does not do
            </h3>
            <ul className="mt-6 grid gap-3">
              {limits.map((line) => (
                <li
                  key={line}
                  className="text-[15px] leading-7 text-ink"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQPreview() {
  const faqs = [
    {
      q: "Is Bantle a payment app?",
      a: "No. Any payment is coordinated directly between users outside Bantle.",
    },
    {
      q: "When does chat start?",
      a: "Buyers propose first. Chat opens after a deal request or accepted proposal.",
    },
    {
      q: "Does Bantle promise access?",
      a: "No. Users confirm access, duration, and expectations directly with each other.",
    },
  ];

  return (
    <section className="border-t border-line">
      <div className="container-x py-16 md:py-24">
        <div className="mb-10 max-w-2xl">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="text-balance font-serif text-3xl leading-tight tracking-tightish text-teal-900 md:text-4xl">
            The important boundaries are visible upfront.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {faqs.map((item) => (
            <article
              key={item.q}
              className="group rounded-3xl border border-teal-900/10 bg-white p-6 shadow-[0_10px_30px_-14px_rgba(0,60,52,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-[0_24px_50px_-22px_rgba(0,60,52,0.28)]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                <CircleHelp className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <h3 className="mt-4 font-serif text-xl text-teal-900">
                {item.q}
              </h3>
              <p className="mt-3 text-[15px] leading-7 text-ink-muted">
                {item.a}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-10">
          <Link
            href="/faq"
            className="text-teal-600 underline underline-offset-2 hover:text-teal-900 text-[15px]"
          >
            Read all questions →
          </Link>
        </div>
      </div>
    </section>
  );
}

function DownloadCTA() {
  return (
    <section className="border-t border-teal-800 bg-teal-900 text-cream">
      <div className="container-x py-16 text-center md:py-24">
        <h2 className="mx-auto max-w-3xl text-balance font-serif text-3xl italic leading-[1.15] tracking-tightish md:text-5xl md:leading-[1.12]">
          Bantle is live. Get the app.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-cream/80">
          Download Bantle on Google Play or the App Store to browse listings,
          propose deals, and find sharing partners across India.
        </p>
        <div className="mt-10 flex justify-center">
          <StoreBadges align="center" />
        </div>
        <p className="mt-8 text-sm text-cream/70">
          <Link
            href="/support"
            className="underline underline-offset-2 hover:text-cream"
          >
            Need help? Contact support →
          </Link>
        </p>
      </div>
    </section>
  );
}
