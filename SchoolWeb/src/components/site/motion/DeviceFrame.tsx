"use client";

import Image from "next/image";
import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { cn } from "@/lib/site/cn";
import { BRAND } from "@/lib/brand";
import { ScreenMock } from "@/components/site/mock/ScreenMock";
import {
  PRODUCT_VIDEO,
  SCREENSHOT_READY,
  SCREEN_ROUTES,
  screenSrc,
  type ScreenKey,
} from "@/lib/site/screens";

/** Below this, a layer is far enough from the playhead to stop being painted. */
const PAINT_THRESHOLD = 0.004;

/** Scrubbed from a parent's ScrollTrigger, once per frame. */
export type DeviceFrameHandle = {
  /** `progress` runs 0 → 1 across the whole run of screens. */
  setProgress: (progress: number) => void;
};

type DeviceFrameProps = {
  /** A single screen, or several the frame scrubs through. */
  screen?: ScreenKey;
  screens?: readonly ScreenKey[];
  /** Purple bloom behind the frame — used in the hero. */
  glow?: boolean;
  /** Light sweeping across the screen, as if it were glass. */
  glare?: boolean;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
};

function Screen({ screen, priority }: { screen: ScreenKey; priority: boolean }) {
  const [failed, setFailed] = useState(false);

  if (!SCREENSHOT_READY[screen] || failed) {
    return <ScreenMock variant={screen} />;
  }

  return (
    <Image
      src={screenSrc(screen)}
      alt={`${BRAND} ${screen} screen`}
      fill
      priority={priority}
      sizes="(max-width: 768px) 92vw, (max-width: 1280px) 60vw, 760px"
      className="object-cover object-top"
      onError={() => setFailed(true)}
    />
  );
}

/** Eased crossfade weight for a layer sitting `distance` frames from the playhead. */
function weight(distance: number) {
  const linear = Math.max(0, 1 - distance);
  // Smoothstep: holds each screen a little longer, then dissolves quickly —
  // the way a cut actually reads on screen, rather than a flat linear mix.
  return linear * linear * (3 - 2 * linear);
}

/**
 * A browser window containing the product.
 *
 * This is the only place a product screen is rendered anywhere on the site.
 *
 * When handed several screens it behaves like a strip of film: the parent
 * scrubs `setProgress` from its own ScrollTrigger and the layers dissolve
 * through one another continuously, so a reader stopped half-way sees a real
 * mid-transition frame rather than one of four fixed states. Layer styles are
 * written straight to the DOM rather than through React, because at sixty
 * frames a second a re-render per frame is the difference between smooth and
 * not — and for the same reason the **pointer tilt is written the same way**.
 * It used to run through `useState`, which meant re-rendering an entire mock
 * dashboard on every `mousemove`.
 *
 * Layers far from the playhead are switched to `visibility: hidden` rather than
 * left at `opacity: 0`. A transparent layer is still painted and still composited;
 * a hidden one is skipped outright, and with four dense screens per device and
 * thirteen devices on the page that is most of the paint work on the site.
 *
 * If a screen recording is supplied (`PRODUCT_VIDEO.ready`), the same scrub
 * drives `currentTime` on a real `<video>` instead, and everything else here
 * stays exactly as it is.
 */
