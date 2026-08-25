import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

// The admin panel and the two transactional auth screens stay out of every
// index. Everything else is open, including to the AI crawlers, which are
// listed explicitly so the intent is on the record rather than inherited.
const DISALLOWED = ["/admin", "/admin/", "/reset-password", "/verify"];

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
  "CCBot",
  "Bingbot",
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
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
