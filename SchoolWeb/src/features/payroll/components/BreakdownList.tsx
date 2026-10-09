import { MoneyText } from "@/components/shared/MoneyText";
import { cn } from "@/lib/cn";
import type { BreakdownItem } from "../types";

interface BreakdownListProps {
  title: string;
  items: BreakdownItem[];
  totalLabel: string;
  totalMinor: number;
  /** Deductions read in the error colour. */
  negative?: boolean;
  emptyText: string;
}

/** Payslip rows with the working under each label and a bold total. */
export function BreakdownList({ title, items, totalLabel, totalMinor, negative, emptyText }: BreakdownListProps) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-label font-semibold text-fg">{title}</h3>
      <ul className="flex flex-col">
        {items.length === 0 && <li className="py-1.5 text-label text-fg-muted">{emptyText}</li>}
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-start justify-between gap-4 py-1.5">
            <span className="flex min-w-0 flex-col">
              <span className="text-label text-fg">{item.label}</span>
              {item.note && <span className="text-caption text-fg-muted">{item.note}</span>}
            </span>
            <MoneyText amountMinor={item.amountMinor} className={cn("shrink-0 text-label", negative && "text-error")} />
          </li>
        ))}
        <li className="mt-1 flex items-baseline justify-between gap-4 border-t border-border pt-2.5">
          <span className="text-label font-semibold text-fg">{totalLabel}</span>
          <MoneyText amountMinor={totalMinor} className={cn("text-label font-semibold", negative && "text-error")} />
        </li>
      </ul>
    </section>
  );
}
