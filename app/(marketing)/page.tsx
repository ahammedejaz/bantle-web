import Link from "next/link";
import {
  Ban,
  CircleHelp,
  FileCheck2,
  HandCoins,
  HeartHandshake,
  ListChecks,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import { FeatureCard } from "@/components/FeatureCard";
import { ComingSoonBadges } from "@/components/ComingSoonBadges";
import {
  BRAND_NAME,
  CONTACT_EMAIL,
  SITE_DESCRIPTION,
  SITE_URL,
} from "@/lib/constants";

export const metadata = {
  title: {
    absolute: "Bantle — Household subscription access coordination",
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: SITE_URL,
    email: CONTACT_EMAIL,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en-IN",
  },
];

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
      <SeeInAction />
      <WhyBantle />
      <HowItWorks />
      <AppPreview />
      <SafetyAndLimits />
      <FAQPreview />
      <ComingSoonCTA />
    </>
  );
}

function SeeInAction() {
  const shots = [
    {
      src: "/images/app-screens/home-popular-listings.jpg",
      width: 757,
      height: 1536,
      label: "Home feed",
      body: "Discover popular listings and compare monthly slots at a glance.",
      alt: "Bantle mobile home screen showing activity and popular subscription listings",
    },
    {
      src: "/images/app-screens/listing-detail-propose-deal.jpg",
      width: 762,
      height: 1536,
      label: "Listing details",
      body: "Review the host, price, commitment, and availability, then propose a deal. Chat starts after your deal request.",
      alt: "Bantle mobile listing detail screen showing Microsoft 365 Family and propose a deal button",
    },
  ];

  return (
    <section className="border-t border-line">
      <div className="container-x py-16 md:py-24">
        <div className="max-w-2xl mb-12 md:mb-16">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
            See Bantle in action
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-teal-900 leading-tight tracking-tightish text-balance">
            Browse, review, then propose a deal.
          </h2>
          <p className="mt-5 text-[16px] leading-8 text-ink-muted max-w-xl">
            Browse active subscription slots, review the details, and propose a
            deal when everything looks right. Chat opens after a deal request.
          </p>
        </div>
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-8 md:gap-12">
          {shots.map((shot) => (
            <figure key={shot.label} className="flex flex-col items-center">
              <div className="w-full max-w-[300px] rounded-[38px] border border-line bg-white p-3 shadow-[0_28px_90px_rgba(0,60,52,0.16)]">
                <div className="overflow-hidden rounded-[30px] border border-line bg-cream">
                  {/* Static marketing screenshot from the current mobile app.
                      next/image is not used elsewhere on this site; a plain
                      img with explicit width/height avoids layout shift. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shot.src}
                    width={shot.width}
                    height={shot.height}
                    alt={shot.alt}
                    loading="lazy"
                    className="block h-auto w-full"
                  />
                </div>
              </div>
              <figcaption className="mt-6 max-w-xs text-center">
                <p className="font-serif text-xl text-teal-900">{shot.label}</p>
                <p className="mt-2 text-[15px] leading-7 text-ink-muted">
                  {shot.body}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
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
      icon: ListChecks,
      title: "Add the access you coordinate",
      body: "Choose monthly sharing or one-time access, then add the details another person should review before the arrangement moves forward.",
    },
    {
      icon: MessageCircle,
      title: "Confirm details in chat",
      body: "Use Bantle chat to confirm provider rules, access, duration, timing, and expectations directly with the other user.",
    },
    {
      icon: HandCoins,
      title: "Handle payments outside Bantle",
      body: "Users choose their own outside-Bantle payment method. Bantle does not collect, route, verify, insure, or reverse payments.",
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
            From clear terms to a direct conversation.
          </h2>
        </div>
        <ol className="grid gap-10 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;

            return (
              <li key={step.title} className="flex flex-col gap-4">
                <span
                  aria-hidden="true"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-teal-900 text-teal-900 font-medium"
                >
                  {i + 1}
                </span>
                <Icon className="h-5 w-5 text-teal-700" strokeWidth={1.8} />
                <h3 className="font-serif text-xl text-teal-900">
                  {step.title}
                </h3>
                <p className="text-[15px] leading-7 text-ink-muted">
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
      title: "Chat context",
      body: "Users confirm access, timing, expectations, and next steps directly with each other before moving ahead outside Bantle.",
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
            <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
              App preview
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-teal-900 leading-tight tracking-tightish text-balance">
              A preview grounded in the real app flow.
            </h2>
            <p className="mt-5 text-[16px] leading-8 text-ink-muted max-w-xl">
              These highlights mirror the real Bantle app flow shown in the
              screenshots above.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-card border border-line bg-white p-6 shadow-[0_18px_54px_rgba(0,60,52,0.08)]"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-button bg-teal-100 text-teal-900">
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

function SafetyAndLimits() {
  const safetyNotes = [
    "Users coordinate directly with people they already trust.",
    "Every arrangement should follow the provider's household or family-plan rules.",
    "Bantle keeps terms, chat, and updates organized for moderation context.",
    "Optional identity verification keeps selfies private, manually reviewed, and off public profiles.",
  ];
  const limits = [
    "Bantle does not collect, hold, route, verify, insure, or reverse payments.",
    "Bantle does not promise access, duration, refunds, compensation, scam recovery, or dispute outcomes.",
    "Bantle is not affiliated with subscription providers and does not decide whether a plan arrangement is allowed.",
  ];

  return (
    <section className="bg-cream-card border-t border-line">
      <div className="container-x py-16 md:py-24">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
              Safety and transparency
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-teal-900 leading-tight tracking-tightish text-balance">
              Built around clear responsibilities.
            </h2>
            <ul className="mt-8 grid gap-4">
              {safetyNotes.map((note) => (
                <li key={note} className="flex gap-3 text-[15px] leading-7">
                  <ShieldCheck
                    className="mt-1 h-5 w-5 shrink-0 text-teal-700"
                    strokeWidth={1.8}
                  />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-card border border-line bg-white p-6 md:p-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-button bg-teal-100 text-teal-900">
                <Ban className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <h3 className="font-serif text-2xl text-teal-900">
                What Bantle does not do
              </h3>
            </div>
            <ul className="mt-6 grid gap-4">
              {limits.map((line) => (
                <li key={line} className="flex gap-3 text-[15px] leading-7">
                  <span
                    aria-hidden="true"
                    className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600"
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

function FAQPreview() {
  const faqs = [
    {
      q: "Is Bantle a payment app?",
      a: "No. Any payment is coordinated directly between users outside Bantle.",
    },
    {
      q: "Can every subscription be coordinated?",
      a: "No. Users must check and follow each provider's household or family-plan rules.",
    },
    {
      q: "Does Bantle promise access?",
      a: "No. Users confirm access, duration, and expectations directly with each other.",
    },
  ];

  return (
    <section className="border-t border-line">
      <div className="container-x py-16 md:py-24">
        <div className="max-w-2xl mb-10">
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-4">
            FAQ
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-teal-900 leading-tight tracking-tightish text-balance">
            The important boundaries are visible upfront.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {faqs.map((item) => (
            <article
              key={item.q}
              className="rounded-card border border-line bg-white p-6"
            >
              <CircleHelp
                className="h-5 w-5 text-teal-700"
                strokeWidth={1.8}
              />
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

function ComingSoonCTA() {
  return (
    <section className="bg-teal-900 text-cream border-t border-teal-800">
      <div className="container-x py-16 md:py-24 text-center">
        <h2 className="font-serif italic text-3xl md:text-5xl tracking-tightish text-balance max-w-3xl mx-auto">
          Be the first to know when Bantle opens.
        </h2>
        <p className="mt-5 text-lg leading-8 text-cream/80 max-w-2xl mx-auto">
          Bantle is opening up in early access. Request access if you want
          launch updates, or bookmark the store badges below.
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
