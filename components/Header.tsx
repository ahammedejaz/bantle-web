import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";
import { MobileNav } from "@/components/MobileNav";
import { BrandMark } from "@/components/BrandMark";

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-cream border-b border-line">
      <div className="container-x flex items-center justify-between h-16">
        <Link
          href="/"
          aria-label="Bantle home"
          className="shrink-0"
        >
          <BrandMark />
        </Link>
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-8"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] text-ink hover:text-teal-900 transition-colors"
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
