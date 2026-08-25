import {
  BRAND_NAME,
  CONTACT_EMAIL,
  POSTAL_ADDRESS,
  SITE_DESCRIPTION,
  SITE_URL,
} from "@/lib/constants";

// Every JSON-LD graph on the site is assembled here so that @id values stay
// consistent across pages. Google resolves the Organization and WebSite nodes
// once and links every page-level node back to them.

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=in.bantle.app";
export const APP_STORE_URL = "https://apps.apple.com/in/app/id6777968886";

type JsonLdNode = Record<string, unknown>;

export const organizationNode: JsonLdNode = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: BRAND_NAME,
  url: SITE_URL,
  email: CONTACT_EMAIL,
  description: SITE_DESCRIPTION,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/brand/bantle-icon.png`,
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
      availableLanguage: ["en"],
      areaServed: "IN",
    },
  ],
  sameAs: [PLAY_STORE_URL, APP_STORE_URL],
};

export const webSiteNode: JsonLdNode = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: BRAND_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: "en-IN",
  publisher: { "@id": ORGANIZATION_ID },
};

export const mobileApplicationNode: JsonLdNode = {
  "@type": "MobileApplication",
  "@id": `${SITE_URL}/#app`,
  name: BRAND_NAME,
  operatingSystem: "Android, iOS",
  applicationCategory: "LifestyleApplication",
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  installUrl: [PLAY_STORE_URL, APP_STORE_URL],
  downloadUrl: [PLAY_STORE_URL, APP_STORE_URL],
  publisher: { "@id": ORGANIZATION_ID },
  availableOnDevice: "Android, iOS",
  countriesSupported: "IN",
  // The app itself is free to use; Bantle takes no fee and handles no payment.
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
  },
};

/** Breadcrumb trail from the site root to the current page. */
export function breadcrumbNode(
  trail: { name: string; path: string }[]
): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
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

/** A page node, typed so Google can tell an About page from a Contact page. */
export function webPageNode({
  path,
  name,
  description,
  type = "WebPage",
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
}): JsonLdNode {
  return {
    "@type": type,
    "@id": `${SITE_URL}${path}#webpage`,
    url: `${SITE_URL}${path}`,
    name,
    description,
    inLanguage: "en-IN",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/**
 * The FAQ page's primary node. It replaces `webPageNode` on that route rather
 * than sitting beside it: two nodes describing the same URL, one typed WebPage
 * and one typed FAQPage, is a conflicting signal. `answer` must be plain text,
 * not markup.
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
  items: { question: string; answer: string }[];
}): JsonLdNode {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}${path}#webpage`,
    url: `${SITE_URL}${path}`,
    name,
    description,
    inLanguage: "en-IN",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** Step-by-step node for the how-it-works walk-through. */
export function howToNode({
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
    "@type": "HowTo",
    "@id": `${SITE_URL}${path}#howto`,
    name,
    description,
    inLanguage: "en-IN",
    totalTime: "PT10M",
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
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

export const POSTAL_ADDRESS_TEXT = POSTAL_ADDRESS;
