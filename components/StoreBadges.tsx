import { cn } from "@/lib/utils";

// Live store links. The app is published on both stores (Android package
// in.bantle.app, iOS app id 6777968886), so these badges are real anchors —
// the earlier disabled "coming soon" buttons are retired.
const STORE_URLS = {
  play: "https://play.google.com/store/apps/details?id=in.bantle.app",
  ios: "https://apps.apple.com/in/app/id6777968886",
} as const;

interface StoreBadgesProps {
  className?: string;
  variant?: "default" | "compact";
  align?: "start" | "center";
}

export function StoreBadges({
  className,
  variant = "default",
  align = "start",
}: StoreBadgesProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-3",
        align === "center" && "items-center sm:justify-center",
        className
      )}
    >
      <StoreBadge store="play" variant={variant} />
      <StoreBadge store="ios" variant={variant} />
    </div>
  );
}

function StoreBadge({
  store,
  variant,
}: {
  store: "play" | "ios";
  variant: "default" | "compact";
}) {
  const isCompact = variant === "compact";
  const wrapperBase =
    "inline-flex items-center gap-3 rounded-button border border-line bg-[#1A1A1A] text-cream select-none transition-opacity hover:opacity-90";
  const dimensions = isCompact
    ? "h-12 px-4 min-w-[170px]"
    : "h-[58px] px-5 min-w-[200px]";

  return (
    <a
      href={STORE_URLS[store]}
      target="_blank"
      rel="noopener noreferrer"
      title={`${
        store === "play" ? "Get Bantle on Google Play" : "Download Bantle on the App Store"
      }`}
      className={cn(wrapperBase, dimensions)}
    >
      <span className="shrink-0">
        {store === "play" ? <PlayGlyph /> : <IosGlyph />}
      </span>
      <span className="flex flex-col items-start leading-tight text-left">
        <span className="text-[10px] uppercase tracking-[0.14em] text-cream/70">
          {store === "play" ? "Get it on" : "Download on the"}
        </span>
        <span className="font-medium text-[15px]">
          {store === "play" ? "Google Play" : "App Store"}
        </span>
      </span>
    </a>
  );
}

function PlayGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      className="text-cream"
    >
      <path
        fill="currentColor"
        d="M3.6 2.5a1 1 0 0 1 1.05.05l13.3 8.6a1 1 0 0 1 0 1.7l-13.3 8.6a1 1 0 0 1-1.55-.84V3.34A1 1 0 0 1 3.6 2.5Zm10.4 9.5L5.5 5.7v12.6L14 12Zm1.7 1.1 3.5 2.3-3.5-2.3Z"
      />
    </svg>
  );
}

function IosGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      className="text-cream"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 2.8h8a2 2 0 0 1 2 2v14.4a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4.8a2 2 0 0 1 2-2Zm3.2 15.5h3.6"
      />
    </svg>
  );
}
