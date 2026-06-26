import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";
import { MobileNav } from "@/components/MobileNav";
import { BrandMark } from "@/components/BrandMark";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-teal-900/5 bg-cream/95 shadow-[0_4px_20px_-8px_rgba(0,60,52,0.15)] backdrop-blur">
      <div className="container-x flex h-[72px] items-center justify-between">
        <Link
          href="/"
          aria-label="Bantle home"
          className="shrink-0 rounded-button"
        >
          <BrandMark />
        </Link>
        <nav
          aria-label="Primary"
          className="hidden items-center gap-7 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-ink-muted transition-colors hover:text-teal-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
