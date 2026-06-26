import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { BRAND_NAME, SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/constants";

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
    default: SITE_TITLE,
    template: `%s | ${BRAND_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Bantle",
    "split subscriptions",
    "subscription sharing",
    "buy subscription access",
    "one-time subscription access",
    "monthly subscription slots",
    "verified sellers",
    "subscription deals India",
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
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
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
