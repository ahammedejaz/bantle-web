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
    background_color: "#F4F7F5",
    theme_color: "#00251E",
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
