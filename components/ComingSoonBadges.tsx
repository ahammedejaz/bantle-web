import { cn } from "@/lib/utils";

interface ComingSoonBadgesProps {
  className?: string;
  variant?: "default" | "compact";
  align?: "start" | "center";
}

export function ComingSoonBadges({
  className,
  variant = "default",
  align = "start",
}: ComingSoonBadgesProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-3",
        align === "center" && "items-center sm:justify-center",
        className
      )}
    >
      <StoreBadge store="play" variant={variant} />
      <StoreBadge store="apple" variant={variant} />
    </div>
  );
}

function StoreBadge({
  store,
  variant,
}: {
  store: "play" | "apple";
  variant: "default" | "compact";
}) {
  const isCompact = variant === "compact";
  const wrapperBase =
    "inline-flex items-center gap-3 rounded-button border border-line bg-[#1A1A1A]/85 text-cream cursor-not-allowed select-none transition-opacity hover:opacity-95";
  const dimensions = isCompact
    ? "h-12 px-4 min-w-[170px]"
    : "h-[58px] px-5 min-w-[200px]";

  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      title={`${store === "play" ? "Google Play" : "App Store"} listing coming soon`}
      className={cn(wrapperBase, dimensions, "opacity-80")}
    >
      <span className="shrink-0">
        {store === "play" ? <PlayGlyph /> : <AppleGlyph />}
      </span>
      <span className="flex flex-col items-start leading-tight text-left">
        <span className="text-[10px] uppercase tracking-[0.14em] text-cream/70">
          Coming soon to
        </span>
        <span className="font-medium text-[15px]">
          {store === "play" ? "Google Play" : "App Store"}
        </span>
      </span>
    </button>
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

function AppleGlyph() {
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
        d="M16.4 12.2c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-2-3.7-2-1.6-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.4 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.5 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.3.8 1.4 0 2.3-1.2 3.1-2.5.7-.9 1.2-2 1.6-3.1-2-.8-3-2.7-2.9-3.9ZM14.1 4.3c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1 0 2.2-.6 2.8-1.4Z"
      />
    </svg>
  );
}
