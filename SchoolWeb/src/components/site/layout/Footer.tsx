import { Mail } from "lucide-react";
import { Logo } from "@/components/site/layout/Logo";
import { FooterColumns } from "@/components/site/layout/FooterColumns";
import { FooterWordmark } from "@/components/site/layout/FooterWordmark";
import { BackToTop } from "@/components/site/layout/BackToTop";
import { MAKER } from "@/lib/site/links";
import { NAV_COPY, SITE } from "@/lib/site/content";

/**
 * The site's closing frame on a lavender ground: the
 * link columns at the top and the brand name, oversized, as the last thing on
 * the page.
 */
export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-surface-sunken px-3 pb-3 pt-16 sm:px-5 sm:pb-5 sm:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(90%,60rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-300 to-transparent"
      />
      <div className="mx-auto max-w-[1100px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-[0.95rem] leading-relaxed text-muted">{NAV_COPY.footerBlurb}</p>
            <a
              href={`mailto:${MAKER.email}`}
              className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-surface py-1.5 pl-1.5 pr-4 text-[0.85rem] font-medium text-foreground ring-1 ring-line transition-colors hover:text-brand-700 hover:ring-brand-200"
            >
              <span className="grid size-7 place-items-center rounded-full bg-brand-500 text-white">
                <Mail aria-hidden className="size-3.5" strokeWidth={2.2} />
              </span>
              <span className="sr-only">{NAV_COPY.writeToUs}: </span>
              {MAKER.email}
            </a>
          </div>
          <FooterColumns />
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <p className="text-[0.8rem] text-faint">{NAV_COPY.footerNote}</p>
          <BackToTop />
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-[1400px] sm:mt-14">
        <FooterWordmark />
      </div>

      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-full px-1 pt-4 text-[0.78rem] text-faint">
        <p>{SITE.copyright}</p>
        <p>
          {NAV_COPY.madeBy} <span className="font-semibold text-muted">{MAKER.name}</span>
          <span aria-hidden className="mx-2 text-line-strong">
            /
          </span>
          <a href={`mailto:${MAKER.email}`} className="transition-colors hover:text-brand-700">
            {MAKER.email}
          </a>
        </p>
      </div>
    </footer>
  );
}
