interface BrandMarkProps {
  light?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: {
    mark: "h-7 w-7 rounded-[8px] text-[15px]",
    text: "text-[18px]",
    gap: "gap-2",
  },
  md: {
    mark: "h-8 w-8 rounded-[9px] text-[17px]",
    text: "text-[21px]",
    gap: "gap-2.5",
  },
  lg: {
    mark: "h-10 w-10 rounded-[11px] text-[21px]",
    text: "text-[26px]",
    gap: "gap-3",
  },
};

export function BrandMark({ light = false, size = "md" }: BrandMarkProps) {
  const classes = sizeClasses[size];

  return (
    <span className={`inline-flex items-center ${classes.gap}`}>
      <span
        aria-hidden="true"
        className={`${classes.mark} inline-flex shrink-0 items-center justify-center font-semibold leading-none ${
          light
            ? "bg-cream text-teal-900"
            : "bg-teal-900 text-cream shadow-[0_10px_26px_rgba(0,60,52,0.18)]"
        }`}
      >
        B
      </span>
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
