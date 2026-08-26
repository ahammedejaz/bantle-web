import Image from "next/image";
import {
  BadgeCheck,
  Bell,
  Bookmark,
  Check,
  Home,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
  TrendingUp,
  User,
} from "lucide-react";
import { StoreBadges } from "@/components/StoreBadges";
import { DeviceScene } from "@/components/site/DeviceScene";

// Marketing homepage hero.
//
// The right-hand device is an illustrative product rendering built in HTML/CSS
// with neutral sample data: no real screenshots, no personal or test names, and
// no provider names or logos, since Bantle is not affiliated with any
// subscription provider. Its colours are taken from the Bantle app itself, so a
// visitor who installs recognises where they landed.

const slots = [
  {
    initials: "VP",
    title: "Video Premium",
    meta: "Family plan",
    price: "₹129",
    unit: "/mo",
    note: "2 slots left",
    tone: "bg-[#C0362C] text-white",
  },
  {
    initials: "MF",
    title: "Music Family",
    meta: "Household plan",
    price: "₹79",
    unit: "/mo",
    note: "Monthly",
    tone: "bg-[#6B2FBF] text-white",
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
    <section className="grain relative isolate overflow-hidden bg-canvas">
      {/* A single light source, offset and soft, rather than a symmetrical
          pair of decorative halos. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-56 h-[46rem] w-[46rem] rounded-full bg-accent/[0.10] blur-[150px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"
      />

      <div className="container-x relative z-10 pt-12 md:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] lg:gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:gap-16">
          <div>
            <span className="bantle-rise inline-flex items-center gap-2 rounded-full border border-edge bg-surface/70 py-1.5 pl-2.5 pr-4 text-[12.5px] font-medium text-fg-muted">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-accent"
              />
              Live on Android and iOS
            </span>

            <h1
              className="bantle-rise mt-7 text-balance font-display text-[38px] font-semibold leading-[1.03] tracking-display text-heading sm:text-[46px] lg:text-[40px] xl:text-[50px] 2xl:text-[56px]"
              style={{ "--rise-delay": "70ms" } as React.CSSProperties}
            >
              Split or buy subscriptions with{" "}
              <span className="text-accent">more trust</span>.
            </h1>

            <p
              className="bantle-rise mt-6 max-w-[46ch] text-pretty text-[17px] leading-[1.6] text-fg-muted md:text-[18.5px]"
              style={{ "--rise-delay": "140ms" } as React.CSSProperties}
            >
              Share a monthly slot or buy the access a seller has left. Verified
              listings, clear terms, payments outside Bantle.
            </p>

            <div
              className="bantle-rise mt-9"
              style={{ "--rise-delay": "210ms" } as React.CSSProperties}
            >
              <StoreBadges />
            </div>
          </div>

          <DeviceShowcase />
        </div>
      </div>

      <div className="container-x relative z-10 mt-14 md:mt-16">
        <div className="grid divide-y divide-edge border-t border-edge md:grid-cols-3 md:divide-x md:divide-y-0">
          {trustPoints.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="py-7 md:px-7 md:first:pl-0 md:last:pr-0"
              >
                <Icon
                  className="h-5 w-5 text-accent"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <h2 className="mt-3.5 font-display text-[17px] font-semibold tracking-tight text-heading">
                  {point.title}
                </h2>
                <p className="mt-1.5 text-[14.5px] leading-[1.6] text-fg-muted">
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
      <DeviceScene className="relative">
        <figure className="relative m-0">
          <div
            role="img"
            aria-label="Illustrative rendering of the Bantle app showing sample subscription listings with placeholder prices, a verified host badge, a propose-a-deal action, and a note that chat starts after a deal request."
            className="relative rounded-device bg-gradient-to-b from-[#1B2A25] to-[#05100C] p-2.5 shadow-device ring-1 ring-inset ring-white/[0.16]"
          >
            {/* Specular highlight along the top edge of the chassis. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
            />

            <div className="relative overflow-hidden rounded-[36px] bg-[#050807]">
              {/* Status bar with a Dynamic-Island-style cutout. */}
              <div className="relative flex items-center justify-between px-6 pb-1 pt-3.5">
                <span
                  className="font-mono text-[11px] font-medium text-white/85"
                  data-numeric
                >
                  9:41
                </span>
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-black"
                />
                <span aria-hidden="true" className="flex items-center gap-1">
                  <span className="h-2 w-1 rounded-sm bg-white/60" />
                  <span className="h-2.5 w-1 rounded-sm bg-white/60" />
                  <span className="h-3 w-1 rounded-sm bg-white/30" />
                  <span className="ml-1 h-2.5 w-4 rounded-[3px] border border-white/35" />
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
                    <span className="block font-display text-[15px] font-semibold leading-none tracking-tight text-white">
                      Bantle
                    </span>
                    <span className="mt-1 block text-[10.5px] leading-none text-white/45">
                      Discover slots
                    </span>
                  </span>
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/60">
                  <Bell className="h-3.5 w-3.5" strokeWidth={1.9} />
                </span>
              </div>

              {/* Activity summary */}
              <div className="px-5 pt-4">
                <div className="relative overflow-hidden rounded-[18px] border border-accent/20 bg-[#0A1C15] p-3.5">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-accent/20 blur-2xl"
                  />
                  <div className="relative flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/45">
                    <TrendingUp className="h-3 w-3" strokeWidth={2.2} />
                    This month
                  </div>
                  <p className="relative mt-2 font-display text-[24px] font-semibold leading-none tracking-tight text-white">
                    <span data-numeric>₹324</span>
                    <span className="ml-1 text-[13px] font-medium text-white/50">
                      saved
                    </span>
                  </p>
                  <div className="relative mt-3 flex gap-1.5">
                    <span className="rounded-full bg-white/[0.07] px-2.5 py-1 text-[10.5px] font-medium text-white/75">
                      3 active deals
                    </span>
                    <span className="rounded-full bg-white/[0.07] px-2.5 py-1 text-[10.5px] font-medium text-white/75">
                      2 proposals
                    </span>
                  </div>
                </div>
              </div>

              {/* Popular slots */}
              <div className="flex items-center justify-between px-5 pt-4">
                <p className="text-[11px] font-semibold text-white">
                  Popular slots
                </p>
                <span className="text-[10.5px] font-semibold text-accent">
                  See all
                </span>
              </div>
              <div className="grid gap-1.5 px-5 pt-2.5">
                {slots.map((slot) => (
                  <div
                    key={slot.title}
                    className="flex items-center gap-3 rounded-[16px] border border-white/[0.07] bg-white/[0.03] p-2.5"
                  >
                    <span
                      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] font-display text-[12px] font-bold ${slot.tone}`}
                    >
                      {slot.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-white">
                        {slot.title}
                      </p>
                      <p className="mt-0.5 truncate text-[10.5px] text-white/45">
                        {slot.meta}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-[13.5px] font-semibold text-white">
                        <span data-numeric>{slot.price}</span>
                        <span className="text-[10px] font-medium text-white/45">
                          {slot.unit}
                        </span>
                      </p>
                      <p className="mt-0.5 text-[9.5px] text-white/45">
                        {slot.note}
                      </p>
                    </div>
                    <Bookmark
                      className="h-3.5 w-3.5 shrink-0 text-white/30"
                      strokeWidth={1.8}
                    />
                  </div>
                ))}
              </div>

              {/* Selected listing. This block is the focal moment: the propose
                  action is pressed, the request is sent, the deal is accepted. */}
              <div className="px-5 pb-3.5 pt-3.5">
                <div className="rounded-[18px] border border-accent/25 bg-[#0A1C15] p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-white">
                        Productivity Suite
                      </p>
                      <p className="mt-0.5 text-[11px] text-white/45">
                        <span data-numeric>₹149</span>/month · 2 slots left
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-1 text-[9.5px] font-semibold text-accent">
                      <BadgeCheck className="h-3 w-3" strokeWidth={2.2} />
                      Verified host
                    </span>
                  </div>

                  <div className="relative mt-3 grid h-10 overflow-hidden rounded-[12px] bg-accent shadow-mint">
                    {/* Beat one: the press sweeps across the control. */}
                    <span
                      data-seq="press"
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-10 bg-white/45"
                    />
                    {/* Beat two: the control's own label becomes the receipt. */}
                    <span
                      data-seq-out
                      className="col-start-1 row-start-1 flex items-center justify-center font-display text-[13.5px] font-semibold text-canvas"
                    >
                      Propose a deal
                    </span>
                    <span
                      data-seq="sent"
                      aria-hidden="true"
                      className="col-start-1 row-start-1 flex items-center justify-center gap-1.5 font-display text-[13.5px] font-semibold text-canvas"
                    >
                      <Send className="h-3.5 w-3.5" strokeWidth={2.4} />
                      Deal request sent
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-white/45">
                    <MessageCircle
                      className="h-3 w-3 text-accent"
                      strokeWidth={2}
                    />
                    Chat starts after your deal request
                  </div>
                </div>

              </div>

              {/* Tab bar */}
              <div className="flex items-center justify-around border-t border-white/[0.07] px-6 pb-4 pt-2.5">
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
                      className={active ? "h-4 w-4 text-accent" : "h-4 w-4 text-white/35"}
                      strokeWidth={active ? 2.2 : 1.8}
                    />
                    <span
                      className={
                        active
                          ? "text-[8.5px] font-medium text-accent"
                          : "text-[8.5px] font-medium text-white/35"
                      }
                    >
                      {label}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Beat three: accepted, and chat is open. Sits forward of the device
              in the 3D scene, so the pointer tilt parallaxes it against the
              screen instead of moving it in lockstep. */}
          <div
            data-seq="chat"
            aria-hidden="true"
            className="pointer-events-none absolute -left-5 -top-5 hidden items-center gap-2.5 rounded-2xl border border-white/10 bg-[#0E1F1A]/95 py-2.5 pl-2.5 pr-4 shadow-float backdrop-blur sm:flex lg:-left-9"
            style={{ transform: "translateZ(60px)" }}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-canvas">
              <Check className="h-4 w-4" strokeWidth={3} />
            </span>
            <span className="leading-tight">
              <span className="block text-[12.5px] font-semibold text-white">
                Proposal accepted
              </span>
              <span className="block text-[11px] text-white/50">
                Chat is now open
              </span>
            </span>
          </div>

          <figcaption className="mt-4 text-center text-[11.5px] text-fg-muted">
            Illustrative preview. Sample listings, not live data.
          </figcaption>
        </figure>
      </DeviceScene>
    </div>
  );
}
