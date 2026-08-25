import {
  BadgeCheck,
  Bell,
  Bookmark,
  Check,
  Home,
  MessageCircle,
  Search,
  ShieldCheck,
  TrendingUp,
  User,
} from "lucide-react";
import Image from "next/image";
import { StoreBadges } from "@/components/StoreBadges";

// Marketing homepage hero.
//
// The band is the brand's deep green, so the header above it and the hero read
// as one mass. The right-hand device is an illustrative product rendering built
// in HTML/CSS with neutral sample data: no real mobile screenshots, no personal
// or test names, and no provider names or logos, since Bantle is not affiliated
// with any subscription provider.

const slots = [
  {
    initials: "VP",
    title: "Video Premium",
    meta: "Family plan",
    price: "₹129",
    unit: "/mo",
    note: "2 slots left",
    tone: "bg-gradient-to-br from-mint to-mint-2 text-canvas",
  },
  {
    initials: "MF",
    title: "Music Family",
    meta: "Household plan",
    price: "₹79",
    unit: "/mo",
    note: "Monthly",
    tone: "bg-gradient-to-br from-teal-400 to-teal-600 text-white",
  },
];

const trustPoints = [
  {
    icon: BadgeCheck,
    title: "Verified sellers only",
    body: "Listing requires identity verification, or an approved business or partner profile.",
  },
  {
    icon: MessageCircle,
    title: "Proposal-first chat",
    body: "Buyers propose first. Chat opens after a deal request or an accepted proposal.",
  },
  {
    icon: ShieldCheck,
    title: "Payments stay yours",
    body: "Bantle never collects, holds, routes, or reverses money. That part stays direct.",
  },
];

