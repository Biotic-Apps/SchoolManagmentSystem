import type { ReactNode } from "react";
import { cn } from "@/lib/site/cn";

type BadgeProps = {
  children: ReactNode;
  tone?: "brand" | "neutral" | "soon";
  className?: string;
};

const tones = {
  brand: "bg-brand-50 text-brand-700 ring-brand-200",
  neutral: "bg-surface-sunken text-muted ring-line",
  soon: "bg-tile-indigo/10 text-tile-indigo ring-tile-indigo/25",
} as const;

export function Badge({ children, tone = "brand", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * The small label above a heading: a soft pill with a live, pulsing dot.
 * `onDark` swaps to a frosted white pill for the purple bands.
 */
export function EyebrowPill({
  children,
  onDark = false,
  className,
}: {
  children: ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] ring-1 ring-inset",
        onDark
          ? "bg-white/10 text-white ring-white/20 backdrop-blur-sm"
          : "bg-surface text-brand-700 ring-brand-200 shadow-[0_6px_18px_-10px_rgb(123_104_238/0.6)]",
        className,
      )}
    >
      <span aria-hidden className="relative flex size-1.5">
        <span
          className={cn(
            "absolute inline-flex size-full animate-ping rounded-full opacity-70",
            onDark ? "bg-white" : "bg-brand-400",
          )}
        />
        <span
          className={cn(
            "relative inline-flex size-1.5 rounded-full",
            onDark ? "bg-white" : "bg-brand-500",
          )}
        />
      </span>
      {children}
    </span>
  );
}
