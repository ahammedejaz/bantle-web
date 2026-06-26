import Link from "next/link";
import { ComingSoonBadges } from "@/components/ComingSoonBadges";
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
    <footer className="mt-24 bg-teal-900 text-cream">
      <div className="container-x py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1.3fr]">
          <div>
            <Link href="/" className="inline-flex" aria-label="Bantle home">
              <BrandMark light size="lg" />
            </Link>
            <p className="mt-4 max-w-xs text-[15px] leading-7 text-cream/80">
              {TAGLINE}. A coordination and chat app for household and
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

          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="mb-4 text-xs uppercase tracking-[0.14em] text-cream/60">
                {group.title}
              </p>
              <ul className="flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[15px] text-cream/85 transition-colors hover:text-cream"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-cream/15 pt-8">
          <p className="mb-4 text-xs uppercase tracking-[0.14em] text-cream/60">
            Get the app
          </p>
          <ComingSoonBadges />
        </div>
        <div className="mt-10 flex flex-col gap-3 text-sm text-cream/60 md:flex-row md:items-center md:justify-between">
          <p>© {year} Bantle. All rights reserved.</p>
          <p>Made in India · For India</p>
        </div>
      </div>
    </footer>
  );
}
