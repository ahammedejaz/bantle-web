import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { BRAND_NAME, SITE_DESCRIPTION, SITE_URL, TAGLINE } from "@/lib/constants";

// Root layout. Site-wide concerns only: html/body, fonts, globals,
// site-wide metadata. NO Header/Footer here — those belong to the
// marketing route group's layout (app/(marketing)/layout.tsx).
// The admin panel (app/admin/*) supplies its own chrome.

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500"],
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${TAGLINE} | ${BRAND_NAME}`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Bantle",
    "household subscription coordination",
    "family plan coordination",
    "subscription access coordination",
    "subscription coordination India",
    "Bantle app",
  ],
  applicationName: BRAND_NAME,
  creator: BRAND_NAME,
  publisher: BRAND_NAME,
  category: "technology",
  authors: [{ name: BRAND_NAME }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: BRAND_NAME,
    title: `${TAGLINE} | ${BRAND_NAME}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${TAGLINE} | ${BRAND_NAME}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${lora.variable}`}
    >
      <body className="bg-cream text-ink">{children}</body>
    </html>
  );
}
