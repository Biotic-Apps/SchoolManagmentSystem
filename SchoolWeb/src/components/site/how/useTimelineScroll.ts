"use client";

import { useEffect, type RefObject } from "react";
import { gsap, prefersReducedMotion } from "@/lib/site/gsap";
import { refreshScrollTriggers } from "@/lib/site/scroll";

/** The viewport line the fill's leading edge tracks. Nodes fire when they cross it. */
const EDGE = "62%";

/**
 * The timeline's scroll choreography.
 *
 * The fill is scrubbed from "track top at EDGE" to "track bottom at EDGE", so its
 * leading edge always sits on that same viewport line. Each node's trigger
 * uses the node's centre at EDGE, which means a node pops at the exact moment
 * the gradient reaches it. Its card slides in from its own side at the same time.
 */
export function useTimelineScroll(
  listRef: RefObject<HTMLOListElement | null>,
  fillRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    const list = listRef.current;
    const fill = fillRef.current;
    if (!list || !fill) return;

    if (prefersReducedMotion()) {
      gsap.set(fill, { scaleY: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        fill,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: fill.parentElement ?? list,
            start: `top ${EDGE}`,
            end: `bottom ${EDGE}`,
            scrub: 0.5,
          },
        },
      );

      const wide = window.matchMedia("(min-width: 1024px)").matches;

      list.querySelectorAll<HTMLElement>("[data-step]").forEach((step) => {
        const node = step.querySelector("[data-node]");
        const dot = step.querySelector("[data-dot]");
        const ring = step.querySelector("[data-ring]");
        const card = step.querySelector<HTMLElement>("[data-card]");
        if (!node || !dot || !ring || !card) return;

        const fromX = wide ? (card.dataset.side === "left" ? -70 : 70) : 40;
        gsap.set(card, { autoAlpha: 0, x: fromX });
        gsap.set(dot, { scale: 0.7 });

        const tl = gsap.timeline({
          paused: true,
          defaults: { overwrite: "auto" },
        });
        tl.to(dot, { scale: 1.18, duration: 0.22, ease: "power2.out" })
          .to(dot, {
            scale: 1,
            color: "#ffffff",
            backgroundColor: "#7b68ee",
            duration: 0.4,
            ease: "back.out(3)",
          })
          .fromTo(
            ring,
            { scale: 1, opacity: 0.55 },
            { scale: 2.3, opacity: 0, duration: 0.9, ease: "power2.out" },
            0.1,
          )
          .to(
            card,
            { autoAlpha: 1, x: 0, duration: 0.85, ease: "expo.out" },
            0.05,
          );

        gsap.timeline({
          scrollTrigger: {
            trigger: node,
            start: `center ${EDGE}`,
            onEnter: () => tl.play(),
            onLeaveBack: () => tl.reverse(),
          },
        });
      });
    }, list);

    refreshScrollTriggers();
    return () => ctx.revert();
  }, [listRef, fillRef]);
}
