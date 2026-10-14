"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/site/gsap";
import { registerLenis, refreshWhenSettled } from "@/lib/site/scroll";

/** Height of the sticky header, so anchor targets are not hidden behind it. */
const HEADER_OFFSET = -80;

/**
 * Drives the page with Lenis and keeps ScrollTrigger in step with it.
 *
 * GSAP's ticker runs the Lenis loop so the two never disagree about the current
 * scroll position — running Lenis on its own rAF causes visible jitter in
 * scrubbed timelines. Visitors who ask for reduced motion get native scrolling.
 *
 * `lenis.css` matters more than it looks: it is what stops the browser's own
 * smooth-scroll from fighting the library, and what keeps `html`/`body` at
 * `height: auto` so the document is the full length Lenis expects.
 */
export function SmoothScroll() {
  useEffect(() => {
    // Anchor links still have to work for these visitors — the browser's own
    // instant jump is the reduced-motion behaviour, so simply stand aside.
    if (prefersReducedMotion()) {
      refreshWhenSettled();
      return;
    }

    const lenis = new Lenis({
      // `lerp` follows the wheel closely each frame. The old `duration` easing had a long slow tail
      // that made the page feel like it was sticking at the end of every flick.
      lerp: 0.14,
      wheelMultiplier: 1,
      smoothWheel: true,
      // Touch devices already scroll well; hijacking them just feels laggy.
      syncTouch: false,
    });

    registerLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Same-page hash links have to go through Lenis, otherwise the browser
    // jumps instantly and the smooth scroll is bypassed.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) return;

      const path = href.slice(0, hashIndex);
      const isSamePage = path === "" || path === "/" || path === window.location.pathname;
      if (!isSamePage) return;

      const id = href.slice(hashIndex + 1);
      const target = id === "top" ? 0 : document.getElementById(id);
      if (target === null) return;

      event.preventDefault();
      lenis.scrollTo(target, { offset: target === 0 ? 0 : HEADER_OFFSET });
      history.replaceState(null, "", `#${id}`);
    };

    document.addEventListener("click", onClick);
    refreshWhenSettled();

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
