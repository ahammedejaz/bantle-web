import {
  BadgeCheck,
  Building2,
  Check,
  FileCheck2,
  HandCoins,
  Handshake,
  ListChecks,
  Lock,
  MessageCircle,
  Minus,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import { StoreBadges } from "@/components/StoreBadges";
import { Section, SectionHeading } from "@/components/site/Section";
import { ArrowLink } from "@/components/site/ArrowLink";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/constants";
import {
  breadcrumbNode,
  jsonLd,
  mobileApplicationNode,
  organizationNode,
  webPageNode,
  webSiteNode,
} from "@/lib/structured-data";

export const metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
};

const homeFaqs = [
  {
    question: "Is Bantle a payment app?",
    answer:
      "No. Any payment is coordinated directly between users outside Bantle. Bantle does not collect, hold, route, verify, insure, or reverse payments.",
  },
  {
    question: "When does chat start?",
    answer:
      "Buyers propose first. Chat opens after a deal request or an accepted proposal, so both sides confirm access, timing, and expectations before anything moves forward.",
  },
  {
    question: "Does Bantle promise access?",
    answer:
      "No. Users confirm access, duration, and expectations directly with each other. Trust badges are signals that help reduce fake accounts, not guarantees of any outcome.",
  },
];

const structuredData = jsonLd([
  organizationNode,
  webSiteNode,
  mobileApplicationNode,
  webPageNode({
    path: "/",
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
  }),
  breadcrumbNode([]),
]);

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
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

/* ---------------------------------------------------------------------------
   Why Bantle. Editorial two-column: a heading that stays put while three
   hairline-separated principles scroll past it. No cards.
   --------------------------------------------------------------------------- */

