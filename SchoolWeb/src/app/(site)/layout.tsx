import type { Metadata, Viewport } from "next";
import { NAV_COPY, SITE } from "@/lib/site/content";
import { SITE_ORIGIN } from "@/lib/site/links";
import { Header } from "@/components/site/layout/Header";
import { Footer } from "@/components/site/layout/Footer";
import { SmoothScroll } from "@/components/site/motion/SmoothScroll";
import { ScrollProgress } from "@/components/site/motion/ScrollProgress";
import { MotionProvider } from "@/components/site/motion/MotionProvider";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  // Every page states its own canonical, so a link arriving with a tracking
  // query or a trailing slash does not read as a second copy of the page.
  alternates: { canonical: "/" },
  title: {
    default: `${SITE.name} | ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "school management software Pakistan",
    "school management system",
    "school ERP Pakistan",
    "fee challan software",
    "student attendance app",
    "report card software",
    "parent portal",
    "school payroll software",
    "eSchool",
  ],
  applicationName: SITE.name,
  creator: "Pixdevelop",
  publisher: "Pixdevelop",
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: SITE.name,
    title: `${SITE.name} | ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} | ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

/**
 * A route-group layout may export `viewport`, and it MERGES over the root
 * layout's rather than replacing it — so `viewportFit: "cover"` from
 * `app/layout.tsx` survives and only these two keys are added.
 *
 * `colorScheme: "light"` is safe to state absolutely: the marketing site ships
 * one theme, and the app's `ThemeProvider` never mounts outside `app/(app)/`,
 * so a marketing page is light whatever the visitor's system says.
 */
export const viewport: Viewport = {
  // White chrome, matching the page; the purple lives in the content.
  themeColor: "#ffffff",
  // The site ships one theme, so tell the browser not to auto-darken form
  // controls and scrollbars against it.
  colorScheme: "light",
};

/**
 * The marketing shell — a GROUP layout, not a root one.
 *
 * `app/layout.tsx` already renders `<html>` and `<body>` with Inter and
 * `font-sans antialiased`, so this file renders neither and imports no font of
 * its own — a second font import would download another typeface for nothing.
 *
 * `site-shell` is load-bearing, not decoration. Every marketing CSS rule is
 * scoped under that class, so without it the site's base styles would apply to
 * the school app as well. No `h-full` anywhere above this: Lenis needs
 * `html` and `body` at their natural height to measure the document, and a hard
 * `height: 100%` truncates it.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell flex min-h-screen flex-col">
      {/* Animated elements are served hidden and revealed by JavaScript.
          Without it they would never appear, so show them outright — and the
          FAQ, whose toggle is a script, simply opens every answer.

          It lived in `<head>` when this was a root layout. `<noscript>` is
          valid in the body too, and the body is the only place a group layout
          can put it. */}
      <noscript>
        <style>{
          `[data-motion]{opacity:1!important;transform:none!important}` +
          `[data-faq-panel]{height:auto!important;opacity:1!important;overflow:visible!important}`
        }</style>
      </noscript>
      <MotionProvider>
        <a
          href="#main"
          className="sr-only z-[80] rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          {NAV_COPY.skipToContent}
        </a>
        <SmoothScroll />
        <ScrollProgress />
        <Header />
        {/* `tabIndex={-1}` so the skip link moves focus here, not just scroll. */}
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <Footer />
      </MotionProvider>
    </div>
  );
}
