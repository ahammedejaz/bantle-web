import type { ReactNode } from "react";
import {
  BadgeCheck,
  Bell,
  Bookmark,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { ComingSoonBadges } from "@/components/ComingSoonBadges";

// Marketing homepage hero. Light/cream premium to match the rest of the
// marketing site, with mint/green accents that nod to the mobile app. The
// right-hand "app preview" is a light app-style card built entirely in
// HTML/CSS with neutral placeholder data — no real mobile screenshots, no
// personal/test names, no provider logos.

const slots = [
  {
    initials: "PV",
    title: "Prime Video",
    meta: "Family plan",
    price: "₹120/mo",
    note: "2 slots left",
    tone: "bg-gradient-to-br from-teal-300 to-teal-400 text-[#02241E]",
  },
  {
    initials: "MP",
    title: "Music Premium",
    meta: "Household plan",
    price: "₹70/mo",
    note: "Monthly",
    tone: "bg-gradient-to-br from-teal-400 to-teal-500 text-cream",
  },
  {
    initials: "CS",
    title: "Cloud Storage",
    meta: "Family plan",
    price: "₹90/mo",
    note: "Shared",
    tone: "bg-teal-100 text-teal-800",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-teal-50 via-cream to-cream">
      {/* one soft mint highlight, kept subtle on the light background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-24 h-[420px] w-[420px] rounded-full bg-teal-200/40 blur-[130px]"
      />
      <div className="container-x relative pt-14 pb-20 md:pt-20 md:pb-28">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-teal-700">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              Coming soon · Made in India
            </span>
            <h1 className="mt-6 max-w-2xl text-balance font-serif text-4xl italic leading-[1.05] tracking-tightish text-teal-900 sm:text-5xl md:text-6xl">
              Split subscriptions with{" "}
              <span className="text-teal-500">more trust</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink-muted">
              Find active subscription slots, review the details, and propose a
              deal when everything looks right. Bantle keeps trust signals,
              chat, and safety checks clear — while payments stay outside
              Bantle.
            </p>
            <div className="mt-7 grid max-w-2xl gap-3 text-sm sm:grid-cols-3">
              <HeroPill>Propose a deal first</HeroPill>
              <HeroPill>Payments stay outside Bantle</HeroPill>
              <HeroPill>Private trust verification</HeroPill>
            </div>
            <div className="mt-9">
              <ComingSoonBadges />
              <p className="mt-4 text-sm text-ink-muted">
                Launching first on Android, with iOS to follow.
              </p>
            </div>
          </div>
          <AppPreviewVisual />
        </div>
      </div>
    </section>
  );
}

function HeroPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-11 items-center gap-2 rounded-button border border-teal-200 bg-teal-50 px-3 py-2 text-teal-800">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" strokeWidth={1.9} />
      <span className="leading-snug">{children}</span>
    </span>
  );
}

function AppPreviewVisual() {
  return (
    <div
      className="relative mx-auto w-full max-w-[420px]"
      role="img"
      aria-label="Illustrative Bantle app preview showing example subscription slots with neutral placeholder data, a verified host, a propose-a-deal action, and a note that chat starts after a deal request"
    >
      {/* soft mint halo behind the card for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[48px] bg-gradient-to-br from-teal-200/50 to-transparent blur-2xl"
      />
      <div className="rounded-[40px] border border-line bg-white p-3 shadow-[0_40px_90px_-30px_rgba(0,60,52,0.45)] ring-1 ring-teal-900/5">
        <div className="overflow-hidden rounded-[32px] border border-line bg-cream">
          {/* status bar */}
          <div className="flex items-center justify-between px-5 pt-4 text-ink">
            <span className="text-[13px] font-semibold">9:41</span>
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-3.5 rounded-[3px] bg-ink/80" />
              <span className="h-2.5 w-3.5 rounded-[3px] border border-ink/40" />
            </div>
          </div>

          {/* app header */}
          <div className="flex items-center justify-between px-5 pt-4">
            <span className="inline-flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/bantle-mark.png"
                alt=""
                width={168}
                height={214}
                className="h-6 w-auto shrink-0 object-contain"
              />
              <span>
                <span className="block font-sans text-[15px] font-medium leading-none tracking-[-0.01em] text-teal-900">
                  Bantle
                </span>
                <span className="mt-1 block text-[11px] leading-none text-ink-muted">
                  Trust-ready slots
                </span>
              </span>
            </span>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink-muted">
              <Bell className="h-4 w-4" strokeWidth={1.8} />
            </span>
          </div>

          {/* activity summary (mint accent card) */}
          <div className="px-5 pt-4">
            <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 p-4 text-cream shadow-[0_16px_40px_-18px_rgba(0,60,52,0.55)]">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-cream/75">
                <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />
                Activity
              </div>
              <p className="mt-2 font-sans text-xl font-semibold">
                ₹280<span className="text-sm font-medium text-cream/80">/mo savings</span>
              </p>
              <div className="mt-3 flex gap-2">
                <span className="rounded-full bg-cream/15 px-2.5 py-1 text-[11px] font-medium">
                  3 active deals
                </span>
                <span className="rounded-full bg-cream/15 px-2.5 py-1 text-[11px] font-medium">
                  2 pending proposals
                </span>
              </div>
            </div>
          </div>

          {/* popular slots */}
          <div className="flex items-center justify-between px-5 pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
              Popular slots
            </p>
            <span className="text-[11px] font-medium text-teal-600">See all</span>
          </div>
          <div className="grid gap-2 px-5 pt-2.5">
            {slots.map((slot) => (
              <div
                key={slot.title}
                className="flex items-center gap-3 rounded-2xl border border-line bg-white p-2.5 shadow-[0_8px_20px_-14px_rgba(0,60,52,0.3)]"
              >
                <span
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] text-sm font-semibold ${slot.tone}`}
                >
                  {slot.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-teal-900">
                    {slot.title}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-ink-muted">
                    {slot.meta}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-teal-700">
                    {slot.price}
                  </p>
                  <p className="mt-0.5 text-[10px] text-ink-muted">{slot.note}</p>
                </div>
                <Bookmark className="h-4 w-4 shrink-0 text-ink-muted/60" strokeWidth={1.7} />
              </div>
            ))}
          </div>

          {/* selected listing */}
          <div className="px-5 pb-5 pt-4">
            <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-sans text-sm font-semibold text-teal-900">
                    Microsoft 365 Family
                  </p>
                  <p className="mt-0.5 text-[12px] text-ink-muted">
                    ₹120/month · 2 slots left
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-teal-700 ring-1 ring-teal-200">
                  <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} />
                  Verified host
                </span>
              </div>
              <div className="mt-3 flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-teal-700 text-sm font-semibold text-cream shadow-[0_12px_28px_-12px_rgba(0,60,52,0.6)]">
                Propose a deal
              </div>
              <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-ink-muted">
                <MessageCircle className="h-3.5 w-3.5 text-teal-600" strokeWidth={1.9} />
                Chat starts after your deal request
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 border-t border-line bg-white px-5 py-3 text-[11px] text-ink-muted">
            <ShieldCheck className="h-4 w-4 text-teal-600" strokeWidth={1.9} />
            Identity verification is private and manually reviewed
          </div>
        </div>
      </div>
    </div>
  );
}
