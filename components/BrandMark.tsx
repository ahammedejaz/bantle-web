import Image from "next/image";

interface BrandMarkProps {
  light?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: {
    mark: "h-8 w-8 rounded-[10px]",
    text: "text-sm",
  },
  md: {
    mark: "h-9 w-9 rounded-[12px]",
    text: "text-base",
  },
  lg: {
    mark: "h-11 w-11 rounded-[14px]",
    text: "text-lg",
  },
};

export function BrandMark({ light = false, size = "md" }: BrandMarkProps) {
  const classes = sizeClasses[size];

  return (
    <span className="inline-flex items-center gap-3">
      <span className={`${classes.mark} relative overflow-hidden shrink-0`}>
        <Image
          src="/brand/bantle-app-icon.png"
          alt=""
          fill
          sizes="44px"
          className="object-cover"
          priority={size === "md"}
        />
      </span>
      <span
        className={`${classes.text} font-semibold ${
          light ? "text-cream" : "text-teal-800"
        }`}
      >
        BANTLE
      </span>
    </span>
  );
}
