import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";
import { MobileNav } from "@/components/MobileNav";
import { BrandMark } from "@/components/BrandMark";
import { NavLink } from "@/components/site/NavLink";

// The header shares the deep-green canvas with the page's top band, so at rest
// it reads as one mass with the hero. Once the light body scrolls underneath,
// the blur separates them without a hard rule.
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-canvas-edge/10 bg-canvas/85 text-canvas-fg backdrop-blur-xl">
      <div className="container-x flex h-[68px] items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="Bantle home"
          className="press shrink-0 rounded-lg"
        >
          <BrandMark tone="light" priority />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/#get-the-app"
            className="press hidden h-10 items-center rounded-full bg-mint px-5 text-[14.5px] font-semibold tracking-tight text-canvas transition-colors duration-200 ease-out hover:bg-white md:inline-flex"
          >
            Get the app
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
