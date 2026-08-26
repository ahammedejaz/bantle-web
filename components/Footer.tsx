import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StoreBadges } from "@/components/StoreBadges";
import { BrandMark } from "@/components/BrandMark";
import { CONTACT_EMAIL, TAGLINE } from "@/lib/constants";

// Footer link groups. Only public marketing/support/legal routes that exist
// under app/(marketing). The /verify and /reset-password routes are
// intentionally excluded: they are transactional auth screens reached from
// email links, not browsable marketing pages. No admin links are included.
const FOOTER_GROUPS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/", label: "Home" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/safety", label: "Safety" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/support", label: "Support" },
    ],
  },
  {
    title: "Legal & policies",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
      { href: "/refund-policy", label: "Refund policy" },
      { href: "/community-guidelines", label: "Community guidelines" },
      { href: "/account-deletion", label: "Account deletion" },
      { href: "/child-safety-standards", label: "Child safety standards" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="grain relative isolate overflow-hidden bg-canvas text-heading">
      {/* A single mint highlight anchors the top edge so the band does not read
          as a flat rectangle where the light body ends. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[70rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
      />

      <div className="container-x relative z-10 pb-10 pt-16 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)]">
          <div>
            <Link href="/" className="press inline-flex rounded-lg" aria-label="Bantle home">
              <BrandMark size="lg" />
            </Link>
            <p className="mt-5 max-w-sm text-[15px] leading-[1.7] text-fg-muted">
              {TAGLINE} A coordination and chat app for household and
              family-plan arrangements in India.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="group mt-5 inline-flex items-center gap-1.5 text-[15px] font-medium text-accent transition-colors hover:text-white"
            >
              {CONTACT_EMAIL}
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.75}
              />
            </a>

            <div className="mt-8">
              <p className="mb-3 text-[12.5px] font-medium text-fg-muted">
                Get the app
              </p>
              <StoreBadges size="sm" />
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="mb-4 text-[12.5px] font-medium text-fg-muted">
                  {group.title}
                </p>
                <ul className="flex flex-col gap-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[14.5px] text-fg-muted transition-colors duration-150 hover:text-heading"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-edge pt-7 text-[13.5px] text-fg-muted md:flex-row md:items-center md:justify-between">
          <p>© {year} Bantle. All rights reserved.</p>
          <p>Made in India, for India.</p>
        </div>
      </div>

      {/* Oversized wordmark as texture, clipped by the band. Decorative only. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[0.28em] left-1/2 z-0 w-full -translate-x-1/2 select-none text-center font-display text-[22vw] font-bold leading-none tracking-display text-accent/[0.05]"
      >
        Bantle
      </span>
    </footer>
  );
}
