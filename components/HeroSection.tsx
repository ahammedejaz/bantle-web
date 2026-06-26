import type { ReactNode } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { ComingSoonBadges } from "@/components/ComingSoonBadges";

// Marketing homepage hero. Dark, premium, mint-accented to mirror the
// current Bantle mobile app. The right-hand "app preview" is built
// entirely in HTML/CSS with neutral placeholder data — no real mobile
// screenshots, no personal/test names, no provider logos.

const slots = [
  {
    initials: "PV",
    title: "Prime Video",
    meta: "Family plan · 12 months",
    price: "₹120/mo",
    note: "2 slots left",
    tone: "bg-teal-300 text-[#02241E]",
  },
  {
    initials: "MP",
    title: "Music Premium",
    meta: "Household plan · monthly",
    price: "₹70/mo",
    note: "1 slot left",
    tone: "bg-teal-400 text-[#02241E]",
  },
  {
    initials: "CS",
    title: "Cloud Storage",
    meta: "Family plan · shared",
    price: "₹90/mo",
    note: "Review details",
    tone: "bg-white/10 text-cream",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#02211C] text-cream">
      {/* soft mint glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-24 h-[460px] w-[460px] rounded-full bg-teal-400/20 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 h-[420px] w-[420px] rounded-full bg-teal-500/20 blur-[120px]"
      />
      <div className="container-x relative pt-14 pb-20 md:pt-20 md:pb-28">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-teal-300">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
              Coming soon · Made in India
            </span>
            <h1 className="mt-6 max-w-2xl text-balance font-serif text-4xl italic leading-[1.05] tracking-tightish sm:text-5xl md:text-6xl">
              Split subscriptions with{" "}
              <span className="text-teal-300">more trust</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-cream/75">
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
              <p className="mt-4 text-sm text-cream/55">
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
    <span className="inline-flex min-h-11 items-center gap-2 rounded-button border border-white/10 bg-white/[0.04] px-3 py-2 text-cream/85">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-300" strokeWidth={1.9} />
      <span className="leading-snug">{children}</span>
    </span>
  );
}

function AppPreviewVisual() {
  return (
    <div
      className="mx-auto w-full max-w-[420px]"
      role="img"
      aria-label="Illustrative Bantle app preview showing example subscription slots with neutral placeholder data, a propose-a-deal action, and a note that chat starts after a deal request"
    >
      <div className="relative rounded-[34px] border border-white/10 bg-white/[0.05] p-3 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur">
        <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[#04332B]">
          {/* top bar */}
          <div className="flex items-center justify-between px-5 pt-5">
            <span className="inline-flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/bantle-mark.png"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <span className="font-sans text-base font-semibold text-cream">
                Bantle
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-400/15 px-2.5 py-1 text-[11px] font-medium text-teal-300">
              <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2} />
              Verified host
            </span>
          </div>

          <div className="px-5 pt-6">
            <p className="text-xs uppercase tracking-[0.14em] text-teal-300/80">
              Popular slots
            </p>
          </div>

          {/* listing rows */}
          <div className="grid gap-2.5 px-5 pt-3">
            {slots.map((slot) => (
              <div
                key={slot.title}
                className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-3"
              >
                <span
                  className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-sm font-semibold ${slot.tone}`}
                >
                  {slot.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-cream">
                    {slot.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-cream/55">
                    {slot.meta}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-teal-300">
                    {slot.price}
                  </p>
                  <p className="mt-0.5 text-[11px] text-cream/55">{slot.note}</p>
                </div>
              </div>
            ))}
          </div>

          {/* propose + chat note */}
          <div className="px-5 pb-6 pt-4">
            <div className="flex h-12 items-center justify-center rounded-2xl bg-teal-400 text-sm font-semibold text-[#02241E]">
              Propose a deal
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-cream/60">
              <MessageCircle className="h-4 w-4 text-teal-300" strokeWidth={1.9} />
              Chat starts after your deal request
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 border-t border-white/8 bg-white/[0.03] px-5 py-3 text-[11px] text-cream/55">
            <ShieldCheck className="h-4 w-4 text-teal-300" strokeWidth={1.9} />
            Identity verification is private and manually reviewed
          </div>
        </div>
      </div>
    </div>
  );
}
