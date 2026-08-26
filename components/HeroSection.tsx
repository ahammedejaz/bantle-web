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
      {/* The scene's key light. One source, high and to the right, behind the
          device. Everything else on the page casts away from it. */}
      <div
        aria-hidden="true"
        className="glow pointer-events-none absolute -right-[18rem] -top-[26rem] h-[52rem] w-[52rem] opacity-[0.55]"
        style={{ "--glow-blur": "120px" } as React.CSSProperties}
      />
      {/* A second, much weaker fill on the opposite side, so the left half of
          the band is not dead black. */}
      <div
        aria-hidden="true"
        className="glow pointer-events-none absolute -left-[26rem] top-[14rem] h-[40rem] w-[40rem] opacity-[0.16]"
        style={{ "--glow-blur": "140px" } as React.CSSProperties}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent"
      />

      <div className="container-x relative z-10 pt-14 md:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-10 xl:gap-16">
          <div>
            <span className="bantle-rise glass inline-flex items-center gap-2.5 rounded-full py-2 pl-3 pr-4 text-[12.5px] font-medium text-fg">
              <span aria-hidden="true" className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-accent/40 blur-[3px]" />
                <span className="relative h-2 w-2 rounded-full bg-accent" />
              </span>
              Live on Android and iOS
            </span>

            <h1
              className="bantle-rise mt-8 text-balance font-display text-[42px] font-semibold leading-[1.02] tracking-display text-heading sm:text-[54px] lg:text-[48px] xl:text-[60px] 2xl:text-[66px]"
              style={{ "--rise-delay": "70ms" } as React.CSSProperties}
            >
              Split or buy subscriptions with{" "}
              <span className="text-accent">more trust</span>.
            </h1>

            <p
              className="bantle-rise mt-7 max-w-[44ch] text-pretty text-[17px] leading-[1.62] text-fg-muted md:text-[19px]"
              style={{ "--rise-delay": "140ms" } as React.CSSProperties}
            >
              Share a monthly slot or buy the access a seller has left. Verified
              listings, clear terms, payments outside Bantle.
            </p>

            <div
              className="bantle-rise mt-10"
              style={{ "--rise-delay": "210ms" } as React.CSSProperties}
            >
              <StoreBadges />
            </div>
          </div>

          <DeviceShowcase />
        </div>
      </div>

      <div className="container-x relative z-10 mt-16 md:mt-20">
        <div className="grid divide-y divide-edge border-t border-edge md:grid-cols-3 md:divide-x md:divide-y-0">
          {trustPoints.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.title}
                className="group py-8 md:px-8 md:first:pl-0 md:last:pr-0"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-edge bg-surface text-accent shadow-soft">
                  <Icon
                    className="h-[17px] w-[17px]"
                    strokeWidth={1.9}
                    aria-hidden="true"
                  />
                </span>
                <h2 className="mt-4 font-display text-[17.5px] font-semibold tracking-tight text-heading">
                  {point.title}
                </h2>
                <p className="mt-2 text-[14.5px] leading-[1.62] text-fg-muted">
                  {point.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-12 md:h-16" />
    </section>
  );
}

