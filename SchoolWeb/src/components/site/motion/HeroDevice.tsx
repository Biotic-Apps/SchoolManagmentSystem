"use client";

import { useEffect, useRef } from "react";
import { DeviceFrame } from "@/components/site/motion/DeviceFrame";
import { gsap, prefersReducedMotion } from "@/lib/site/gsap";
import { refreshScrollTriggers } from "@/lib/site/scroll";

/** How far back the device lies before it is scrolled upright, in degrees. */
const START_PITCH = 64;
const MOUSE_TILT = 9;

/**
 * The hero device, lying back like a tablet on a desk and rising to face the
 * reader as they scroll, then drifting away again as the hero ends.
 *
 * Both stages live on **one scrubbed timeline**. Two separate scrubbed tweens
 * animating the same properties fight each other — GSAP keeps both live and
 * whichever renders last wins, so the stand-up gets cancelled out and almost
 * nothing appears to happen. A timeline sequences them instead.
 *
 * The scroll rotation and the pointer tilt are kept on separate elements for
 * the same reason: composing both onto one transform means one overwrites the
 * other. Nesting lets the browser multiply them together.
 *
 * Pointer tilt goes through `gsap.quickTo`, which eases towards the target
 * instead of snapping, so the device feels weighted rather than glued to the
 * cursor.
 */
export function HeroDevice() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pitchRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const pitch = pitchRef.current;
    const tilt = tiltRef.current;
    if (!wrap || !pitch || !tilt) return;

    if (prefersReducedMotion()) {
      gsap.set(pitch, { rotateX: 0, y: 0, scale: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: "top 95%",
          end: "bottom top",
          scrub: 0.85,
        },
      });

      timeline
        // Lying back and low, rising to upright and full size.
        // Starts only modestly low: the whole point of the hero is that the
        // software is already visible before the first scroll.
        .fromTo(
          pitch,
          { rotateX: START_PITCH, rotateZ: -3, y: 40, scale: 0.86 },
          { rotateX: 0, rotateZ: 0, y: 0, scale: 1, ease: "none", duration: 0.6 },
        )
        // Then tipping away again as the hero scrolls off.
        .to(
          pitch,
          { rotateX: -14, y: -70, scale: 0.94, ease: "none", duration: 0.4 },
        );

      // A pointer tilt is meaningless without a pointer, so a touch device gets
      // neither the listeners nor the work behind them.
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

      const toX = gsap.quickTo(tilt, "rotateX", { duration: 0.7, ease: "power3" });
      const toY = gsap.quickTo(tilt, "rotateY", { duration: 0.7, ease: "power3" });

      // The frame's box is cached rather than re-read per event. Calling
      // `getBoundingClientRect` inside `mousemove` forces a synchronous layout
      // on every event the OS delivers — and the device is being transformed by
      // a scrubbed timeline at the same time, so that layout is never cheap.
      // It is invalidated when anything that could move the frame happens.
      let bounds: DOMRect | null = null;
      const invalidate = () => {
        bounds = null;
      };

      const onMove = (event: Event) => {
        const mouse = event as MouseEvent;
        if (!bounds) bounds = wrap.getBoundingClientRect();
        const px = (mouse.clientX - bounds.left) / bounds.width - 0.5;
        const py = (mouse.clientY - bounds.top) / bounds.height - 0.5;
        toX(-py * MOUSE_TILT * 2);
        toY(px * MOUSE_TILT * 2);
      };

      const onLeave = () => {
        invalidate();
        toX(0);
        toY(0);
      };

      // Listening on the whole hero, not just the frame, so the device reacts
      // before the pointer reaches it.
      const hero = wrap.closest("section") ?? wrap;
      hero.addEventListener("mousemove", onMove);
      hero.addEventListener("mouseleave", onLeave);
      window.addEventListener("scroll", invalidate, { passive: true });
      window.addEventListener("resize", invalidate);

      return () => {
        hero.removeEventListener("mousemove", onMove);
        hero.removeEventListener("mouseleave", onLeave);
        window.removeEventListener("scroll", invalidate);
        window.removeEventListener("resize", invalidate);
      };
    }, wrap);

    // Layout settles after the webfonts swap in; without this the trigger points
    // are measured against the fallback face and end up stale.
    refreshScrollTriggers();

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} className="stage-3d relative mx-auto max-w-5xl">
      <div ref={pitchRef} className="preserve-3d will-change-transform">
        <div ref={tiltRef} className="preserve-3d">
          <DeviceFrame screen="dashboard" glow glare priority />
        </div>
      </div>

      {/* Contact shadow — grounds the device instead of letting it float. */}
      <div
        aria-hidden
        className="mx-auto mt-8 h-8 w-[70%] rounded-[50%] bg-slate-900/12 blur-2xl"
      />
    </div>
  );
}
