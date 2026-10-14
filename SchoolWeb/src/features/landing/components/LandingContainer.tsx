import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Page-width wrapper for every landing section: 1200px max, 16px phone gutter. */
export function LandingContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}
