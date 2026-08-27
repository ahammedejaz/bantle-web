import {
  BRAND_NAME,
  COMPANY_NAME,
  CONTACT_EMAIL,
  FEEDBACK_EMAIL,
  SITE_DESCRIPTION,
  SITE_URL,
} from "@/lib/constants";

// Every JSON-LD graph on the site is assembled here so that @id values stay
// consistent across pages.
//
// Google resolves structured data *per document*. It does not keep a
// cross-URL @id graph, so a page-level node that references
// `#organization` without also defining it is referencing nothing: the
// publisher, the site membership and the entity anchor all silently
// evaporate. Every route therefore ships `siteEntityNodes` alongside its own
// page node.

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const FOUNDER_ID = `${SITE_URL}/#founder`;

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=in.bantle.app";
export const APP_STORE_URL = "https://apps.apple.com/in/app/id6777968886";

type JsonLdNode = Record<string, unknown>;

/**
 * The operator, named. This is not a new claim: the privacy policy and the
 * terms already state that Bantle is operated by this person, and both store
 * listings publish the same developer name.
 */
export const founderNode: JsonLdNode = {
  "@type": "Person",
  "@id": FOUNDER_ID,
  name: COMPANY_NAME,
};

export const organizationNode: JsonLdNode = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: BRAND_NAME,
  url: SITE_URL,
  email: CONTACT_EMAIL,
  description: SITE_DESCRIPTION,
  founder: { "@id": FOUNDER_ID },
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/brand/bantle-icon.png`,
    width: 320,
    height: 320,
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    addressCountry: "IN",
  },
  areaServed: {
    "@type": "Country",
    name: "India",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: CONTACT_EMAIL,
      url: `${SITE_URL}/support`,
      availableLanguage: ["en"],
      areaServed: "IN",
    },
    {
      "@type": "ContactPoint",
      contactType: "technical support",
      email: FEEDBACK_EMAIL,
      url: `${SITE_URL}/support`,
      availableLanguage: ["en"],
      areaServed: "IN",
    },
  ],
  sameAs: [PLAY_STORE_URL, APP_STORE_URL],
};

// Each node below carries a description scoped to what it actually is. Giving
// the company, the website and the app one identical string invites a parser
// to collapse three entities into one blurry one.
export const webSiteNode: JsonLdNode = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: BRAND_NAME,
  url: SITE_URL,
  description:
    "Official website for Bantle, the India-first app for coordinating subscription slot sharing and fixed-duration access.",
  inLanguage: "en-IN",
  publisher: { "@id": ORGANIZATION_ID },
};

/**
 * The entity anchors every page carries. Order matters only for readability;
 * the founder is defined before the Organization that references it.
 */
export const siteEntityNodes: JsonLdNode[] = [
  founderNode,
  organizationNode,
  webSiteNode,
];

export const mobileApplicationNode: JsonLdNode = {
  "@type": "MobileApplication",
  "@id": `${SITE_URL}/#app`,
  name: BRAND_NAME,
  operatingSystem: "Android, iOS",
  applicationCategory: "LifestyleApplication",
  description:
    "A free mobile app for coordinating monthly subscription slot sharing and fixed-duration access in India. Payments happen directly between users, outside the app.",
  // The app's own canonical home is its store listing, not the marketing site.
  url: PLAY_STORE_URL,
  installUrl: [PLAY_STORE_URL, APP_STORE_URL],
  downloadUrl: [PLAY_STORE_URL, APP_STORE_URL],
  publisher: { "@id": ORGANIZATION_ID },
  author: { "@id": FOUNDER_ID },
  availableOnDevice: "Android, iOS",
  countriesSupported: "IN",
  inLanguage: "en-IN",
  isAccessibleForFree: true,
  // The app is genuinely free and takes no fee. There is deliberately no
  // aggregateRating here: Bantle has no first-party ratings, and restating a
  // store's rating on our own domain is exactly what the review-snippet
  // policy prohibits.
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
    url: PLAY_STORE_URL,
    category: "free",
  },
};

/** Breadcrumb trail from the site root to the current page. */
export function breadcrumbNode(
  trail: { name: string; path: string }[]
): JsonLdNode {
  const path = trail.length ? trail[trail.length - 1].path : "/";
  return {
    "@type": "BreadcrumbList",
    "@id": `${SITE_URL}${path === "/" ? "" : path}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      ...trail.map((entry, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: entry.name,
        item: `${SITE_URL}${entry.path}`,
      })),
    ],
  };
}

/** Absolute URL for a route, in the same spelling the canonical tag uses. */
function absolute(path: string): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

/** A page node, typed so Google can tell an About page from a Contact page. */
export function webPageNode({
  path,
  name,
  description,
  type = "WebPage",
  dateModified,
  datePublished,
  extra,
}: {
  path: string;
  name: string;
  description: string;
  type?:
    | "WebPage"
    | "AboutPage"
    | "ContactPage"
    | "FAQPage"
    | "CollectionPage";
  /** ISO 8601. Only ever a date the page itself displays. */
  dateModified?: string;
  datePublished?: string;
  extra?: JsonLdNode;
}): JsonLdNode {
  return {
    "@type": type,
    "@id": `${SITE_URL}${path}#webpage`,
    url: absolute(path),
    name,
    description,
    inLanguage: "en-IN",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    breadcrumb: { "@id": `${SITE_URL}${path === "/" ? "" : path}#breadcrumb` },
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    ...extra,
  };
}

/**
 * The FAQ page's primary node. It replaces `webPageNode` on that route rather
 * than sitting beside it: two nodes describing the same URL, one typed WebPage
 * and one typed FAQPage, is a conflicting signal. `answer` must be plain text,
 * not markup.
 *
 * Google restricted FAQ rich results to government and healthcare sites in
 * August 2023, so this will not render a SERP accordion. It stays because a
 * machine-readable Q&A block is one of the strongest assets the site has for
 * AI answer engines, and that channel is unaffected by the restriction.
 */
export function faqPageNode({
  path,
  name,
  description,
  items,
}: {
  path: string;
  name: string;
  description: string;
  items: { question: string; answer: string; id?: string }[];
}): JsonLdNode {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}${path}#webpage`,
    url: absolute(path),
    name,
    description,
    inLanguage: "en-IN",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    breadcrumb: { "@id": `${SITE_URL}${path}#breadcrumb` },
    mainEntity: items.map((item) => ({
      "@type": "Question",
      ...(item.id ? { "@id": `${SITE_URL}${path}#${item.id}` } : {}),
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/**
 * An ordered list of steps.
 *
 * This deliberately is not `HowTo`: Google retired HowTo rich results in
 * September 2023, so that type is now dead weight that Search Console reports
 * as deprecated. `ItemList` is current, carries the same sequence for AI
 * answer engines, and claims no retired rich result.
 */
export function stepListNode({
  name,
  description,
  steps,
  path,
}: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
  path: string;
}): JsonLdNode {
  return {
    "@type": "ItemList",
    "@id": `${SITE_URL}${path}#steps`,
    name,
    description,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: steps.length,
    itemListElement: steps.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      description: step.text,
      url: `${SITE_URL}${path}#step-${index + 1}`,
    })),
  };
}

/** Serialises a graph for a <script type="application/ld+json"> tag. */
export function jsonLd(nodes: JsonLdNode[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": nodes,
  }).replace(/</g, "\\u003c");
}
