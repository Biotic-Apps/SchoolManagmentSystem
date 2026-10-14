"use client";

import { FileText, Award, IdCard, Receipt, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/site/cn";
import { PRINT_DOCS_COPY } from "@/lib/site/content";
import { DOCS, type DocId } from "./registry";

const ICONS: Record<DocId, LucideIcon> = { report: FileText, challan: Receipt, certificate: Award, id: IdCard };

type DocChipsProps = { active: DocId | null; onSelect: (id: DocId) => void; className?: string };

/** The row of chips that brings one document to the front. */
export function DocChips({ active, onSelect, className }: DocChipsProps) {
  return (
    <div role="group" aria-label={PRINT_DOCS_COPY.tabsLabel} className={cn("flex flex-wrap justify-center gap-2", className)}>
      {DOCS.map(({ id }) => {
        const Icon = ICONS[id];
        const on = active === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.82rem] font-medium ring-1 ring-inset transition-colors duration-200 focus-visible:outline-none focus-visible:shadow-[var(--shadow-glow)]",
              on ? "bg-brand-500 text-white ring-brand-500" : "bg-white text-muted ring-line hover:text-foreground hover:ring-line-strong",
            )}
          >
            <Icon className="size-4" strokeWidth={2} aria-hidden />
            {PRINT_DOCS_COPY.tabs[id]}
          </button>
        );
      })}
    </div>
  );
}
