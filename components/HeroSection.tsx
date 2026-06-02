import { Home, MessageCircle, Plus, Tag, User } from "lucide-react";
import type { ReactNode } from "react";
import { ComingSoonBadges } from "@/components/ComingSoonBadges";

export function HeroSection() {
  return (
    <section className="relative">
      <div className="container-x pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid gap-12 md:gap-16 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-5">
              Coming soon · Made in India
            </p>
            <h1 className="font-serif italic text-4xl sm:text-5xl md:text-6xl text-teal-900 leading-[1.05] tracking-tightish text-balance">
              Coordinate subscription sharing and access.
            </h1>
            <p className="mt-6 text-lg leading-8 text-ink-muted max-w-xl">
              Bantle helps people in India coordinate monthly sharing and
              one-time access for subscriptions directly with each other.
              Payment happens outside Bantle; access details are confirmed
              in chat.
            </p>
            <div className="mt-8">
              <ComingSoonBadges />
              <p className="mt-4 text-sm text-ink-muted">
                Launching first on Android, with iOS to follow.
              </p>
            </div>
          </div>
          <div className="relative">
            <AppPreviewMock />
          </div>
        </div>
      </div>
    </section>
  );
}

function AppPreviewMock() {
  return (
    <div
      role="img"
      aria-label="Preview of the Bantle mobile app — placeholder until app screenshots are added"
      className="mx-auto md:ml-auto md:mr-0 max-w-[320px] aspect-[9/19] rounded-[36px] border border-line bg-cream-card overflow-hidden"
    >
      <div className="h-full w-full flex flex-col bg-cream">
        <div className="bg-teal-900 px-5 pt-12 pb-6 text-cream">
          <p className="text-[10px] uppercase tracking-[0.18em] text-teal-200">
            You&apos;ve saved this year
          </p>
          <p className="font-serif text-4xl mt-2 tracking-tightish">
            ₹2,420
          </p>
          <p className="text-xs mt-1 text-teal-200">+12% vs last year</p>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <MockListing
            platform="Spotify"
            colour="#1ED760"
            detail="2 slots open"
            price="₹40/mo"
          />
          <MockListing
            platform="YouTube Premium"
            colour="#FF0000"
            detail="6 months access"
            price="₹500 one-time"
          />
          <MockListing
            platform="Apple One"
            colour="#000000"
            detail="1 slot open"
            price="₹125/mo"
          />
        </div>
        <div className="mt-auto border-t border-line px-4 py-3 flex items-center justify-between">
          <MockNavItem icon={<Home className="h-4 w-4" />} label="Home" active />
          <MockNavItem icon={<Tag className="h-4 w-4" />} label="Deals" />
          <span
            aria-hidden="true"
            className="h-8 w-8 rounded-full bg-teal-900 text-cream flex items-center justify-center"
          >
            <Plus className="h-4 w-4" />
          </span>
          <MockNavItem icon={<MessageCircle className="h-4 w-4" />} label="Chat" />
          <MockNavItem icon={<User className="h-4 w-4" />} label="Profile" />
        </div>
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
  platform,
  colour,
  detail,
  price,
}: {
  platform: string;
  colour: string;
  detail: string;
  price: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-cream-card border border-line rounded-card p-3">
      <span
        aria-hidden="true"
        className="h-9 w-9 rounded-[10px] flex items-center justify-center text-cream text-sm font-medium"
        style={{ backgroundColor: colour }}
      >
        {platform[0]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-ink truncate">{platform}</p>
        <p className="text-[11px] text-ink-muted">{detail}</p>
      </div>
      <p className="text-[13px] font-medium text-teal-900 text-right">
        {price}
      </p>
    </div>
  );
}