function DeviceShowcase() {
  return (
    <div
      className="bantle-rise relative mx-auto w-full max-w-[318px] sm:max-w-[344px] lg:max-w-[336px] xl:max-w-[364px]"
      style={{ "--rise-delay": "160ms" } as React.CSSProperties}
    >
      {/* Backlight. Sits behind the device in the stacking order, not in the
          3D scene, so it stays put while the device turns against it. */}
      <div
        aria-hidden="true"
        className="glow pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[125%] w-[135%] -translate-x-1/2 -translate-y-1/2 opacity-40"
        style={{ "--glow-blur": "80px" } as React.CSSProperties}
      />

      <DeviceScene className="relative">
        <figure className="relative m-0" style={{ transformStyle: "preserve-3d" }}>
          {/* Contact shadow. Inside the 3D scene, so it swings with the
              device the way a real one would. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 bottom-0 h-16 rounded-[50%] bg-black/70 blur-2xl"
            style={{ transform: "translate3d(0, 34px, -60px)" }}
          />

          <div
            role="img"
            aria-label="Illustrative rendering of the Bantle app showing sample subscription listings with placeholder prices, a verified host badge, a propose-a-deal action, and a note that chat starts after a deal request."
            className="relative rounded-device bg-gradient-to-b from-[#22332C] via-[#0C1713] to-[#040C09] p-[9px] shadow-device ring-1 ring-inset ring-white/[0.14]"
          >
            {/* Specular highlight along the top edge of the chassis. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-14 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent"
            />
            {/* The device rests turned a few degrees to the left, so its left
                flank is the one facing the light. Giving that edge its own
                highlight is what sells the rotation as a real surface rather
                than a skewed picture. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-16 left-0 w-px bg-gradient-to-b from-transparent via-white/35 to-transparent"
            />

            <div className="relative overflow-hidden rounded-[36px] bg-[#040908]">
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
                    <span className="mt-1 block text-[10.5px] leading-none text-white/55">
                      Discover slots
                    </span>
                  </span>
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/60">
                  <Bell className="h-3.5 w-3.5" strokeWidth={1.9} />
                </span>
              </div>

              {/* Activity summary */}
              <div className="px-5 pt-4">
                <div className="relative overflow-hidden rounded-[18px] border border-accent/25 bg-gradient-to-br from-[#122B21] to-[#0A1A14] p-3.5">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-accent/25 blur-2xl"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  <div className="relative flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/50">
                    <TrendingUp className="h-3 w-3" strokeWidth={2.2} />
                    This month
                  </div>
                  <p className="relative mt-2 font-display text-[25px] font-semibold leading-none tracking-tight text-white">
                    <span data-numeric>₹324</span>
                    <span className="ml-1 text-[13px] font-medium text-white/50">
                      saved
                    </span>
                  </p>
                  <div className="relative mt-3 flex gap-1.5">
                    <span className="rounded-full bg-white/[0.08] px-2.5 py-1 text-[10.5px] font-medium text-white/75">
                      3 active deals
                    </span>
                    <span className="rounded-full bg-white/[0.08] px-2.5 py-1 text-[10.5px] font-medium text-white/75">
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
                    className="flex items-center gap-3 rounded-[16px] border border-white/[0.08] bg-white/[0.04] p-2.5"
                  >
                    <span
                      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] font-display text-[12px] font-bold shadow-[inset_0_1px_0_rgb(255_255_255_/_0.25)] ${slot.tone}`}
                    >
                      {slot.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-white">
                        {slot.title}
                      </p>
                      <p className="mt-0.5 truncate text-[10.5px] text-white/55">
                        {slot.meta}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-[13.5px] font-semibold text-white">
                        <span data-numeric>{slot.price}</span>
                        <span className="text-[10px] font-medium text-white/55">
                          {slot.unit}
                        </span>
                      </p>
                      <p className="mt-0.5 text-[9.5px] text-white/55">
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
                <div className="relative overflow-hidden rounded-[18px] border border-accent/30 bg-gradient-to-br from-[#143125] to-[#0A1A14] p-3.5">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-white">
                        Productivity Suite
                      </p>
                      <p className="mt-0.5 text-[11px] text-white/50">
                        <span data-numeric>₹149</span>/month · 2 slots left
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-accent/35 bg-accent/12 px-2 py-1 text-[9.5px] font-semibold text-accent">
                      <BadgeCheck className="h-3 w-3" strokeWidth={2.2} />
                      Verified host
                    </span>
                  </div>

                  <div className="relative mt-3.5 grid h-10 overflow-hidden rounded-[12px] bg-gradient-to-b from-accent-strong to-accent shadow-mint">
                    {/* Beat one: the press sweeps across the control. */}
                    <span
                      data-seq="press"
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-10 bg-white/45"
                    />
                    {/* Beat two: the control's own label becomes the receipt. */}
                    <span
                      data-seq-out
                      className="col-start-1 row-start-1 flex items-center justify-center font-display text-[13.5px] font-semibold text-[#04120D]"
                    >
                      Propose a deal
                    </span>
                    <span
                      data-seq="sent"
                      aria-hidden="true"
                      className="col-start-1 row-start-1 flex items-center justify-center gap-1.5 font-display text-[13.5px] font-semibold text-[#04120D]"
                    >
                      <Send className="h-3.5 w-3.5" strokeWidth={2.4} />
                      Deal request sent
                    </span>
                  </div>

                  <div className="relative mt-2.5 flex items-center justify-center gap-1.5 text-[10px] text-white/50">
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
                      className={active ? "h-4 w-4 text-accent" : "h-4 w-4 text-white/50"}
                      strokeWidth={active ? 2.2 : 1.8}
                    />
                    <span
                      className={
                        active
                          ? "text-[8.5px] font-medium text-accent"
                          : "text-[8.5px] font-medium text-white/50"
                      }
                    >
                      {label}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Beat three: accepted, and chat is open.
              On wide screens it sits beside the propose control rather than
              over the status bar, because it is that control's consequence:
              the eye is already at the bottom of the device when the sequence
              lands, and it used to have to jump back up to find the result.
              There is no room beside the device on a phone, so there it
              straddles the top edge instead, centred, which is where a real
              notification would arrive. It used to be hidden below `md`
              entirely, which left the sequence's payoff off the screen for
              every phone visitor.
              The outer element owns placement, the inner one owns depth and
              the animation, so neither has to know about the other. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 md:bottom-[21%] md:left-0 md:top-auto md:-translate-x-[58%] xl:-translate-x-[68%]"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              data-seq="chat"
              className="chip flex items-center gap-2.5 rounded-2xl py-2.5 pl-2.5 pr-4"
              style={{ transform: "translateZ(70px)" }}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-accent-strong to-accent text-[#04120D] shadow-mint">
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
              <span className="leading-tight">
                <span className="block whitespace-nowrap text-[12.5px] font-semibold text-white">
                  Proposal accepted
                </span>
                <span className="block whitespace-nowrap text-[11px] text-white/55">
                  Chat is now open
                </span>
              </span>
            </div>
          </div>

          <figcaption className="mt-6 text-center text-[11.5px] text-fg-muted">
            Illustrative preview. Sample listings, not live data.
          </figcaption>
        </figure>
      </DeviceScene>
    </div>
  );
}
