interface BrandMarkProps {
  /** Use on dark backgrounds (e.g. the footer): renders the cream wordmark.
   *  Otherwise renders the dark-teal wordmark for light backgrounds. The mint
   *  mark reads cleanly on both, so the same logo image is used either way. */
  light?: boolean;
  size?: "sm" | "md" | "lg";
}

// The mark is a tightly-cropped (zero-padding) glyph at 148x197, so a small
// gap reads as one wordmark unit.
const sizeClasses = {
  sm: { mark: "h-7 w-auto", text: "text-[20px]", gap: "gap-1.5" },
  md: { mark: "h-9 w-auto", text: "text-[23px]", gap: "gap-1.5" },
  lg: { mark: "h-11 w-auto", text: "text-[29px]", gap: "gap-2" },
};

// Marketing-only brand lockup (header, mobile nav, footer). The admin panel
// uses its own text branding and does not import this component, so changes
// here do not affect admin. Clean transparent mint mark with no chip; the
// "Bantle" wordmark uses a semibold, tight treatment beside the mark.
export function BrandMark({ light = false, size = "md" }: BrandMarkProps) {
  const classes = sizeClasses[size];

  return (
    <span className={`inline-flex items-center ${classes.gap}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/bantle-mark.png"
        alt=""
        width={148}
        height={197}
        className={`${classes.mark} shrink-0 object-contain`}
      />
      <span
        className={`${classes.text} font-semibold leading-none tracking-[-0.02em] ${
          light ? "text-cream" : "text-teal-900"
        }`}
      >
        Bantle
      </span>
    </span>
  );
}
