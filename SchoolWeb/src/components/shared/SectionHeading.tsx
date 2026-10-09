import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  title: string;
  /** One line under the title. */
  description?: string;
  actions?: ReactNode;
  id?: string;
  /** 2 for page sections (card-title size), 3 for blocks inside a card or drawer. */
  level?: 2 | 3;
  className?: string;
}

export function SectionHeading({ title, description, actions, id, level = 3, className }: SectionHeadingProps) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <div className={cn("flex items-end justify-between gap-3", className)}>
      <div className="flex min-w-0 flex-col gap-0.5">
        <Heading
          id={id}
          className={cn(
            "font-semibold text-fg",
            level === 2 ? "text-card-title tracking-[-0.01em]" : "text-body",
          )}
        >
          {title}
        </Heading>
        {description && <p className="text-caption text-fg-muted">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
