import { Mail } from "lucide-react";
import { Logo } from "@/components/site/layout/Logo";
import { FooterColumns } from "@/components/site/layout/FooterColumns";
import { Button } from "@/components/site/ui/Button";
import { MAKER, SIGN_IN_URL, SUPPORT_EMAIL } from "@/lib/site/links";
import { NAV_COPY, SITE } from "@/lib/site/content";

/**
 * The site's closing frame: a deep purple band with the brand and contact on
 * the left, four link columns on the right, and a thin bottom bar for the
 * copyright and the maker credit. Back to top is the floating ring from
 * `ScrollProgress`, so the footer carries no second one.
 */
export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[linear-gradient(180deg,#1E1650,#2A1F6B)] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      <div className="mx-auto max-w-[1160px] px-5 pb-8 pt-14 sm:px-8 sm:pt-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)] lg:gap-10">
          <div className="max-w-[25rem]">
            <Logo onDark />
            <p className="mt-4 text-sm leading-6 text-white/65">{NAV_COPY.footerBlurb}</p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-4 inline-flex items-center gap-2 text-sm text-white/80 underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color] duration-200 hover:text-white hover:decoration-white/40"
            >
              <Mail aria-hidden className="size-4 text-brand-300" strokeWidth={2} />
              <span className="sr-only">{NAV_COPY.writeToUs}: </span>
              {SUPPORT_EMAIL}
            </a>
            <div className="mt-6">
              <Button href={SIGN_IN_URL} variant="onDark">
                {NAV_COPY.signIn}
              </Button>
            </div>
          </div>
          <FooterColumns />
        </div>

        <div className="mt-12 flex flex-col items-center gap-2 border-t border-white/10 pt-6 text-center text-[0.8rem] text-white/50 sm:flex-row sm:justify-between sm:text-left">
          <p>{SITE.copyright}</p>
          <p>
            {NAV_COPY.madeBy} <span className="font-medium text-white/75">{MAKER.name}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
