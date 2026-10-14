"use client";

import { ArrowUp } from "lucide-react";
import { NAV_COPY } from "@/lib/site/content";
import { prefersReducedMotion } from "@/lib/site/gsap";

/**
 * `#top` is picked up by `SmoothScroll`, which glides there through Lenis.
 * Without Lenis (reduced motion) and on pages with no `#top` element, the
 * browser would do nothing, so jump there directly.
 */
export function BackToTop() {
  return (
    <a
      href="#top"
      onClick={(event) => {
        if (!prefersReducedMotion()) return;
        event.preventDefault();
        window.scrollTo(0, 0);
      }}
      className="group inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-4 py-2 text-[0.8rem] font-semibold text-foreground transition-colors hover:border-brand-300 hover:text-brand-700"
    >
      {NAV_COPY.backToTop}
      <span className="grid size-6 place-items-center rounded-full bg-brand-50 text-brand-600 transition-transform duration-300 group-hover:-translate-y-0.5">
        <ArrowUp aria-hidden className="size-3.5" strokeWidth={2.4} />
      </span>
    </a>
  );
}
