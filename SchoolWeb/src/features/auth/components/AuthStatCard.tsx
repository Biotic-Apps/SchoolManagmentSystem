import type { CSSProperties } from "react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";

const BARS = [62, 78, 70, 88, 82, 96];

/** Decorative floating glass card on the sign-in panel: a small "attendance today" chart. */
export function AuthStatCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "w-56 rounded-2xl bg-white/[0.12] p-4 text-white shadow-[0_20px_40px_-12px_rgb(20_10_60/0.45)] ring-1 ring-inset ring-white/20 backdrop-blur-md",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-caption text-white/75">Attendance today</span>
        <span className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold">
          <TrendingUp className="size-3" />
          +2%
        </span>
      </div>
      <p className="mt-1 text-[28px] font-bold leading-9">96%</p>
      <div className="mt-3 flex h-12 items-end gap-1.5">
        {BARS.map((height, index) => (
          <span
            key={index}
            style={{ height: `${height}%`, "--bar-delay": `${400 + index * 90}ms` } as CSSProperties}
            className={cn(
              "animate-bar-grow flex-1 rounded-t-md",
              index === BARS.length - 1 ? "bg-white" : "bg-white/35",
            )}
          />
        ))}
      </div>
    </div>
  );
}
