import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { cardInteractive, cardSelected, cardSurface } from "./styles";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Hover lift + teal border tint — only for cards that are (or wrap) a link/button. */
  interactive?: boolean;
  /** Mint fill with a teal border. */
  selected?: boolean;
}

type DivProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, interactive, selected, ...props }: CardProps) {
  return (
    <div
      className={cn(cardSurface, "min-w-0", interactive && cardInteractive, selected && cardSelected, className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: DivProps) {
  return <div className={cn("flex flex-col gap-1 px-5 pt-5 sm:px-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-card-title font-semibold tracking-[-0.01em] text-fg", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-label text-fg-muted", className)} {...props} />;
}

export function CardContent({ className, ...props }: DivProps) {
  return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}
