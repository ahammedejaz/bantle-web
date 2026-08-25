import type { Metadata } from "next";
import { BRAND_NAME, SITE_TITLE } from "@/lib/constants";

/**
 * The one social card the whole site shares. It lives at a stable path
 * (`/og.png`) rather than behind Next's hashed `opengraph-image` convention,
 * because a page that declares its own `openGraph` block opts out of that
 * convention entirely and would otherwise ship with no image at all.
 */
export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: SITE_TITLE,
  type: "image/png",
} as const;

/** Fields every page's Open Graph block carries, on top of its own title/url. */
export const OG_BASE = {
  type: "website",
  siteName: BRAND_NAME,
  locale: "en_IN",
  images: [OG_IMAGE],
} satisfies Partial<NonNullable<Metadata["openGraph"]>>;

/** Fields every page's Twitter card carries. */
export const TWITTER_BASE = {
  card: "summary_large_image",
  images: [OG_IMAGE],
} satisfies Partial<NonNullable<Metadata["twitter"]>>;
