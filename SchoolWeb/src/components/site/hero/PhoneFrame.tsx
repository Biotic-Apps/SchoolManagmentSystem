"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/site/cn";
import { ScreenMock, type ScreenVariant } from "@/components/site/mock/ScreenMock";

/** The width the screen is laid out at before it is scaled into the phone. */
const SCREEN_WIDTH = 390;

/**
 * A phone built from divs: rounded 32px body, a notch, and a real product
 * screen laid out at phone width and scaled to fit. The caller sets the width;
 * the height follows from the aspect ratio, and a ResizeObserver keeps the
 * screen's `zoom` matched to it. Zoom rather than a scale transform: a scaled
 * layer inside the 3D hero stack painted its unscaled box over the dashboard.
 */
export function PhoneFrame({
  variant = "parent",
  className,
}: {
  variant?: ScreenVariant;
  className?: string;
}) {
  const glass = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = glass.current;
    const inner = screen.current;
    if (!outer || !inner) return;
    const fit = () => {
      const scale = outer.clientWidth / SCREEN_WIDTH;
      inner.style.zoom = String(scale);
      inner.style.height = `${outer.clientHeight / scale}px`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(outer);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "relative aspect-[9/18.5] rounded-[18px] bg-[#1d1838] p-[4px] sm:rounded-[32px] sm:p-[6px]",
        "shadow-[0_2px_6px_rgb(42_31_107/0.12),0_36px_60px_-22px_rgb(42_31_107/0.55)]",
        className,
      )}
    >
      <div ref={glass} className="relative size-full overflow-hidden rounded-[14px] bg-white sm:rounded-[26px]">
        <div
          ref={screen}
          aria-hidden
          className="absolute left-0 top-0 pt-[18px]"
          style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 2, zoom: 0.4 }}
        >
          <ScreenMock variant={variant} />
        </div>
        <span className="absolute left-1/2 top-[4px] h-[8px] sm:top-[6px] sm:h-[12px] w-[34%] -translate-x-1/2 rounded-full bg-[#1d1838]" />
      </div>
    </div>
  );
}
