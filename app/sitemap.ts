import type { MetadataRoute } from "next";
import { POLICY_EFFECTIVE_DATE_ISO, SITE_URL } from "@/lib/constants";
import { EFFECTIVE_DATE } from "@/lib/tos";

// Priorities reflect how much of the product story a page carries, not how
// often it changes. The transactional /verify and /reset-password routes are
// excluded on purpose: they are reached from email links and are noindex.
//
// `lastModified` is a real content date, never the build time. Stamping every
// URL with `new Date()` tells Google the whole site changed on every deploy,
// which is how a site teaches Google to ignore its own lastmod. Pages whose
// content has no published date are given the date of the redesign that last
// rewrote them, and that constant is updated by hand when they change.
const CONTENT_LAST_CHANGED = "2026-08-26";

const publicRoutes: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  lastModified: string;
}[] = [
  { path: "", priority: 1, changeFrequency: "weekly", lastModified: CONTENT_LAST_CHANGED },
  { path: "/how-it-works", priority: 0.9, changeFrequency: "monthly", lastModified: CONTENT_LAST_CHANGED },
  { path: "/safety", priority: 0.9, changeFrequency: "monthly", lastModified: CONTENT_LAST_CHANGED },
  { path: "/faq", priority: 0.8, changeFrequency: "monthly", lastModified: CONTENT_LAST_CHANGED },
  { path: "/about", priority: 0.7, changeFrequency: "monthly", lastModified: CONTENT_LAST_CHANGED },
  { path: "/support", priority: 0.7, changeFrequency: "monthly", lastModified: CONTENT_LAST_CHANGED },
  { path: "/community-guidelines", priority: 0.5, changeFrequency: "yearly", lastModified: POLICY_EFFECTIVE_DATE_ISO },
  { path: "/privacy", priority: 0.5, changeFrequency: "yearly", lastModified: POLICY_EFFECTIVE_DATE_ISO },
  { path: "/terms", priority: 0.5, changeFrequency: "yearly", lastModified: EFFECTIVE_DATE },
  { path: "/refund-policy", priority: 0.4, changeFrequency: "yearly", lastModified: POLICY_EFFECTIVE_DATE_ISO },
  { path: "/account-deletion", priority: 0.4, changeFrequency: "yearly", lastModified: CONTENT_LAST_CHANGED },
  { path: "/child-safety-standards", priority: 0.4, changeFrequency: "yearly", lastModified: CONTENT_LAST_CHANGED },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
