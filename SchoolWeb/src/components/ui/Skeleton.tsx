import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Placeholder block with a soft left-to-right shimmer (a still tint under reduced motion). */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-md bg-[linear-gradient(90deg,#e9f1ef_0%,#e9f1ef_35%,#f6faf9_50%,#e9f1ef_65%,#e9f1ef_100%)] bg-[length:200%_100%] animate-shimmer motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}
