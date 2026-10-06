import type { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Titled block inside a long multi-section form. */
export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="flex flex-col gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-body font-semibold text-fg">{title}</h3>
        {description && <p className="text-caption text-fg-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}
