import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

const publicRoutes = [
  "",
  "/about",
  "/how-it-works",
  "/safety",
  "/faq",
  "/support",
  "/account-deletion",
  "/child-safety-standards",
  "/terms",
  "/privacy",
  "/refund-policy",
  "/community-guidelines",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-06-27");

  return publicRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
