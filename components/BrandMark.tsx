import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  /** Use on the deep-green bands (header, footer, CTA): renders the light
   *  wordmark. Otherwise renders the dark wordmark for light surfaces. The
   *  mint mark reads cleanly on both, so the same image is used either way. */
  tone?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  /** Set on the sticky header only: that instance is always above the fold. */
  priority?: boolean;
  className?: string;
}

// The mark is a tightly-cropped (zero-padding) glyph at 148x197, so a small
// optical gap reads as one wordmark unit.
const sizeClasses = {
  sm: { mark: "h-6", text: "text-[19px]", gap: "gap-1.5" },
  md: { mark: "h-7", text: "text-[22px]", gap: "gap-2" },
  lg: { mark: "h-8", text: "text-[26px]", gap: "gap-2.5" },
};

// Marketing-only brand lockup (header, mobile nav, footer). The admin panel
// uses its own text branding and does not import this component.
export function BrandMark({
  tone = "dark",
  size = "md",
  priority = false,
  className,
}: BrandMarkProps) {
  const classes = sizeClasses[size];

  return (
    <span className={cn("inline-flex items-center", classes.gap, className)}>
      <Image
        src="/brand/bantle-mark.png"
        alt=""
        width={148}
        height={197}
        priority={priority}
        className={cn("w-auto shrink-0 object-contain", classes.mark)}
      />
      <span
        className={cn(
          "font-display font-semibold leading-none tracking-display",
          classes.text,
          tone === "light" ? "text-canvas-fg" : "text-heading"
        )}
      >
        Bantle
      </span>
    </span>
  );
}
