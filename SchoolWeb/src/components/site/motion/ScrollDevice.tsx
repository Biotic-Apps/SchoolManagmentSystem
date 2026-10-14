"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/site/cn";
import { DeviceFrame, type DeviceFrameHandle } from "@/components/site/motion/DeviceFrame";
import { SectionHeading } from "@/components/site/ui/SectionHeading";
import { gsap, prefersReducedMotion } from "@/lib/site/gsap";
import { refreshScrollTriggers } from "@/lib/site/scroll";
import type { ScreenKey } from "@/lib/site/screens";

/** Rotation sweep across the section, in degrees, and the Z travel in pixels. */
const YAW = 22;
const PITCH = 10;
const DEPTH = 120;

export type ScrollPoint = { title: string; body: string };

type ScrollDeviceProps = {
  id?: string;
  eyebrow: string;
  title: string;
  body: string;
  points: ScrollPoint[];
  /** The frame scrubs continuously through these as the section is read. */
  screens: readonly ScreenKey[];
  tone?: "base" | "sunken";
  /** Put the device on the left instead of the right. */
  reverse?: boolean;
  /** Extra classes on the section, e.g. a rule where two bands of one tone meet. */
  className?: string;
};

/**
 * The site's signature block: the device stays put while the reader moves
 * through the points beside it, rotating in 3D and running through the screens
 * as it goes.
 *
 * Everything here is scrubbed against scroll position rather than triggered at
 * thresholds. That is the whole point — the screen is not swapping at four
 * fixed marks, it is being played through at whatever speed the reader scrolls,
 * forwards or backwards, exactly like dragging the playhead of a video. Stopping
 * half-way leaves you on a real half-way frame.
 *
 * Stickiness is CSS `position: sticky`, not a GSAP pin. Pinning rewrites the
 * document height, which fights Lenis and breaks on resize; sticky does not.
 */
