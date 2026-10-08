import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** One cell of a setup row: labelled on phones, a plain grid cell under the column header on wider screens. */
interface SetupCellProps {
  label: string;
  /** The control names itself; keep the label for screen readers only. */
  hideLabel?: boolean;
  className?: string;
  children: ReactNode;
}

export function SetupCell({ label, hideLabel, className, children }: SetupCellProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className={cn("text-caption font-medium text-fg-muted md:sr-only", hideLabel && "sr-only")}>{label}</span>
      {children}
    </div>
  );
}
