"use client";

import { useEffect, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "@/lib/site/gsap";

/**
 * Two kinds of depth for the hero composition, both written straight to the
 * DOM so nothing re-renders:
 *
 * - `[data-depth="n"]` layers lean toward the mouse by up to `n` px (desktop
 *   with a fine pointer only). Their CSS transition does the smoothing.
 * - `[data-speed="n"]` layers drift up `n` px as the hero scrolls away, each at
 *   its own pace, so the stack separates instead of moving as one picture.
 *
 * No pinning and no added scroll distance: the layers only shift a few dozen
 * px against normal scrolling. Reduced motion skips both and leaves every layer where it was laid out.
 */
export function useHeroParallax(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const node = root.current;
    if (!node || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      node.querySelectorAll<HTMLElement>("[data-speed]").forEach((layer) => {
        gsap.to(layer, {
          y: -Number(layer.dataset.speed),
          ease: "none",
          scrollTrigger: { trigger: node, start: "top 20%", end: "bottom top", scrub: true },
        });
      });
    }, node);

    const fine = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const layers = Array.from(node.querySelectorAll<HTMLElement>("[data-depth]"));
    let frame = 0;
    let nx = 0;
    let ny = 0;

    const paint = () => {
      frame = 0;
      layers.forEach((layer) => {
        const d = Number(layer.dataset.depth);
        layer.style.transform =
          `translate3d(${(nx * d).toFixed(1)}px, ${(ny * d).toFixed(1)}px, 0) ` +
          `rotateY(${(nx * d * 0.12).toFixed(2)}deg) rotateX(${(-ny * d * 0.12).toFixed(2)}deg)`;
      });
    };

    const onMove = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType !== "mouse") return;
      nx = (event.clientX / window.innerWidth) * 2 - 1;
      ny = (event.clientY / window.innerHeight) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      ctx.revert();
    };
  }, [root]);
}
