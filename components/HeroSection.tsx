import type { ReactNode } from "react";
import {
  Bell,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Home,
  Menu,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { ComingSoonBadges } from "@/components/ComingSoonBadges";
import { BrandMark } from "@/components/BrandMark";

const listings = [
  {
    initials: "HS",
    title: "Household streaming plan",
    meta: "Monthly sharing · Rules noted",
    slots: "2 slots open",
    tone: "bg-teal-900 text-cream",
  },
  {
    initials: "FM",
    title: "Family music plan",
    meta: "Family-plan access · Chat first",
    slots: "1 slot open",
    tone: "bg-teal-100 text-teal-900",
  },
  {
    initials: "CS",
    title: "Cloud storage plan",
    meta: "Shared household plan",
    slots: "Access confirmed directly",
    tone: "bg-[#EAF6FF] text-[#0C447C]",
  },
];

const detailRows = [
  ["Plan type", "Family-plan access"],
  ["Access notes", "Confirm in chat"],
  ["Provider rules", "Review first"],
  ["Payment", "Outside Bantle"],
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-cream">
      <div className="container-x pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <div>
            <p className="mb-5 text-xs uppercase tracking-[0.14em] text-teal-600">
              Coming soon · Made in India
            </p>
            <h1 className="max-w-3xl text-balance font-serif text-4xl italic leading-[1.05] text-teal-900 tracking-tightish sm:text-5xl md:text-6xl">
              Coordinate household subscription access clearly.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink-muted">
              Bantle helps people in India coordinate household and
              family-plan arrangements with people they already trust. Users
              confirm provider rules, access, and payments directly outside
              Bantle.
            </p>
            <div className="mt-6 grid max-w-2xl gap-3 text-sm text-ink-muted sm:grid-cols-3">
              <SafetyPill>Follow provider rules</SafetyPill>
              <SafetyPill>Payments stay outside Bantle</SafetyPill>
              <SafetyPill>Clear coordination records</SafetyPill>
            </div>
            <div className="mt-8">
              <ComingSoonBadges />
              <p className="mt-4 text-sm text-ink-muted">
                Launching first on Android, with iOS to follow.
              </p>
            </div>
          </div>
          <AppVisual />
        </div>
      </div>
    </section>
  );
}

function SafetyPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-11 items-center gap-2 rounded-button border border-teal-200 bg-teal-50 px-3 py-2 text-teal-800">
      <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.8} />
      <span className="leading-snug">{children}</span>
    </span>
  );
}

function AppVisual() {
  return (
    <div
      className="mx-auto w-full max-w-[680px]"
      role="img"
      aria-label="Generic Bantle app preview with household plan listings and coordination details"
    >
      <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.72fr)]">
        <PhoneFrame>
          <MobileHomePreview />
        </PhoneFrame>
        <div className="grid gap-4">
          <DetailPanel />
          <SafetyPanel />
        </div>
      </div>
    </div>
  );
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[360px] rounded-[38px] border border-line bg-white p-3 shadow-[0_28px_90px_rgba(0,60,52,0.16)]">
      <div className="overflow-hidden rounded-[30px] border border-line bg-cream">
        {children}
      </div>
    </div>
  );
}

