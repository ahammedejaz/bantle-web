import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Marketing layout. Wraps every public-facing page on bantle.in
// (homepage, about, faq, terms, privacy, etc.) with the brand
// Header and Footer. Lives in a route group so the `(marketing)`
// directory does not appear in any URL.
//
// The admin panel under app/admin/* uses a different layout and
// never renders this chrome.

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-teal-900 focus:text-cream focus:px-3 focus:py-2 focus:rounded-button"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
