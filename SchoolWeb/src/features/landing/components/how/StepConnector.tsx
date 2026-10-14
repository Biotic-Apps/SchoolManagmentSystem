import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Dashed line linking the step badges. A mask drawn with stroke-dashoffset reveals it once an
 * ancestor <Reveal> sets data-shown. Reduced motion → appears without the draw.
 */
export function StepConnector({ orientation, className }: { orientation: "horizontal" | "vertical"; className?: string }) {
  const id = useId().replace(/:/g, "");
  const horizontal = orientation === "horizontal";
  const [x2, y2] = horizontal ? [100, 5] : [5, 100];
  const [x1, y1] = horizontal ? [0, 5] : [5, 0];
  const gradientId = `${id}-g`;
  const maskId = `${id}-m`;

  return (
    <svg
      className={cn("pointer-events-none absolute overflow-visible", className)}
      viewBox={horizontal ? "0 0 100 10" : "0 0 10 100"}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2={horizontal ? "1" : "0"} y2={horizontal ? "0" : "1"}>
          <stop offset="0%" stopColor="#7B68EE" />
          <stop offset="60%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#FB7185" />
        </linearGradient>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="white"
            strokeWidth="30"
            pathLength={1}
            strokeDasharray="1 1"
            className="[stroke-dashoffset:1] transition-[stroke-dashoffset] duration-[1800ms] ease-out in-data-shown:[stroke-dashoffset:0] motion-reduce:transition-none"
            style={{ transitionDelay: "300ms" }}
          />
        </mask>
      </defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#DDD6FE" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={`url(#${gradientId})`}
        strokeWidth="2.5"
        strokeDasharray="6 8"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}
