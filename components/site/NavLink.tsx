"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Desktop primary-nav link. The only reason this is a Client Component is the
// current-page state; the rest of the header stays on the server.
export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group relative inline-flex h-9 items-center rounded-full px-3 text-[14.5px] font-medium",
        "transition-colors duration-150 ease-out",
        isActive
          ? "text-canvas-fg"
          : "text-canvas-fg-muted hover:text-canvas-fg"
      )}
    >
      {children}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-3 bottom-1 h-px origin-left bg-mint",
          "transition-transform duration-200 ease-out",
          isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        )}
      />
    </Link>
  );
}