export const DeviceFrame = forwardRef<DeviceFrameHandle, DeviceFrameProps>(function DeviceFrame(
  {
    screen,
    screens,
    glow = false,
    glare = false,
    className,
    style,
    priority = false,
  },
  ref,
) {
  const layerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const urlRef = useRef<HTMLSpanElement>(null);

  // Memoised so the imperative handle is not rebuilt on every render — it is
  // called once per animation frame and must stay stable.
  const list = useMemo<readonly ScreenKey[]>(
    () => screens ?? (screen ? [screen] : ["dashboard"]),
    [screens, screen],
  );
  const useVideo = PRODUCT_VIDEO.ready && list.length > 1;

  useImperativeHandle(
    ref,
    () => ({
      setProgress(progress) {
        const clamped = Math.min(Math.max(progress, 0), 1);

        if (useVideo) {
          const video = videoRef.current;
          if (video?.duration) video.currentTime = video.duration * clamped;
          return;
        }

        const last = list.length - 1;
        const playhead = clamped * last;

        layerRefs.current.forEach((layer, index) => {
          if (!layer) return;
          const distance = Math.abs(playhead - index);
          const opacity = weight(distance);
          const painted = opacity > PAINT_THRESHOLD;

          layer.style.visibility = painted ? "visible" : "hidden";
          // `will-change` is a standing request for a compositor layer, so it is
          // granted only to the one or two screens actually dissolving.
          layer.style.willChange = painted ? "opacity, transform" : "auto";
          if (!painted) return;

          layer.style.opacity = String(opacity);
          // Fading layers drift back very slightly, which reads as depth rather
          // than as two flat pictures swapping over.
          layer.style.transform = `scale(${1 + (1 - opacity) * 0.03})`;
          layer.style.zIndex = String(Math.round(opacity * 100));
        });

        // The address bar follows the nearest screen, written directly for the
        // same reason as the layers.
        const nearest = Math.round(playhead);
        const url = SCREEN_ROUTES[list[nearest]];
        if (urlRef.current && urlRef.current.textContent !== url) {
          urlRef.current.textContent = url;
        }
      },
    }),
    [list, useVideo],
  );

  return (
    <div className={cn("stage-3d relative", className)} style={style}>
      {glow ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-16 -inset-y-12 -z-10 rounded-[4rem] bg-brand-400/18 blur-[80px]"
        />
      ) : null}

      <div
        className={cn(
          "preserve-3d overflow-hidden rounded-panel border border-line bg-surface",
          "shadow-[var(--shadow-device)]",
        )}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-line bg-surface-sunken px-3 py-2.5 sm:px-4">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-brand-400" />
          </div>
          <div className="mx-auto flex max-w-[62%] items-center gap-1.5 truncate rounded-full bg-surface px-3 py-1 text-[0.62rem] text-faint ring-1 ring-line sm:text-[0.7rem]">
            <span className="size-1.5 shrink-0 rounded-full bg-brand-500" />
            <span ref={urlRef} className="truncate">
              {SCREEN_ROUTES[list[0]]}
            </span>
          </div>
        </div>

        {/* Screen.
            `aria-hidden` covers the whole stack: these are pictures of the
            product, and a screen reader announcing four rebuilt dashboards —
            headings, table rows and all — buries the page's real copy. */}
        <div
          aria-hidden
          className={cn(
            "relative aspect-[16/10] w-full overflow-hidden bg-white [contain:content]",
            glare && "glare",
          )}
        >
          {useVideo ? (
            <video
              ref={videoRef}
              src={PRODUCT_VIDEO.src}
              muted
              playsInline
              preload="auto"
              className="size-full object-cover object-top"
            />
          ) : (
            list.map((key, index) => (
              <div
                key={`${key}-${index}`}
                ref={(node) => {
                  layerRefs.current[index] = node;
                }}
                className="absolute inset-0"
                style={{
                  // The first screen holds the frame until a scrub arrives; the
                  // rest wait behind it, unpainted rather than merely invisible.
                  opacity: index === 0 ? 1 : 0,
                  visibility: index === 0 ? "visible" : "hidden",
                  zIndex: index === 0 ? 100 : 0,
                }}
              >
                <Screen screen={key} priority={priority && index === 0} />
              </div>
            ))
          )}
          {/* The screens are cropped, not scaled down; fade the cut edge so no
              row ends half-drawn against the frame. Above the layers (z ≤ 100). */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[101] h-[16%] bg-gradient-to-b from-white/0 via-white/70 to-white" />
        </div>
      </div>
    </div>
  );
});
