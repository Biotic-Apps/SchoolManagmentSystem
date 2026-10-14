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
