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
 * screen's scale matched to it.
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
      inner.style.transform = `scale(${scale})`;
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
        "relative aspect-[9/18.5] rounded-[32px] bg-[#1d1838] p-[6px]",
        "shadow-[0_2px_6px_rgb(42_31_107/0.12),0_36px_60px_-22px_rgb(42_31_107/0.55)]",
        className,
      )}
    >
      <div ref={glass} className="relative size-full overflow-hidden rounded-[26px] bg-white">
        <div
          ref={screen}
          aria-hidden
          className="absolute left-0 top-0 origin-top-left pt-[18px]"
          style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 2, transform: "scale(0.4)" }}
        >
          <ScreenMock variant={variant} />
        </div>
        <span className="absolute left-1/2 top-[6px] h-[12px] w-[34%] -translate-x-1/2 rounded-full bg-[#1d1838]" />
      </div>
    </div>
  );
}
