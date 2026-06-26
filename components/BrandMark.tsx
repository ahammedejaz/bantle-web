interface BrandMarkProps {
  /** Use on dark backgrounds (e.g. the footer): renders the cream wordmark.
   *  Otherwise renders the dark-teal wordmark for light backgrounds. The mint
   *  mark reads cleanly on both, so the same logo image is used either way. */
  light?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: { mark: "h-7 w-7", text: "text-[18px]", gap: "gap-2" },
  md: { mark: "h-8 w-8", text: "text-[20px]", gap: "gap-2.5" },
  lg: { mark: "h-10 w-10", text: "text-[25px]", gap: "gap-3" },
};

// Marketing-only brand lockup (header, mobile nav, footer). The admin panel
// uses its own text branding and does not import this component, so changes
// here do not affect admin. The logo is the clean transparent mint mark with
// no chip/background; the "Bantle" wordmark uses a lighter, tighter treatment
// to match the mobile app's visual tone.
export function BrandMark({ light = false, size = "md" }: BrandMarkProps) {
  const classes = sizeClasses[size];

  return (
    <span className={`inline-flex items-center ${classes.gap}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/bantle-mark.png"
        alt=""
        width={40}
        height={40}
        className={`${classes.mark} shrink-0 object-contain`}
      />
      <span
        className={`${classes.text} font-medium leading-none tracking-[-0.01em] ${
          light ? "text-cream" : "text-teal-900"
        }`}
      >
        Bantle
      </span>
    </span>
  );
}
