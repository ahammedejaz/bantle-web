import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

// The admin panel and the two transactional auth screens stay out of every
// index. Everything else is open, including to the AI crawlers, which are
// listed explicitly so the intent is on the record rather than inherited.
const DISALLOWED = ["/admin", "/admin/", "/reset-password", "/verify"];

// Named explicitly so the allow decision is recorded rather than inherited
// from the wildcard. Amazonbot and Meta-ExternalAgent were previously allowed
// only by fallthrough.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Applebot",
  "Amazonbot",
  "Meta-ExternalAgent",
  "CCBot",
  "Bingbot",
  "DuckDuckBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED,
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOWED,
      })),
    ],
    // No `host` directive: it was only ever read by Yandex, was deprecated by
    // them in 2021, and takes a bare hostname rather than a URL, so the value
    // emitted here was invalid anyway. Canonical host is declared by the
    // canonical tags and the sitemap.
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
