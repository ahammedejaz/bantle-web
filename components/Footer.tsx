import Link from "next/link";
import { ComingSoonBadges } from "@/components/ComingSoonBadges";
import { BrandMark } from "@/components/BrandMark";
import {
  CONTACT_EMAIL,
  LEGAL_LINKS,
  NAV_LINKS,
  TAGLINE,
} from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-teal-900 text-cream mt-24">
      <div className="container-x py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <Link
              href="/"
              className="inline-flex"
              aria-label="Bantle home"
            >
              <BrandMark light size="lg" />
            </Link>
            <p className="mt-4 text-[15px] leading-7 text-cream/80 max-w-xs">
              {TAGLINE} A coordination and chat app for household and
              family-plan arrangements in India.
            </p>
            <p className="mt-6 text-sm text-cream/60">
              Reach us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="underline underline-offset-2 hover:text-cream"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-cream/60 mb-4">
              Bantle
            </p>
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-cream/85 hover:text-cream transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-cream/60 mb-4">
              Legal
            </p>
            <ul className="flex flex-col gap-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[15px] text-cream/85 hover:text-cream transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-cream/15">
          <p className="text-xs uppercase tracking-[0.14em] text-cream/60 mb-4">
            Get the app
          </p>
          <ComingSoonBadges />
        </div>
        <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-cream/60">
          <p>© {year} Bantle. All rights reserved.</p>
          <p>Made in India · For India</p>
        </div>
      </div>
    </footer>
  );
}
