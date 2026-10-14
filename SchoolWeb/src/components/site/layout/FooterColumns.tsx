import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/site/motion/Reveal";
import { FOOTER_COLUMNS } from "@/lib/site/links";
import { NAV_COPY } from "@/lib/site/content";

const linkClass =
  "inline-flex items-center gap-1 whitespace-nowrap text-sm text-white/65 underline decoration-transparent underline-offset-4 " +
  "transition-[color,text-decoration-color] duration-200 hover:text-white hover:decoration-white/40";

/** Four link columns, a 2x2 grid on phones. Each column fades in once. */
export function FooterColumns() {
  return (
    <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
      {FOOTER_COLUMNS.map((column, index) => (
        <Reveal key={column.title} delay={index * 0.06}>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white">
            {column.title}
          </h3>
          <ul className="mt-4 space-y-3">
            {column.links.map((link) => (
              <li key={`${column.title}-${link.label}`}>
                {link.external ? (
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {link.label}
                    <ArrowUpRight aria-hidden className="size-3.5" strokeWidth={2.2} />
                    <span className="sr-only"> {NAV_COPY.newTab}</span>
                  </a>
                ) : (
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Reveal>
      ))}
    </nav>
  );
}
