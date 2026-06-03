import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { ComingSoonBadges } from "@/components/ComingSoonBadges";

const previewCards = [
  {
    src: "/images/app-screens/home-overview.png",
    alt: "Bantle mobile home screen showing search, categories, and a safety notice",
    width: 760,
    height: 527,
  },
  {
    src: "/images/app-screens/deals-overview.png",
    alt: "Bantle mobile deals screen showing status tabs and an outside-payment reminder",
    width: 760,
    height: 376,
  },
  {
    src: "/images/app-screens/listing-details.png",
    alt: "Bantle mobile listing details fields for plan, duration, price, and slots",
    width: 760,
    height: 487,
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="container-x pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-teal-600 mb-5">
              Coming soon · Made in India
            </p>
            <h1 className="font-serif italic text-4xl sm:text-5xl md:text-6xl text-teal-900 leading-[1.05] tracking-tightish text-balance">
              Coordinate household subscription access clearly.
            </h1>
            <p className="mt-6 text-lg leading-8 text-ink-muted max-w-xl">
              Bantle helps people in India coordinate household and
              family-plan arrangements with people they already trust. Users
              confirm provider rules, access, and any payments directly
              outside Bantle.
            </p>
            <div className="mt-6 grid gap-3 text-sm text-ink-muted sm:grid-cols-3 max-w-2xl">
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
      <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.8} />
      {children}
    </span>
  );
}

function AppVisual() {
  return (
    <div className="relative mx-auto max-w-[650px]">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(230px,0.76fr)] sm:items-center">
        <div className="grid gap-4">
          {previewCards.map((screen) => (
            <ScreenshotCard key={screen.src} {...screen} />
          ))}
        </div>
        <figure className="mx-auto w-full max-w-[300px] overflow-hidden rounded-[34px] border border-line bg-white shadow-[0_24px_80px_rgba(0,60,52,0.16)]">
          <Image
            src="/images/app-screens/settings.png"
            alt="Bantle mobile settings screen showing account, notification, and support options"
            width={491}
            height={760}
            className="h-full w-full object-cover"
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 36vw, 72vw"
            priority
          />
        </figure>
      </div>
    </div>
  );
}

function ScreenshotCard({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  return (
    <figure className="overflow-hidden rounded-[24px] border border-line bg-white shadow-[0_18px_54px_rgba(0,60,52,0.12)]">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="h-auto w-full"
        sizes="(min-width: 1024px) 300px, (min-width: 640px) 44vw, 90vw"
      />
    </figure>
  );
}
