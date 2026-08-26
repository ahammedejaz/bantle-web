import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Inline "read more" affordance. The arrow travels on hover, the label does not. */
export function ArrowLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 text-[15px] font-medium text-accent transition-colors duration-150 hover:text-accent-strong",
        className
      )}
    >
      <span className="border-b border-accent/30 pb-0.5 transition-colors group-hover:border-accent-strong">
        {children}
      </span>
      <ArrowRight
        className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
        strokeWidth={1.9}
      />
    </Link>
  );
}
