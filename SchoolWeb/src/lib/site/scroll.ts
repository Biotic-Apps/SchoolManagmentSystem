"use client";

import type Lenis from "lenis";
import { ScrollTrigger } from "@/lib/site/gsap";

/**
 * The one place the page's scroll behaviour is coordinated from.
 *
 * Lenis is created once in `SmoothScroll`, but three other things need to reach
 * it: the mobile menu has to stop it (a `body { overflow: hidden }` does not,
 * because Lenis drives `documentElement` itself), and every scroll-driven
 * section needs to ask ScrollTrigger to re-measure after the layout settles.
 * Passing an instance down through props would mean threading it through the
 * whole tree for two callers, so it lives here instead.
 */

let instance: Lenis | null = null;
let locks = 0;

/** Called by `SmoothScroll` when it creates or tears down the instance. */
export function registerLenis(lenis: Lenis | null) {
  instance = lenis;
}

/**
 * Freezes the page behind an overlay.
 *
 * Counted rather than boolean: if a menu and a dialog are ever open at once,
 * closing one must not release the other's lock. The scrollbar gutter is held
 * open so locking does not shift the page sideways.
 */
export function lockScroll(locked: boolean) {
  const next = Math.max(0, locks + (locked ? 1 : -1));
  const changed = (locks === 0) !== (next === 0);
  locks = next;
  if (!changed) return;

  if (locks > 0) {
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty("--scrollbar-gutter", `${gutter}px`);
    document.documentElement.setAttribute("data-scroll-locked", "");
    instance?.stop();
  } else {
    document.documentElement.removeAttribute("data-scroll-locked");
    document.documentElement.style.removeProperty("--scrollbar-gutter");
    instance?.start();
  }
}

/**
 * A single re-measure shared by every scroll-driven section.
 *
 * `ScrollTrigger.refresh()` recalculates every trigger on the page, so five
 * sections each scheduling their own after 400ms meant five full passes landing
 * in the same frame. Coalescing them into one keeps that burst to a single
 * measure, and running it off `fonts.ready` means it happens when the layout has
 * actually settled rather than at a guessed moment.
 */
let scheduled: number | undefined;

export function refreshScrollTriggers() {
  if (typeof window === "undefined") return;
  window.clearTimeout(scheduled);
  scheduled = window.setTimeout(() => ScrollTrigger.refresh(), 120);
}

/** Re-measures once the webfonts have swapped in and the first paint is done. */
export function refreshWhenSettled() {
  if (typeof window === "undefined") return;
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (fonts) {
    fonts.ready.then(refreshScrollTriggers).catch(refreshScrollTriggers);
  }
  refreshScrollTriggers();
}