function WhyBantle() {
  const principles = [
    {
      icon: FileCheck2,
      title: "Keep terms visible",
      body: "Access type, expected duration, pricing notes, slots, and safety context all sit in one place, before anyone coordinates directly.",
    },
    {
      icon: Handshake,
      title: "Coordinate with context",
      body: "Listings, chat, and deal states keep both sides aligned while users confirm access, provider rules, and timing themselves.",
    },
    {
      icon: ShieldCheck,
      title: "Stay within the rules",
      body: "Bantle reminds users to follow each provider's household or family-plan rules, and keeps money handling outside the app.",
    },
  ];

  return (
    <Section tone="paper">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            title={
              <>
                A clearer place for{" "}
                <span className="text-accent">direct coordination</span>.
              </>
            }
            lead="Subscription arrangements usually live in scattered chats. Bantle puts the deciding details in one place."
          />
        </div>

        <ul className="grid">
          {principles.map((item, index) => {
            const Icon = item.icon;
            return (
              <li
                key={item.title}
                data-reveal
                style={
                  { "--reveal-delay": `${index * 80}ms` } as React.CSSProperties
                }
                className="group grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-2 border-b border-edge py-7 first:border-t sm:gap-x-7"
              >
                <span className="row-span-2 mt-0.5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-accent-sub text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-surface">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
                </span>
                <h3 className="font-display text-[21px] font-semibold tracking-tight text-heading">
                  {item.title}
                </h3>
                <p className="max-w-xl text-[15.5px] leading-[1.7] text-fg-muted">
                  {item.body}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------------------
   How it works. A connected rail: horizontal on large screens, vertical on
   small ones. The line between the nodes is the point of the section.
   --------------------------------------------------------------------------- */

function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Find a listing",
      body: "Browse a recurring monthly slot, or fixed-duration access when a seller has validity left.",
    },
    {
      icon: ListChecks,
      title: "Read the terms",
      body: "Provider-rule reminders, host trust signals, and the details to confirm before you commit.",
    },
    {
      icon: Handshake,
      title: "Propose a deal",
      body: "Buyers propose first. Send a deal request on the listing when the details look right.",
    },
    {
      icon: MessageCircle,
      title: "Chat opens",
      body: "Confirm provider rules, access, timing, and expectations directly with the other person.",
    },
    {
      icon: HandCoins,
      title: "Pay outside Bantle",
      body: "Choose your own method. Bantle never collects, routes, verifies, or reverses payments.",
    },
  ];

  return (
    <Section tone="surface">
      <SectionHeading
        kicker="How it works"
        title="From discovering a slot to a direct conversation."
        lead="Five steps, in the order they actually happen inside the app."
      />

      <ol className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-5 lg:gap-6">
        {/* The rail. Vertical on small screens, horizontal from lg upward. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[21px] top-2 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-accent/40 via-edge-2 to-transparent lg:left-0 lg:top-[21px] lg:h-px lg:w-full lg:bg-gradient-to-r lg:from-accent/40 lg:via-edge-2 lg:to-transparent"
        />

        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li
              key={step.title}
              data-reveal
              style={
                { "--reveal-delay": `${index * 70}ms` } as React.CSSProperties
              }
              className="relative pl-14 sm:pl-16 lg:pl-0"
            >
              <span className="absolute left-0 top-0 inline-flex h-[42px] w-[42px] items-center justify-center rounded-full bg-surface font-mono text-[12px] font-medium text-accent ring-1 ring-edge-2 lg:relative lg:mb-6 lg:flex">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Icon
                className="mb-3 h-[18px] w-[18px] text-accent lg:mb-4"
                strokeWidth={1.9}
                aria-hidden="true"
              />
              <h3 className="font-display text-[18px] font-semibold leading-snug tracking-tight text-heading">
                {step.title}
              </h3>
              <p className="mt-2 text-[14.5px] leading-[1.65] text-fg-muted">
                {step.body}
              </p>
            </li>
          );
        })}
      </ol>

      <div className="mt-14" data-reveal>
        <ArrowLink href="/how-it-works">Read the full walk-through</ArrowLink>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------------------
   App preview. A four-cell bento with real surface variety: one wide cell with
   an inline terms sketch, one dark cell with a chat sketch, one with state
   pills, one mint.
   --------------------------------------------------------------------------- */

function AppPreview() {
  return (
    <Section tone="sub">
      <SectionHeading
        title="A preview grounded in the real app flow."
        lead="These mirror how the Bantle mobile app keeps discovery, proposals, chat, and safety clear for both sides."
      />

      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {/* Listing terms - wide */}
        <article
          data-reveal
          className="rounded-panel bg-surface p-7 ring-1 ring-edge lg:col-span-4"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-sub text-accent">
            <FileCheck2 className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
          </span>
          <h3 className="mt-5 font-display text-[21px] font-semibold tracking-tight text-heading">
            Listing terms
          </h3>
          <p className="mt-2.5 max-w-lg text-[15px] leading-[1.7] text-fg-muted">
            Plan type, access notes, provider-rule reminders, and outside-Bantle
            payment context stay visible before users coordinate directly.
          </p>

          <dl
            aria-hidden="true"
            className="mt-6 grid gap-px overflow-hidden rounded-2xl bg-edge ring-1 ring-edge sm:grid-cols-2"
          >
            {[
              ["Plan type", "Monthly sharing"],
              ["Price", "₹129 / month"],
              ["Open slots", "2 of 6"],
              ["Payment", "Outside Bantle"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 bg-surface px-4 py-3"
              >
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
                  {label}
                </dt>
                <dd
                  className="text-[13.5px] font-medium text-heading"
                  data-numeric
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </article>

        {/* Proposal-first chat - dark */}
        <article
          data-reveal
          style={{ "--reveal-delay": "80ms" } as React.CSSProperties}
          className="grain relative isolate overflow-hidden rounded-panel bg-canvas p-7 text-canvas-fg lg:col-span-2"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-mint/15 blur-3xl"
          />
          <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-canvas-edge/10 text-mint">
            <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
          </span>
          <h3 className="relative mt-5 font-display text-[21px] font-semibold tracking-tight text-canvas-fg">
            Proposal-first chat
          </h3>
          <p className="relative mt-2.5 text-[15px] leading-[1.7] text-canvas-fg-muted">
            Chat opens after a deal request or an accepted proposal.
          </p>
          <div aria-hidden="true" className="relative mt-6 space-y-2">
            <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-mint px-3.5 py-2 text-[12.5px] font-medium text-canvas">
              Is the slot still open?
            </p>
            <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-md bg-canvas-edge/10 px-3.5 py-2 text-[12.5px] text-canvas-fg">
              Yes, two left. Sharing my plan terms now.
            </p>
          </div>
        </article>

        {/* Status updates */}
        <article
          data-reveal
          style={{ "--reveal-delay": "40ms" } as React.CSSProperties}
          className="rounded-panel bg-surface p-7 ring-1 ring-edge lg:col-span-3"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-sub text-accent">
            <ListChecks className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
          </span>
          <h3 className="mt-5 font-display text-[21px] font-semibold tracking-tight text-heading">
            Status updates
          </h3>
          <p className="mt-2.5 text-[15px] leading-[1.7] text-fg-muted">
            Deal states help both sides understand what has been proposed,
            accepted, closed, or needs attention.
          </p>
          <div aria-hidden="true" className="mt-6 flex flex-wrap gap-2">
            {["Proposed", "Accepted", "Active", "Completed", "Closed"].map(
              (state, index) => (
                <span
                  key={state}
                  className={
                    index === 1
                      ? "rounded-full bg-accent px-3 py-1.5 text-[12px] font-semibold text-surface"
                      : "rounded-full bg-paper-sub px-3 py-1.5 text-[12px] font-medium text-fg-muted ring-1 ring-edge"
                  }
                >
                  {state}
                </span>
              )
            )}
          </div>
        </article>

        {/* Safety controls - mint */}
        <article
          data-reveal
          style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
          className="relative isolate overflow-hidden rounded-panel bg-gradient-to-br from-[#8CF3D0] via-[#5FDCB0] to-[#2FB384] p-7 text-[#00251E] ring-1 ring-[#2FB384]/40 lg:col-span-3"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#00251E] text-[#8CF3D0]">
            <Lock className="h-[18px] w-[18px]" strokeWidth={1.9} aria-hidden="true" />
          </span>
          <h3 className="mt-5 font-display text-[21px] font-semibold tracking-tight">
            Safety controls
          </h3>
          <p className="mt-2.5 text-[15px] leading-[1.7] text-[#00251E]/85">
            Settings, reports, blocks, and support are part of the app
            experience, without changing payment responsibility.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] font-semibold text-[#00251E]/90">
            {["Block", "Report", "Pause a plan", "Privacy toggles"].map(
              (item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" />
                  {item}
                </li>
              )
            )}
          </ul>
        </article>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------------------
   Trust. The one dark band in the middle of the page: the badge system gets a
   real showcase, and the remaining facts sit in a two-column hairline list.
   --------------------------------------------------------------------------- */

function TrustHighlights() {
  const badges = [
    {
      icon: BadgeCheck,
      label: "Identity verified",
      body: "A private selfie, manually reviewed. Never shown on a public profile.",
    },
    {
      icon: Building2,
      label: "Business verified",
      body: "A business profile reviewed and approved by the Bantle team.",
    },
    {
      icon: Sparkles,
      label: "Partner verified",
      body: "A partner profile reviewed and approved by the Bantle team.",
    },
  ];

  const facts = [
    {
      title: "Private identity review",
      body: "Selfies stay private, are manually reviewed, stay off public profiles, and do not use location tracking.",
    },
    {
      title: "Verified access to listing",
      body: "Posting a listing requires identity verification, or an approved business or partner profile.",
    },
    {
      title: "Limited access before verification",
      body: "Unverified accounts have limited deal activity until identity verification is completed.",
    },
    {
      title: "Partner and business review",
      body: "Businesses and partners who want to sell on Bantle can reach out to be reviewed.",
    },
  ];

  return (
    <section className="grain relative isolate overflow-hidden bg-canvas text-canvas-fg">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-1/4 h-[30rem] w-[30rem] rounded-full bg-mint/10 blur-[140px]"
      />
      <div className="container-x relative z-10 py-20 md:py-28">
        <SectionHeading
          tone="dark"
          align="center"
          title="Trust built into every step."
          lead="Badges are signals that help reduce fake accounts. They are not guarantees of payment, access, refunds, or outcomes."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.label}
                data-reveal
                style={
                  { "--reveal-delay": `${index * 80}ms` } as React.CSSProperties
                }
                className="rounded-panel border border-canvas-edge/10 bg-canvas-edge/[0.04] p-6 text-center"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1.5 text-[12.5px] font-semibold text-canvas">
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />
                  {badge.label}
                </span>
                <p className="mt-4 text-[14px] leading-[1.6] text-canvas-fg-muted">
                  {badge.body}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid gap-px overflow-hidden rounded-panel border border-canvas-edge/10 bg-canvas-edge/10 sm:grid-cols-2">
          {facts.map((fact, index) => (
            <div
              key={fact.title}
              data-reveal
              style={
                { "--reveal-delay": `${index * 60}ms` } as React.CSSProperties
              }
              className="bg-canvas p-6 md:p-7"
            >
              <h3 className="font-display text-[17px] font-semibold tracking-tight text-canvas-fg">
                {fact.title}
              </h3>
              <p className="mt-2 text-[14.5px] leading-[1.65] text-canvas-fg-muted">
                {fact.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center" data-reveal>
          <ArrowLink href="/safety" tone="dark">
            How safety works on Bantle
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Safety and limits. Asymmetric split: a checklist on the left, and a panel on
   the right that stays in view while the list scrolls.
   --------------------------------------------------------------------------- */

function SafetyAndLimits() {
  const safetyNotes = [
    "Buyers propose first, and chat opens after a deal request or accepted proposal.",
    "Posting a listing requires identity verification, or an approved business or partner profile.",
    "Identity verification keeps selfies private, manually reviewed, off public profiles, and without location tracking.",
    "Trust badges (Identity verified, Business verified, Partner verified) are signals that help reduce fake accounts, not guarantees of any outcome.",
    "Unverified accounts have limited deal activity until they complete identity verification.",
    "Businesses and partners who want to sell on Bantle can reach out to be reviewed.",
    "Provider terms still apply. Some family or household plans require members to be in the same household or location, so only list, request, or buy access when the provider's own terms allow it.",
  ];

  const limits = [
    "Collect, hold, route, verify, insure, or reverse payments.",
    "Promise access, duration, refunds, compensation, scam recovery, or dispute outcomes.",
    "Decide whether a plan arrangement is allowed by a subscription provider.",
  ];

  return (
    <Section tone="paper">
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
        <div>
          <SectionHeading
            kicker="Safety and transparency"
            title="Built around clear responsibilities."
          />
          <ul className="mt-10 grid">
            {safetyNotes.map((note, index) => (
              <li
                key={note}
                data-reveal
                style={
                  { "--reveal-delay": `${Math.min(index, 4) * 50}ms` } as React.CSSProperties
                }
                className="flex gap-4 border-b border-edge py-4 text-[15px] leading-[1.7] text-fg-muted first:border-t"
              >
                <Check
                  className="mt-[5px] h-4 w-4 shrink-0 text-accent"
                  strokeWidth={2.6}
                  aria-hidden="true"
                />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          data-reveal
          className="rounded-panel bg-surface p-7 shadow-soft ring-1 ring-edge lg:sticky lg:top-28 md:p-8"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-negative/10 text-negative">
            <Minus className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden="true" />
          </span>
          <h3 className="mt-5 font-display text-[24px] font-semibold tracking-tight text-heading">
            What Bantle does not do
          </h3>
          <ul className="mt-6 grid">
            {limits.map((line) => (
              <li
                key={line}
                className="flex gap-3.5 border-t border-edge py-4 text-[15px] leading-[1.65] text-fg-muted"
              >
                <X
                  className="mt-[3px] h-4 w-4 shrink-0 text-negative/70"
                  strokeWidth={2.4}
                  aria-hidden="true"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-2xl bg-paper-sub px-4 py-3.5 text-[13.5px] leading-[1.6] text-fg-muted">
            Every rupee moves directly between users, by a method they choose
            themselves.
          </p>
        </div>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------------------
   FAQ preview. A disclosure list, not a card grid. The first answer is open so
   the section reads as answered rather than as a set of closed doors.
   --------------------------------------------------------------------------- */

function FAQPreview() {
  return (
    <Section tone="surface">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <SectionHeading
          className="lg:sticky lg:top-28 lg:self-start"
          title="The important boundaries are visible upfront."
        />

        <div>
          <div className="grid">
            {homeFaqs.map((item, index) => (
              <details
                key={item.question}
                open={index === 0}
                data-reveal
                style={
                  { "--reveal-delay": `${index * 70}ms` } as React.CSSProperties
                }
                className="disclosure group border-b border-edge first:border-t"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6">
                  <span className="font-display text-[19px] font-semibold leading-snug tracking-tight text-heading transition-colors group-hover:text-accent">
                    {item.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-accent ring-1 ring-edge-2 transition-transform duration-200 ease-out group-open:rotate-45"
                  >
                    <span className="relative block h-3 w-3">
                      <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current" />
                      <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
                    </span>
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 pr-10 text-[15.5px] leading-[1.7] text-fg-muted">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-10" data-reveal>
            <ArrowLink href="/faq">Read all questions</ArrowLink>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------------------------------------------------------------------------
   Download. The closing statement band, flush against the footer.
   --------------------------------------------------------------------------- */

function DownloadCTA() {
  return (
    <section
      id="get-the-app"
      className="grain relative isolate overflow-hidden bg-canvas text-canvas-fg"
    >
      <div
        aria-hidden="true"
        className="bantle-glow pointer-events-none absolute left-1/2 top-0 h-[26rem] w-[52rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint/[0.13] blur-[130px]"
      />
      <div className="container-x relative z-10 py-24 text-center md:py-32">
        <h2
          data-reveal
          className="mx-auto max-w-3xl text-balance font-display text-[36px] font-semibold leading-[1.04] tracking-display text-canvas-fg sm:text-[46px] md:text-[58px]"
        >
          Bantle is live. Get the app.
        </h2>
        <p
          data-reveal
          style={{ "--reveal-delay": "80ms" } as React.CSSProperties}
          className="mx-auto mt-6 max-w-xl text-pretty text-[17px] leading-[1.65] text-canvas-fg-muted md:text-[18px]"
        >
          Browse listings, propose deals, and find sharing partners across India.
        </p>
        <div
          data-reveal
          style={{ "--reveal-delay": "150ms" } as React.CSSProperties}
          className="mt-10 flex justify-center"
        >
          <StoreBadges tone="light" align="center" />
        </div>
        <p
          data-reveal
          style={{ "--reveal-delay": "220ms" } as React.CSSProperties}
          className="mt-10"
        >
          <ArrowLink href="/support" tone="dark">
            Need help? Contact support
          </ArrowLink>
        </p>
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-canvas-edge/15 to-transparent"
      />
    </section>
  );
}