function MobileHomePreview() {
  return (
    <div className="flex min-h-[650px] flex-col bg-cream">
      <div className="flex items-center justify-between px-5 pt-5 text-ink">
        <span className="text-sm font-semibold">9:41</span>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm bg-ink" />
          <span className="h-2.5 w-4 rounded-sm border border-ink" />
        </div>
      </div>
      <div className="flex items-center justify-between px-5 pt-6">
        <div className="flex items-center gap-3">
          <Menu className="h-6 w-6 text-ink" strokeWidth={1.8} />
          <BrandMark size="sm" />
        </div>
        <Bell className="h-6 w-6 text-ink" strokeWidth={1.8} />
      </div>
      <div className="px-5 pt-7">
        <div className="flex h-12 items-center gap-3 rounded-[18px] border border-line bg-white px-4 text-ink-muted">
          <Search className="h-5 w-5 shrink-0" strokeWidth={1.8} />
          <span className="text-sm">Search household plans</span>
        </div>
      </div>
      <div className="flex gap-2 overflow-hidden px-5 pt-5">
        {["All", "Streaming", "Music", "Cloud"].map((label, index) => (
          <span
            key={label}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium ${
              index === 0
                ? "border-teal-600 bg-teal-600 text-white"
                : "border-line bg-white text-ink-muted"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between rounded-[20px] border border-teal-100 bg-teal-50 px-4 py-4">
          <div>
            <p className="text-base font-semibold text-ink">
              Safe. Simple. Transparent.
            </p>
            <p className="mt-1 text-xs leading-5 text-teal-800">
              Payments are made outside Bantle.
            </p>
          </div>
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-teal-700 text-white">
            <ShieldCheck className="h-6 w-6" strokeWidth={1.9} />
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between px-5 pt-6">
        <p className="font-sans text-lg font-semibold text-ink">
          Popular listings
        </p>
        <span className="text-sm font-medium text-teal-600">See all</span>
      </div>
      <div className="grid gap-0 px-5 pt-3">
        {listings.map((listing, index) => (
          <PreviewListing key={listing.title} listing={listing} index={index} />
        ))}
      </div>
      <div className="mt-auto border-t border-line bg-white px-5 py-4">
        <div className="grid grid-cols-5 items-end gap-2 text-[10px] font-medium text-ink-muted">
          <NavItem active icon={<Home className="h-5 w-5" />} label="Home" />
          <NavItem icon={<ShieldCheck className="h-5 w-5" />} label="Deals" />
          <NavItem raised icon={<Plus className="h-5 w-5" />} label="Post" />
          <NavItem
            icon={<MessageCircle className="h-5 w-5" />}
            label="Chats"
          />
          <NavItem icon={<UserCircle className="h-5 w-5" />} label="Profile" />
        </div>
      </div>
    </div>
  );
}

function PreviewListing({
  listing,
  index,
}: {
  listing: (typeof listings)[number];
  index: number;
}) {
  return (
    <div
      className={`flex items-center gap-4 border border-line bg-white p-3.5 ${
        index === 0 ? "rounded-t-[20px]" : "-mt-px"
      } ${index === listings.length - 1 ? "rounded-b-[20px]" : ""}`}
    >
      <span
        className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] text-base font-semibold ${listing.tone}`}
      >
        {listing.initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">
          {listing.title}
        </p>
        <p className="mt-1 truncate text-xs text-ink-muted">{listing.meta}</p>
        <p className="mt-1 text-xs font-medium text-teal-700">
          {listing.slots}
        </p>
      </div>
      <Bookmark className="h-5 w-5 shrink-0 text-ink-muted" strokeWidth={1.7} />
    </div>
  );
}

function NavItem({
  active = false,
  raised = false,
  icon,
  label,
}: {
  active?: boolean;
  raised?: boolean;
  icon: ReactNode;
  label: string;
}) {
  return (
    <span
      className={`flex min-w-0 flex-col items-center gap-1 ${
        active ? "text-teal-700" : "text-ink-muted"
      }`}
    >
      <span
        className={
          raised
            ? "inline-flex h-11 w-11 -translate-y-2 items-center justify-center rounded-full bg-teal-700 text-white shadow-[0_12px_26px_rgba(0,60,52,0.20)]"
            : "inline-flex h-6 w-6 items-center justify-center"
        }
      >
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </span>
  );
}

function DetailPanel() {
  return (
    <section className="rounded-[28px] border border-line bg-white p-5 shadow-[0_18px_54px_rgba(0,60,52,0.10)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-teal-600">
            Listing details
          </p>
          <p className="mt-2 font-sans text-lg font-semibold text-ink">
            Family plan access
          </p>
        </div>
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-teal-50 text-teal-800">
          <CheckCircle2 className="h-5 w-5" strokeWidth={1.9} />
        </span>
      </div>
      <div className="mt-5 grid gap-2">
        {detailRows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 rounded-[16px] border border-line bg-cream px-3.5 py-3"
          >
            <span className="text-xs text-ink-muted">{label}</span>
            <span className="text-right text-xs font-semibold text-ink">
              {value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SafetyPanel() {
  return (
    <section className="rounded-[28px] border border-teal-100 bg-teal-900 p-5 text-cream shadow-[0_18px_54px_rgba(0,60,52,0.14)]">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-cream/12 text-cream">
          <ShieldCheck className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <div>
          <p className="font-sans text-base font-semibold">
            Coordination only
          </p>
          <p className="mt-2 text-sm leading-6 text-cream/78">
            Bantle keeps terms, chat, and updates in one place. Users handle
            access and payments directly outside the app.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-2">
        {["Provider rules first", "No payment processing", "No access promise"].map(
          (item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-[16px] bg-cream/10 px-3 py-2.5 text-sm"
            >
              <span>{item}</span>
              <ChevronRight className="h-4 w-4" strokeWidth={1.7} />
            </div>
          )
        )}
      </div>
    </section>
  );
}
