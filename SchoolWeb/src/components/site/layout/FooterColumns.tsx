import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FOOTER_COLUMNS } from "@/lib/site/links";
import { NAV_COPY } from "@/lib/site/content";

const linkClass =
  "group relative inline-flex items-center gap-1.5 text-[0.9rem] text-muted transition-colors hover:text-brand-700";

/** The link columns. Each link shows a small purple dot on hover. */
export function FooterColumns() {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
      {FOOTER_COLUMNS.map((column) => (
        <div key={column.title}>
          <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand-700">
            {column.title}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {column.links.map((link) => {
              const dot = (
                <span
                  aria-hidden
                  className="absolute -left-3 top-1/2 -mt-[3px] size-1.5 scale-0 rounded-full bg-brand-500 transition-transform duration-200 group-hover:scale-100"
                />
              );
              return (
                <li key={`${column.title}-${link.label}`}>
                  {link.external ? (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      {dot}
                      {link.label}
                      <ArrowUpRight aria-hidden className="size-3.5" strokeWidth={2.2} />
                      <span className="sr-only"> {NAV_COPY.newTab}</span>
                    </a>
                  ) : (
                    <Link href={link.href} className={linkClass}>
                      {dot}
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
  );
}
