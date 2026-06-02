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
    default: `${BRAND_NAME} — ${TAGLINE} Keep your savings.`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Bantle",
    "subscription sharing India",
    "split Spotify family",
    "share YouTube Premium",
    "Apple One family share",
    "Microsoft 365 family",
    "OTT sharing India",
    "subscription coordination India",
  ],
  authors: [{ name: BRAND_NAME }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: BRAND_NAME,
    title: `${BRAND_NAME} — ${TAGLINE} Keep your savings.`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} — ${TAGLINE} Keep your savings.`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className="bg-cream text-ink">{children}</body>
    </html>
  );
}
