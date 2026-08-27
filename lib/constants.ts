export const BRAND_NAME = "Bantle";
export const TAGLINE = "Split or buy subscriptions with more trust.";
// Exact site/tab title requested by the founder (no trailing period, no template
// suffix). Used for the homepage <title> and OG/Twitter titles.
export const SITE_TITLE = "Bantle - Split or buy subscriptions with more trust";
// The canonical host. This must match the host the server actually serves,
// because canonicals, the sitemap, robots' Host directive, og:url and every
// schema @id are all derived from it. bantle.in 307-redirects to www, so www
// is the real host; declaring the apex here pointed every canonical URL we
// publish at a redirect.
export const SITE_URL = "https://www.bantle.in";
// Kept under ~155 characters: Google truncates the meta description around
// there, and the previous 199-character version lost its last clause in the
// SERP. Longer prose belongs on the page, not in the snippet.
export const SITE_DESCRIPTION =
  "Split monthly subscription slots or buy the access a seller has left. Verified listings, proposal-first chat, and payments that stay outside Bantle.";

export const CONTACT_EMAIL = "support@bantle.in";
export const FEEDBACK_EMAIL = "feedback@bantle.in";
export const PRIVACY_EMAIL = "privacy@bantle.in";
export const LEGAL_EMAIL = "legal@bantle.in";
export const GRIEVANCE_EMAIL = "grievance@bantle.in";

export const COMPANY_NAME = "Syed Ejaz Ahammed";
export const JURISDICTION_CITY = "Bengaluru";
export const GRIEVANCE_OFFICER_NAME = "Syed Ejaz Ahammed";
export const POSTAL_ADDRESS = "Bengaluru, Karnataka, India";

export const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/safety", label: "Safety" },
  { href: "/faq", label: "FAQ" },
  { href: "/support", label: "Support" },
];

export const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
  { href: "/refund-policy", label: "Refund policy" },
  { href: "/community-guidelines", label: "Community guidelines" },
];

export const POLICY_EFFECTIVE_DATE = "14 May 2026";
/** The same date in ISO 8601, for schema.org `dateModified`. Keep in sync. */
export const POLICY_EFFECTIVE_DATE_ISO = "2026-05-14";
