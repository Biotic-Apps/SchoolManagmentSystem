import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { Logo } from "@/components/site/layout/Logo";
import { FOOTER_COLUMNS, MAKER } from "@/lib/site/links";
import { NAV_COPY, SITE } from "@/lib/site/content";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface-sunken">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        {/* Brand above the columns on small screens, beside them on large. */}
        <div className="lg:flex lg:items-start lg:justify-between lg:gap-16">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {NAV_COPY.footerBlurb}
            </p>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-10 sm:grid-cols-3 lg:mt-0 lg:min-w-[34rem] lg:gap-12">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-faint">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => {
                    const classes =
                      "inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-brand-600";

                    return (
                      <li key={`${column.title}-${link.label}`}>
                        {link.external || link.href.startsWith("mailto:") ? (
                          <a
                            href={link.href}
                            {...(link.external
                              ? { target: "_blank", rel: "noopener noreferrer" }
                              : {})}
                            className={classes}
                          >
                            {link.label}
                            {link.external ? (
                              <>
                                <ArrowUpRight
                                  aria-hidden
                                  className="size-3.5 shrink-0"
                                  strokeWidth={2.2}
                                />
                                <span className="sr-only">
                                  {" "}
                                  {NAV_COPY.newTab}
                                </span>
                              </>
                            ) : null}
                          </a>
                        ) : (
                          <Link href={link.href} className={classes}>
                            {link.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-7">
          <p className="text-xs text-faint">{SITE.copyright}</p>
          <p className="text-xs text-faint sm:ml-auto">
            {NAV_COPY.madeBy}{" "}
            <span className="font-semibold text-muted">{MAKER.name}</span>
          </p>
          <a
            href={`mailto:${MAKER.email}`}
            className="inline-flex items-center gap-1.5 text-xs text-faint transition-colors hover:text-brand-600"
          >
            <Mail
              aria-hidden
              className="size-3.5 text-brand-600"
              strokeWidth={2.2}
            />
            {MAKER.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
