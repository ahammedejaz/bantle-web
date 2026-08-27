import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono, Lora } from "next/font/google";
import "./globals.css";
import { BRAND_NAME, SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/constants";
import { OG_BASE, TWITTER_BASE } from "@/lib/seo";

// Root layout. Site-wide concerns only: html/body, fonts, globals,
// site-wide metadata. NO Header/Footer here — those belong to the
// marketing route group's layout (app/(marketing)/layout.tsx).
// The admin panel (app/admin/*) supplies its own chrome.

// Display face. Only the weight axis is loaded: the optical-size and width
// axes are never driven by the design, and shipping them roughly triples the
// file.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// Body / UI face.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Numerals, prices and micro-labels. The variable file covers both weights the
// design uses in a single request.
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Admin-only. `preload: false` keeps it off the marketing critical path; the
// browser fetches it only where `font-serif` actually renders text.
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
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
    "subscription sharing app",
    "share OTT subscription India",
    "buy subscription access",
    "one-time subscription access",
    "monthly subscription slots",
    "family plan sharing India",
    "verified sellers",
    "subscription deals India",
  ],
  applicationName: BRAND_NAME,
  creator: BRAND_NAME,
  publisher: BRAND_NAME,
  category: "technology",
  authors: [{ name: BRAND_NAME }],
  // Deliberately no root-level `alternates.canonical`. Every page sets its
  // own, and a root default leaks onto the not-found route, where a canonical
  // pointing at the homepage reads as a soft 404.
  openGraph: {
    ...OG_BASE,
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    ...TWITTER_BASE,
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
  // Set GOOGLE_SITE_VERIFICATION in the Vercel project to have Next emit the
  // Search Console meta tag. Omitted entirely when the variable is unset.
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  manifest: "/manifest.webmanifest",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  // Matches the marketing site's actual ground. It was still the deep green
  // from the first design pass, so mobile browser chrome disagreed with the
  // page it framed.
  themeColor: "#050807",
  colorScheme: "light dark",
};

// Marks the document as JavaScript-capable before first paint. Scroll-reveal
// styles are gated on `.js`, so a client with scripting disabled (or a crawler
// that does not execute scripts) renders every section fully visible.
// If hydration never happens (a script error, a blocked bundle), the flag is
// dropped again after a few seconds and every revealed element falls back to
// its visible state.
const JS_FLAG =
  "document.documentElement.classList.add('js');" +
  "setTimeout(function(){if(!window.__bantleReveal)" +
  "document.documentElement.classList.remove('js')},4000)";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-IN"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${bricolage.variable} ${geist.variable} ${geistMono.variable} ${lora.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
      </head>
      <body className="bg-cream text-ink">{children}</body>
    </html>
  );
}
