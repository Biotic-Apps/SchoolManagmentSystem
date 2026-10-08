import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface FormPanelProps {
  /** Anchor for links such as "#teachers". */
  id?: string;
  title: string;
  description?: string;
  /** Small action on the right of the heading. */
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Light bordered panel grouping related fields, with a small heading and helper text. */
export function FormPanel({ id, title, description, actions, className, children }: FormPanelProps) {
  return (
    <section id={id} className={cn("flex scroll-mt-24 flex-col gap-4 rounded-card border border-border bg-surface p-4 sm:p-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="flex flex-col gap-1">
          <h3 className="text-body font-semibold text-fg">{title}</h3>
          {description && <p className="text-caption text-fg-muted">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