export function HeroSection() {
  return (
    <section className="grain relative isolate overflow-hidden bg-canvas text-canvas-fg">
      {/* Two soft mint sources give the flat band depth without a gradient wash. */}
      <div
        aria-hidden="true"
        className="bantle-glow pointer-events-none absolute -right-32 -top-48 h-[38rem] w-[38rem] rounded-full bg-mint/[0.16] blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-56 -left-40 h-[32rem] w-[32rem] rounded-full bg-teal-400/[0.14] blur-[150px]"
      />

      <div className="container-x relative z-10 pt-12 md:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:gap-16">
          <div className="lg:pt-6">
            <span
              className="bantle-rise inline-flex items-center gap-2 rounded-full border border-canvas-edge/15 bg-canvas-edge/[0.06] py-1.5 pl-2.5 pr-4 font-mono text-[10px] uppercase tracking-[0.18em] text-mint"
            >
              <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-mint opacity-70" />
              </span>
              Now live · Made in India
            </span>

            <h1
              className="bantle-rise mt-7 text-balance font-display text-[38px] font-semibold leading-[1.03] tracking-display text-canvas-fg sm:text-[46px] lg:text-[40px] xl:text-[50px] 2xl:text-[56px]"
              style={{ "--rise-delay": "70ms" } as React.CSSProperties}
            >
              Split or buy subscriptions with{" "}
              <span className="text-mint">more trust</span>.
            </h1>

            <p
              className="bantle-rise mt-6 max-w-xl text-pretty text-[17px] leading-[1.6] text-canvas-fg-muted md:text-[18.5px]"
              style={{ "--rise-delay": "140ms" } as React.CSSProperties}
            >
              Share a monthly slot or buy the access a seller has left. Verified
              listings, clear terms, payments outside Bantle.
            </p>

            <div
              className="bantle-rise mt-9"
              style={{ "--rise-delay": "210ms" } as React.CSSProperties}
            >
              <StoreBadges tone="light" />
            </div>
          </div>

          <DeviceShowcase />
        </div>
      </div>

      <div className="container-x relative z-10 mt-14 md:mt-16">
        <div className="grid divide-y divide-canvas-edge/10 border-t border-canvas-edge/10 md:grid-cols-3 md:divide-x md:divide-y-0">
          {trustPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                data-reveal
                style={
                  { "--reveal-delay": `${index * 70}ms` } as React.CSSProperties
                }
                className="py-7 md:px-7 md:first:pl-0 md:last:pr-0"
              >
                <Icon
                  className="h-5 w-5 text-mint"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <h2 className="mt-3.5 font-display text-[17px] font-semibold tracking-tight text-canvas-fg">
                  {point.title}
                </h2>
                <p className="mt-1.5 text-[14.5px] leading-[1.6] text-canvas-fg-muted">
                  {point.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-10 md:h-14" />
    </section>
  );
}

function DeviceShowcase() {
  return (
    <div
      className="bantle-rise relative mx-auto w-full max-w-[320px] sm:max-w-[340px] lg:max-w-[330px]"
      style={{ "--rise-delay": "160ms" } as React.CSSProperties}
    >
      {/* Concentric rings behind the device: depth, and a target for the eye. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-canvas-edge/[0.07]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[105%] w-[105%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-canvas-edge/[0.07]"
      />

      <div className="bantle-float">
        <figure className="m-0">
          <div
            role="img"
            aria-label="Illustrative rendering of the Bantle app showing sample subscription listings with placeholder prices, a verified host badge, a propose-a-deal action, and a note that chat starts after a deal request."
            className="relative rounded-device bg-gradient-to-b from-[#132B26] to-[#081915] p-2.5 shadow-device ring-1 ring-inset ring-white/[0.14]"
          >
            {/* Specular highlight along the top edge of the chassis. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
            />

            <div className="relative overflow-hidden rounded-[36px] bg-[#F6FAF8]">
              {/* Status bar with a Dynamic-Island-style cutout. */}
              <div className="relative flex items-center justify-between px-6 pb-1 pt-3.5">
                <span
                  className="font-mono text-[11px] font-medium text-[#0A1E1A]"
                  data-numeric
                >
                  9:41
                </span>
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-[#081915]"
                />
                <span aria-hidden="true" className="flex items-center gap-1">
                  <span className="h-2 w-1 rounded-sm bg-[#0A1E1A]/70" />
                  <span className="h-2.5 w-1 rounded-sm bg-[#0A1E1A]/70" />
                  <span className="h-3 w-1 rounded-sm bg-[#0A1E1A]/40" />
                  <span className="ml-1 h-2.5 w-4 rounded-[3px] border border-[#0A1E1A]/40" />
                </span>
              </div>

              {/* App header */}
              <div className="flex items-center justify-between px-5 pt-4">
                <span className="inline-flex items-center gap-2">
                  <Image
                    src="/brand/bantle-mark.png"
                    alt=""
                    width={148}
                    height={197}
                    className="h-6 w-auto shrink-0 object-contain"
                  />
                  <span>
                    <span className="block font-display text-[15px] font-semibold leading-none tracking-tight text-[#00332B]">
                      Bantle
                    </span>
                    <span className="mt-1 block text-[10.5px] leading-none text-[#586661]">
                      Discover slots
                    </span>
                  </span>
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#586661] ring-1 ring-[#E1E8E3]">
                  <Bell className="h-3.5 w-3.5" strokeWidth={1.9} />
                </span>
              </div>

              {/* Activity summary */}
              <div className="px-5 pt-4">
                <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-br from-[#00463A] to-[#00251E] p-3.5 text-white">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-mint/25 blur-2xl"
                  />
                  <div className="relative flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/60">
                    <TrendingUp className="h-3 w-3" strokeWidth={2.2} />
                    This month
                  </div>
                  <p className="relative mt-2 font-display text-[24px] font-semibold leading-none tracking-tight">
                    <span data-numeric>₹324</span>
                    <span className="ml-1 text-[13px] font-medium text-white/65">
                      saved
                    </span>
                  </p>
                  <div className="relative mt-3 flex gap-1.5">
                    <span className="rounded-full bg-white/12 px-2.5 py-1 text-[10.5px] font-medium">
                      3 active deals
                    </span>
                    <span className="rounded-full bg-white/12 px-2.5 py-1 text-[10.5px] font-medium">
                      2 proposals
                    </span>
                  </div>
                </div>
              </div>

              {/* Popular slots */}
              <div className="flex items-center justify-between px-5 pt-4">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#00332B]">
                  Popular slots
                </p>
                <span className="text-[10.5px] font-semibold text-[#007654]">
                  See all
                </span>
              </div>
              <div className="grid gap-1.5 px-5 pt-2.5">
                {slots.map((slot) => (
                  <div
                    key={slot.title}
                    className="flex items-center gap-3 rounded-[16px] bg-white p-2.5 ring-1 ring-[#E9EFEB]"
                  >
                    <span
                      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] font-display text-[12px] font-bold ${slot.tone}`}
                    >
                      {slot.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#00332B]">
                        {slot.title}
                      </p>
                      <p className="mt-0.5 truncate text-[10.5px] text-[#586661]">
                        {slot.meta}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-[13.5px] font-semibold text-[#00332B]">
                        <span data-numeric>{slot.price}</span>
                        <span className="text-[10px] font-medium text-[#586661]">
                          {slot.unit}
                        </span>
                      </p>
                      <p className="mt-0.5 text-[9.5px] text-[#586661]">
                        {slot.note}
                      </p>
                    </div>
                    <Bookmark
                      className="h-3.5 w-3.5 shrink-0 text-[#98A5A0]"
                      strokeWidth={1.8}
                    />
                  </div>
                ))}
              </div>

              {/* Selected listing */}
              <div className="px-5 pb-3.5 pt-3.5">
                <div className="rounded-[18px] bg-[#EAF6F0] p-3.5 ring-1 ring-[#CFE7DC]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[#00332B]">
                        Productivity Suite
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#586661]">
                        <span data-numeric>₹149</span>/month · 2 slots left
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-1 text-[9.5px] font-semibold text-[#00563F] ring-1 ring-[#BFE0D0]">
                      <BadgeCheck className="h-3 w-3" strokeWidth={2.2} />
                      Verified host
                    </span>
                  </div>
                  <div className="mt-3 flex h-10 items-center justify-center rounded-[12px] bg-gradient-to-r from-mint-2 to-[#00563F] font-display text-[13.5px] font-semibold text-white shadow-mint">
                    Propose a deal
                  </div>
                  <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-[#586661]">
                    <MessageCircle
                      className="h-3 w-3 text-[#007654]"
                      strokeWidth={2}
                    />
                    Chat starts after your deal request
                  </div>
                </div>
              </div>

              {/* Tab bar */}
              <div className="flex items-center justify-around border-t border-[#E9EFEB] bg-white px-6 pb-4 pt-2.5">
                {[
                  { icon: Home, label: "Home", active: true },
                  { icon: Search, label: "Browse", active: false },
                  { icon: MessageCircle, label: "Chats", active: false },
                  { icon: User, label: "You", active: false },
                ].map(({ icon: Icon, label, active }) => (
                  <span
                    key={label}
                    className="flex flex-col items-center gap-1"
                    aria-hidden="true"
                  >
                    <Icon
                      className={`h-4 w-4 ${active ? "text-[#00563F]" : "text-[#6E7C77]"}`}
                      strokeWidth={active ? 2.2 : 1.8}
                    />
                    <span
                      className={`text-[8.5px] font-medium ${active ? "text-[#00563F]" : "text-[#6E7C77]"}`}
                    >
                      {label}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* One floating notification: the moment the product is actually about. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-6 bottom-[4.5rem] hidden items-center gap-2.5 rounded-2xl bg-white/95 py-2.5 pl-2.5 pr-4 shadow-float ring-1 ring-black/5 backdrop-blur sm:flex lg:-left-10"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-mint to-mint-2 text-canvas">
              <Check className="h-4 w-4" strokeWidth={3} />
            </span>
            <span className="leading-tight">
              <span className="block text-[12.5px] font-semibold text-[#00332B]">
                Proposal accepted
              </span>
              <span className="block text-[11px] text-[#586661]">
                Chat is now open
              </span>
            </span>
          </div>

          <figcaption className="mt-4 text-center text-[11.5px] text-canvas-fg-muted/70">
            Illustrative preview. Sample listings, not live data.
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
