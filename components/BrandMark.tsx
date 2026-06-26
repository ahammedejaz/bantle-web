interface BrandMarkProps {
  /** Use on dark backgrounds (e.g. the footer): renders the transparent mint
   *  mark + cream wordmark. Otherwise renders the dark app-icon chip + dark
   *  wordmark for light backgrounds (e.g. the header). */
  light?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: {
    mark: "h-7 w-7",
    radius: "rounded-[8px]",
    text: "text-[18px]",
    gap: "gap-2",
  },
  md: {
    mark: "h-8 w-8",
    radius: "rounded-[9px]",
    text: "text-[21px]",
    gap: "gap-2.5",
  },
  lg: {
    mark: "h-10 w-10",
    radius: "rounded-[11px]",
    text: "text-[26px]",
    gap: "gap-3",
  },
};

// Marketing-only brand lockup (header, mobile nav, footer). The admin panel
// uses its own text branding and does not import this component, so updating
// it here does not affect admin.
export function BrandMark({ light = false, size = "md" }: BrandMarkProps) {
  const classes = sizeClasses[size];

  return (
    <span className={`inline-flex items-center ${classes.gap}`}>
      {light ? (
        // Transparent mint mark — reads cleanly on the dark teal footer.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/brand/bantle-mark.png"
          alt=""
          width={40}
          height={40}
          className={`${classes.mark} shrink-0 object-contain`}
        />
      ) : (
        // Dark app-icon chip — recognizable Bantle icon on the light header.
        <span
          className={`${classes.mark} ${classes.radius} inline-flex shrink-0 items-center justify-center overflow-hidden shadow-[0_8px_22px_rgba(0,60,52,0.22)] ring-1 ring-teal-900/10`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/bantle-icon.png"
            alt=""
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        </span>
      )}
      <span
        className={`${classes.text} font-semibold leading-none ${
          light ? "text-cream" : "text-teal-900"
        }`}
      >
        Bantle
      </span>
    </span>
  );
}
