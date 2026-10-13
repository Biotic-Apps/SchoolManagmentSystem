import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Placeholder block with a soft left-to-right shimmer (a still tint under reduced motion). */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-md bg-[linear-gradient(90deg,#EDE9FE_0%,#EDE9FE_35%,#F5F3FF_50%,#EDE9FE_65%,#EDE9FE_100%)] bg-[length:200%_100%] animate-shimmer motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}
