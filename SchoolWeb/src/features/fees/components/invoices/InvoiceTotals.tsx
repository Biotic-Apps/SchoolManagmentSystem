import { MoneyText } from "@/components/shared/MoneyText";
import { cn } from "@/lib/cn";
import type { Invoice } from "../../types";

interface TotalRow {
  label: string;
  amountMinor: number;
  strong?: boolean;
}

export function InvoiceTotals({ invoice }: { invoice: Invoice }) {
  const rows: TotalRow[] = [
    ...(invoice.concessionMinor ? [{ label: "Concession", amountMinor: -invoice.concessionMinor }] : []),
    ...(invoice.siblingDiscountMinor ? [{ label: "Sibling discount", amountMinor: -invoice.siblingDiscountMinor }] : []),
    ...(invoice.lateFeeMinor ? [{ label: "Late fee", amountMinor: invoice.lateFeeMinor }] : []),
    { label: "Total", amountMinor: invoice.totalMinor, strong: true },
    { label: "Paid", amountMinor: invoice.paidMinor },
    { label: "Balance", amountMinor: invoice.balanceMinor, strong: true },
  ];

  return (
    <dl className="ml-auto flex w-full max-w-xs flex-col gap-2 text-label">
      {rows.map((row) => (
        <div
          key={row.label}
          className={cn("flex items-center justify-between gap-4", row.strong && "border-t border-border pt-2 font-semibold text-fg")}
        >
          <dt className={cn(!row.strong && "text-fg-muted")}>{row.label}</dt>
          <dd className="text-right">
            <MoneyText amountMinor={row.amountMinor} currency={invoice.currency} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
