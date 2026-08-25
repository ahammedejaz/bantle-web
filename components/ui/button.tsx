import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-button font-medium",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out",
    "disabled:pointer-events-none disabled:opacity-60",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600",
    // Press feedback: the interface acknowledges the touch before anything else
    // happens. Excluded for disabled and non-interactive variants.
    "active:scale-[0.975]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-teal-900 text-cream hover:bg-teal-800",
        secondary:
          "bg-cream-card text-ink border border-line hover:border-teal-900",
        ghost: "text-teal-900 hover:bg-cream-card",
        muted:
          "bg-[#E5E0D5]/60 text-ink/60 border border-line cursor-not-allowed active:scale-100",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-[15px]",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
