import type { ReactNode } from "react";

export function SectionHeading({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-body font-semibold text-fg">{title}</h3>
      {actions}
    </div>
  );
}
