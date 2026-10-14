import { FileDown, Palette, Printer, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/site/motion/Reveal";
import { PRINT_DOCS_COPY } from "@/lib/site/content";

const ICONS: Record<(typeof PRINT_DOCS_COPY.points)[number]["icon"], LucideIcon> = {
  pdf: FileDown,
  brand: Palette,
  bulk: Printer,
};

/** The three short promises beside the documents. */
export function PrintPoints() {
  return (
    <ul className="mt-9 space-y-5">
      {PRINT_DOCS_COPY.points.map((p, i) => {
        const Icon = ICONS[p.icon];
        return (
          <Reveal as="li" key={p.title} delay={0.1 + i * 0.08} className="flex gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
              <Icon className="size-[1.15rem]" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <h3 className="text-[1rem] font-semibold tracking-[-0.01em] text-foreground">{p.title}</h3>
              <p className="mt-1 text-[0.95rem] leading-[1.6] text-muted">{p.body}</p>
            </div>
          </Reveal>
        );
      })}
    </ul>
  );
}
