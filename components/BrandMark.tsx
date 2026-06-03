interface BrandMarkProps {
  light?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export function BrandMark({ light = false, size = "md" }: BrandMarkProps) {
  return (
    <span
      className={`${sizeClasses[size]} font-semibold leading-none ${
        light ? "text-cream" : "text-teal-900"
      }`}
    >
      Bantle
    </span>
  );
}
