import { MoneyText } from "@/components/shared/MoneyText";
import { cn } from "@/lib/cn";

export interface AmountRow {
  label: string;
  amountMinor: number;
  /** Totals are bold and separated by a rule. */
  total?: boolean;
}

/** Label / amount rows with right-aligned money (payslips, salary structures). */
export function AmountList({ title, rows }: { title?: string; rows: AmountRow[] }) {
  return (
    <section className="flex flex-col gap-2">
      {title && <h3 className="text-label font-semibold text-fg">{title}</h3>}
      <dl className="flex flex-col">
        {rows.map((row, index) => (
          <div
            key={`${row.label}-${index}`}
            className={cn("flex items-baseline justify-between gap-4 py-1.5", row.total && "mt-1 border-t border-border pt-2.5")}
          >
            <dt className={cn("text-label", row.total ? "font-semibold text-fg" : "text-fg-muted")}>{row.label}</dt>
            <dd className={cn("text-right text-label text-fg", row.total && "font-semibold")}>
              <MoneyText amountMinor={row.amountMinor} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
