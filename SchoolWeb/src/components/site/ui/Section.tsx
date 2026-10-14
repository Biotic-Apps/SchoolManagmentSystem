import type { ReactNode } from "react";
import { cn } from "@/lib/site/cn";

type SectionProps = {
  id?: string;
  children: ReactNode;
  /** `sunken` gives the alternating band that separates feature blocks. */
  tone?: "base" | "sunken";
  className?: string;
  /** Skip the max-width wrapper when a section needs to bleed to the edges. */
  bleed?: boolean;
};

export function Section({ id, children, tone = "base", className, bleed = false }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-24 sm:py-28 lg:py-32",
        tone === "sunken" && "bg-surface-sunken",
        className,
      )}
    >
      {bleed ? children : <div className="mx-auto max-w-7xl px-5 sm:px-8">{children}</div>}
    </section>
  );
}
