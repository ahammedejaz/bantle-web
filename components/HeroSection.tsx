import Image from "next/image";
import {
  Bell,
  Cloud,
  GraduationCap,
  Home,
  MessageCircle,
  Music,
  Plus,
  ShieldCheck,
  Tag,
  Tv,
  User,
} from "lucide-react";
import type { ReactNode } from "react";
import { ComingSoonBadges } from "@/components/ComingSoonBadges";

export function HeroSection() {
  return (
    <section className="relative">
      <div className="container-x pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-5">
              Coming soon · Made in India
            </p>
            <h1 className="font-serif italic text-4xl sm:text-5xl md:text-6xl text-teal-900 leading-[1.05] tracking-tightish text-balance">
              Coordinate subscription access clearly.
            </h1>
            <p className="mt-6 text-lg leading-8 text-ink-muted max-w-xl">
              Bantle helps people in India coordinate household and
              family-plan arrangements directly with people they already
              trust. Users confirm provider rules, access and payments
              outside Bantle.
            </p>
            <div className="mt-6 grid gap-3 text-sm text-ink-muted sm:grid-cols-2 max-w-xl">
              <SafetyPill>Follow provider rules</SafetyPill>
              <SafetyPill>Payments stay outside Bantle</SafetyPill>
            </div>
            <div className="mt-8">
              <ComingSoonBadges />
              <p className="mt-4 text-sm text-ink-muted">
                Launching first on Android, with iOS to follow.
              </p>
            </div>
          </div>
          <div className="relative">
            <AppVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

function SafetyPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-button border border-teal-200 bg-teal-50 px-3 py-2 text-teal-800">
      <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
      {children}
    </span>
  );
}

function AppVisual() {
  return (
    <div className="relative mx-auto max-w-[640px]">
      <div className="relative grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_0.82fr] sm:gap-6">
        <PhoneShell label="Generic Bantle app preview" className="z-10">
          <GenericHomePreview />
        </PhoneShell>
        <PhoneShell
          label="Actual Bantle settings screen"
          className="-ml-8 hidden sm:block scale-90 opacity-95"
        >
          <Image
            src="/brand/bantle-settings-screen.png"
            alt="Bantle mobile settings screen"
            width={1216}
            height={1880}
            className="h-full w-full object-cover"
            sizes="(min-width: 1024px) 250px, 42vw"
          />
        </PhoneShell>
      </div>
    </div>
  );
}

function PhoneShell({
  children,
  label,
  className = "",
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative mx-auto aspect-[9/19] max-w-[310px] overflow-hidden rounded-[36px] border border-line bg-cream-card shadow-[0_24px_80px_rgba(0,60,52,0.16)] ${className}`}
    >
      {children}
    </div>
  );
}

function GenericHomePreview() {
  return (
    <div className="flex h-full w-full flex-col bg-cream">
      <div className="px-5 pt-8 pb-3">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-teal-800">Bantle</p>
          <Bell className="h-5 w-5 text-ink" strokeWidth={1.8} />
        </div>
        <div className="mt-5 rounded-[18px] border border-line bg-white px-4 py-3 text-[13px] text-ink-muted">
          Search household plans
        </div>
      </div>
      <div className="mx-5 rounded-[18px] border border-teal-200 bg-teal-50 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-teal-800 text-cream">
            <ShieldCheck className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-teal-900">
              Safe. Simple. Transparent.
            </p>
            <p className="mt-1 text-[11px] leading-4 text-teal-700">
              Coordinate directly. Follow provider rules.
            </p>
          </div>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="mb-3 text-[13px] font-semibold text-ink">
          Example plan cards
        </p>
        <div className="flex flex-col gap-3">
          <MockListing
            icon={<Tv className="h-4 w-4" />}
            title="Household streaming plan"
            detail="Family-plan rules noted"
          />
          <MockListing
            icon={<Music className="h-4 w-4" />}
            title="Family music plan"
            detail="Access confirmed in chat"
          />
          <MockListing
            icon={<Cloud className="h-4 w-4" />}
            title="Cloud storage plan"
            detail="Provider terms reviewed"
          />
          <MockListing
            icon={<GraduationCap className="h-4 w-4" />}
            title="Learning plan"
            detail="Direct coordination only"
          />
        </div>
      </div>
      <div className="mt-auto border-t border-line px-4 py-3 flex items-center justify-between">
        <MockNavItem icon={<Home className="h-4 w-4" />} label="Home" active />
        <MockNavItem icon={<Tag className="h-4 w-4" />} label="Deals" />
        <span
          aria-hidden="true"
          className="h-8 w-8 rounded-full bg-teal-800 text-cream flex items-center justify-center"
        >
          <Plus className="h-4 w-4" />
        </span>
        <MockNavItem icon={<MessageCircle className="h-4 w-4" />} label="Chat" />
        <MockNavItem icon={<User className="h-4 w-4" />} label="Profile" />
      </div>
    </div>
  );
}

function MockNavItem({
  icon,
  label,
  active = false,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <span
      className={`flex flex-col items-center gap-1 ${
        active ? "text-teal-900" : "text-ink-muted"
      }`}
    >
      {icon}
      <span className="text-[10px]">{label}</span>
    </span>
  );
}

function MockListing({
  icon,
  title,
  detail,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-cream-card border border-line rounded-card p-3">
      <span
        aria-hidden="true"
        className="h-9 w-9 rounded-[12px] flex items-center justify-center bg-teal-50 text-teal-800"
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-ink truncate">{title}</p>
        <p className="text-[11px] text-ink-muted">{detail}</p>
      </div>
    </div>
  );
}
