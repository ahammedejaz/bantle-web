import { cn } from "@/lib/utils";

// Live store links. The app is published on both stores (Android package
// in.bantle.app, iOS app id 6777968886).
const STORE_URLS = {
  play: "https://play.google.com/store/apps/details?id=in.bantle.app",
  ios: "https://apps.apple.com/in/app/id6777968886",
} as const;

type Size = "sm" | "md" | "lg";

interface StoreBadgesProps {
  className?: string;
  size?: Size;
  align?: "start" | "center";
}

export function StoreBadges({
  className,
  size = "md",
  align = "start",
}: StoreBadgesProps) {
  return (
    <div
      className={cn(
        // Stacked on small screens, but hugging their content rather than
        // stretching, so they still read as store badges and not as two
        // generic full-width buttons.
        "flex flex-col items-start gap-3 sm:flex-row sm:items-stretch",
        align === "center" && "items-center sm:justify-center",
        className
      )}
    >
      <StoreBadge store="play" size={size} />
      <StoreBadge store="ios" size={size} />
    </div>
  );
}

const sizeClasses: Record<Size, string> = {
  sm: "h-[50px] min-w-[164px] gap-2.5 px-4",
  md: "h-[58px] min-w-[194px] gap-3 px-5",
  lg: "h-[64px] min-w-[216px] gap-3.5 px-6",
};

function StoreBadge({ store, size }: { store: "play" | "ios"; size: Size }) {
  const isPlay = store === "play";
  const label = isPlay
    ? "Get Bantle on Google Play"
    : "Download Bantle on the App Store";

  return (
    <a
      href={STORE_URLS[store]}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={cn(
        // No `press` here: that class writes a raw `transform`, which would
        // clobber the composed hover/active transform below.
        "group relative inline-flex select-none items-center justify-center overflow-hidden rounded-[13px]",
        // These are the brightest objects on a near-black page, which is
        // correct: they are the thing to click. What made them read as stock
        // assets was the finish, not the brightness. A real fill has a
        // gradient and an inner top highlight, the same light model as every
        // raised surface on the page, so they belong to it.
        "bg-gradient-to-b from-white to-[#DFE7E3] text-[#050807]",
        "shadow-[inset_0_1px_0_rgb(255_255_255_/_0.9),0_1px_2px_rgb(0_0_0_/_0.5),0_16px_32px_-18px_rgb(0_0_0_/_0.9)]",
        "ring-1 ring-inset ring-black/[0.08]",
        "transition-[transform,box-shadow] duration-200 ease-out",
        "hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgb(255_255_255_/_0.9),0_2px_4px_rgb(0_0_0_/_0.5),0_22px_44px_-18px_rgb(0_0_0_/_0.9),0_0_0_1px_rgb(95_227_168_/_0.5),0_10px_34px_-10px_rgb(95_227_168_/_0.45)]",
        "active:translate-y-0 active:scale-[0.985]",
        sizeClasses[size]
      )}
    >
      <span className="relative shrink-0">
        {isPlay ? <PlayGlyph /> : <AppleGlyph />}
      </span>
      <span className="relative flex flex-col items-start text-left leading-none">
        <span className="text-[10px] font-medium uppercase tracking-[0.09em] text-[#050807]/60">
          {isPlay ? "Get it on" : "Download on the"}
        </span>
        <span
          className={cn(
            "mt-[5px] font-display font-semibold tracking-tight",
            size === "lg" && "text-[19px]",
            size === "md" && "text-[17.5px]",
            size === "sm" && "text-[15.5px]"
          )}
        >
          {isPlay ? "Google Play" : "App Store"}
        </span>
      </span>
    </a>
  );
}

// Google Play mark, drawn as its four-segment silhouette in a single colour so
// it reads as a matched pair with the Apple mark beside it.
function PlayGlyph() {
  return (
    <svg
      viewBox="0 0 512 512"
      width="22"
      height="22"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      <path d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z" />
      <path d="M325.3 234.3 104.6 13l280.8 161.2-60.1 60.1z" />
      <path d="m472.2 225.6-88.6-51.1-65.2 65.1 65.2 65.1 90.4-51.1c27.1-21.1 27.1-56.4-1.8-77.9z" />
      <path d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="23"
      height="23"
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      className="-mt-0.5"
    >
      <path d="M17.05 12.54c-.03-2.86 2.33-4.23 2.44-4.3-1.33-1.95-3.4-2.22-4.13-2.25-1.76-.18-3.43 1.03-4.32 1.03-.89 0-2.26-1.01-3.72-.98-1.91.03-3.67 1.11-4.65 2.82-1.98 3.44-.51 8.53 1.42 11.32.94 1.36 2.06 2.89 3.53 2.83 1.42-.06 1.95-.92 3.66-.92s2.19.92 3.69.89c1.52-.03 2.49-1.39 3.42-2.75 1.08-1.58 1.52-3.11 1.55-3.19-.03-.02-2.97-1.14-3-4.5zM14.36 4.2c.78-.95 1.31-2.27 1.17-3.58-1.13.05-2.5.75-3.31 1.7-.72.84-1.35 2.18-1.18 3.47 1.26.1 2.54-.64 3.32-1.59z" />
    </svg>
  );
}
