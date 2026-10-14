import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/site/cn";

/** A static fibre texture, drawn once by the browser and never animated. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.16 0 0 0 0 0.12 0 0 0 0 0.42 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

type PaperProps = {
  width: number;
  height: number;
  children: ReactNode;
  className?: string;
  /** Accessible summary: the paper's tiny print is decorative. */
  label: string;
};

/** A sheet of white paper with a faint grain and a soft, layered shadow. */
export function Paper({ width, height, children, className, label }: PaperProps) {
  const style: CSSProperties = { width, height, backgroundImage: GRAIN };
  return (
    <div
      role="img"
      aria-label={label}
      style={style}
      className={cn(
        "relative overflow-hidden rounded-[4px] bg-white text-[#1f2037] shadow-[0_1px_1px_rgb(42_31_107/0.06),0_2px_6px_rgb(42_31_107/0.06),0_18px_40px_-18px_rgb(42_31_107/0.35)] ring-1 ring-black/[0.04]",
        className,
      )}
    >
      <div aria-hidden className="h-full w-full">
        {children}
      </div>
    </div>
  );
}
