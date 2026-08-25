import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

// Priorities reflect how much of the product story a page carries, not how
// often it changes. The transactional /verify and /reset-password routes are
// excluded on purpose: they are reached from email links and are noindex.
const publicRoutes: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/how-it-works", priority: 0.9, changeFrequency: "monthly" },
  { path: "/safety", priority: 0.9, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/support", priority: 0.7, changeFrequency: "monthly" },
  { path: "/community-guidelines", priority: 0.5, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.5, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.5, changeFrequency: "yearly" },
  { path: "/refund-policy", priority: 0.4, changeFrequency: "yearly" },
  { path: "/account-deletion", priority: 0.4, changeFrequency: "yearly" },
  { path: "/child-safety-standards", priority: 0.4, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
