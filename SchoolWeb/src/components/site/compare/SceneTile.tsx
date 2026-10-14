import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/site/cn";

/** A handwriting stack that every platform has some member of. */
export const HAND: CSSProperties = {
  fontFamily: "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', 'Chalkboard SE', cursive",
};

/**
 * One of the four cells of a scene. Both scenes use the same cell sizes so the
 * paper item and its eSchool twin line up exactly under the slider handle.
 */
export function SceneTile({
  tone,
  children,
  className,
}: {
  tone: "paper" | "app";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-[112px] rounded-xl p-3.5 sm:min-h-[132px] sm:p-4",
        tone === "paper"
          ? "bg-[#fdf8ea] shadow-[0_1px_0_#e3d6b4,0_8px_18px_-10px_rgb(80_60_20/0.45)] ring-1 ring-[#e3d6b4]"
          : "bg-white shadow-soft ring-1 ring-line",
        className,
      )}
    >
      {children}
    </div>
  );
}