export function ScrollDevice({
  id,
  eyebrow,
  title,
  body,
  points,
  screens,
  tone = "base",
  reverse = false,
  className,
}: ScrollDeviceProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  /** The sticky column on desktop; below `lg`, simply the device's own block. */
  const stickRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<DeviceFrameHandle>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const device = deviceRef.current;
    const stick = stickRef.current;
    if (!section || !device || !stick) return;

    const reduced = prefersReducedMotion();
    const lastScreen = screens.length - 1;

    // The scrub has to be measured against whatever is actually holding the
    // device on screen, and that is a different element at each size.
    //
    // On desktop the device is sticky for the height of the points list, so the
    // section — metres tall — is the right range. Below `lg` it is not sticky:
    // it scrolls past like anything else. Measuring against the section there
    // meant three of the four screens dissolved through one another long after
    // the frame had left the top of the screen, so a phone only ever saw screen
    // one of four. Below `lg` the range is the device's own pass through the
    // viewport instead, which is the stretch someone is actually looking at it.
    const media = gsap.matchMedia();

    const runScrub = (trigger: Element, start: string, end: string) => {
      // One playhead for the whole block. Tweening a plain object gives us
      // GSAP's smoothed scrub, which a bare ScrollTrigger `onUpdate` does not.
      const playhead = { progress: 0 };

      gsap.to(playhead, {
        progress: 1,
        ease: "none",
        scrollTrigger: { trigger, start, end, scrub: reduced ? true : 0.55 },
        onUpdate: () => {
          frameRef.current?.setProgress(playhead.progress);
          const nearest = Math.round(playhead.progress * lastScreen);
          setActive((previous) => (previous === nearest ? previous : nearest));
        },
      });
    };

    media.add("(min-width: 1024px)", () => {
      runScrub(section, "top 68%", "bottom 62%");

      // The frame itself turns through the same stretch of scroll. Skipped for
      // reduced motion — but the screens above still run, because those are
      // content, not decoration.
      if (reduced) return;
      gsap.fromTo(
        device,
        { rotateY: reverse ? -YAW : YAW, rotateX: PITCH, z: -DEPTH, y: 36, scale: 0.92 },
        {
          rotateY: reverse ? YAW * 0.55 : -YAW * 0.55,
          rotateX: -PITCH * 0.4,
          z: DEPTH * 0.3,
          y: -20,
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top 82%", end: "bottom 28%", scrub: 0.7 },
        },
      );
    });

    media.add("(max-width: 1023.98px)", () => {
      // The device's own pass through the viewport, so all four screens are
      // spent while it is actually being looked at.
      runScrub(stick, "top 88%", "bottom 12%");

      // A much smaller turn on a phone: a 22° yaw on a 330px-wide frame throws
      // the far edge far enough back to blur the type it is meant to show off.
      if (reduced) return;
      gsap.fromTo(
        device,
        { rotateY: reverse ? -YAW * 0.3 : YAW * 0.3, y: 20, scale: 0.96 },
        {
          rotateY: 0,
          y: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: stick, start: "top 90%", end: "top 45%", scrub: 0.7 },
        },
      );
    });

    refreshScrollTriggers();

    return () => media.revert();
  }, [reverse, screens.length]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={cn(
        "py-24 sm:py-28 lg:py-32",
        // The frame is rotated in 3D and pushed forward on Z. That does not
        // affect layout, but it does add to the scrollable area, which is enough
        // to put a horizontal scrollbar on the page at around 1024px where the
        // column is at its tightest. `clip` rather than `hidden`: `hidden` would
        // make this a scroll container and kill the sticky column inside it.
        "overflow-x-clip",
        tone === "sunken" && "bg-surface-sunken",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow={eyebrow} title={title} body={body} />

        <div
          className={cn(
            "mt-12 grid gap-10 lg:mt-20 lg:grid-cols-2 lg:gap-16",
            reverse && "lg:[&>*:first-child]:order-2",
          )}
        >
          {/* Points — each block is tall enough to hold the device in place.
              Ordered second on small screens so the product is seen before it
              is described; on desktop the sticky device takes that job. */}
          <ol className="order-2 space-y-8 lg:order-none lg:space-y-0">
            {points.map((point, index) => (
              <li key={point.title} className="lg:flex lg:min-h-[calc(58*var(--vh))] lg:items-center">
                <div
                  className={cn(
                    "border-l-2 pl-6 transition-[border-color,opacity] duration-500",
                    active === index
                      ? "border-brand-500 opacity-100"
                      : "border-line lg:opacity-45",
                  )}
                >
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] tabular-nums text-brand-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 text-[1.3rem] font-semibold tracking-[-0.02em] sm:text-[1.5rem]">
                    {point.title}
                  </h3>
                  <p className="mt-3 max-w-md text-pretty leading-[1.65] text-muted">
                    {point.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {/* Device — sticks through the whole block from `lg` up. The offset is
              a fixed length, not a percentage: a percentage `top` on a sticky
              element resolves against the containing block, which here is metres
              tall. It reads from the header's own variable so the two can never
              drift apart. */}
          <div
            ref={stickRef}
            className="order-1 lg:order-none lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:h-fit lg:self-start"
          >
            <div className="stage-3d">
              <div ref={deviceRef} className="preserve-3d will-change-transform">
                <DeviceFrame ref={frameRef} screens={screens} glare />
              </div>
              <div
                aria-hidden
                className="mx-auto mt-5 h-7 w-[66%] rounded-[50%] bg-slate-900/10 blur-2xl"
              />
            </div>

            {/* Playhead — a scrub bar, because that is what this now is. */}
            <div className="mt-7 flex items-center gap-2">
              {points.map((point, index) => (
                <span
                  key={point.title}
                  className={cn(
                    "h-0.5 flex-1 rounded-full transition-colors duration-300",
                    active >= index ? "bg-brand-500" : "bg-line",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
