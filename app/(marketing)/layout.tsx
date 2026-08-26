import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/site/ScrollReveal";

// Marketing layout. Wraps every public-facing page on bantle.in
// (homepage, about, faq, terms, privacy, etc.) with the brand
// Header and Footer. Lives in a route group so the `(marketing)`
// directory does not appear in any URL.
//
// `theme-site` scopes the marketing surface tokens (and their dark-mode
// overrides) to this subtree. The admin panel under app/admin/* uses a
// different layout, never renders this chrome, and is unaffected by them.

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-site flex min-h-screen flex-col bg-canvas text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-canvas"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <ScrollReveal />
    </div>
  );
}
