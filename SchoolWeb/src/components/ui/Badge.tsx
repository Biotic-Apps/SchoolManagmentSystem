import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-caption font-medium ring-1 ring-inset",
  {
    variants: {
      tone: {
        neutral: "bg-background text-fg-muted ring-border",
        primary: "bg-selected text-on-selected ring-primary/20",
        success: "bg-success-soft text-success ring-success/20",
        warning: "bg-warning-soft text-warning ring-warning/20",
        error: "bg-error-soft text-error ring-error/20",
        info: "bg-info-soft text-info ring-info/20",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  /** Leading status dot in the tone colour. */
  dot?: boolean;
}

export function Badge({ className, tone, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </span>
  );
}
