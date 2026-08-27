import type { MetadataRoute } from "next";
import { BRAND_NAME, SITE_DESCRIPTION, TAGLINE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND_NAME} - ${TAGLINE.replace(/\.$/, "")}`,
    short_name: BRAND_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    scope: "/",
    display: "standalone",
    // Both were left over from the first design pass. The installed app should
    // open on the same near-black ground the site actually uses, not flash a
    // light splash before it.
    background_color: "#050807",
    theme_color: "#050807",
    lang: "en-IN",
    categories: ["lifestyle", "finance", "social"],
    icons: [
      {
        src: "/brand/bantle-icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
