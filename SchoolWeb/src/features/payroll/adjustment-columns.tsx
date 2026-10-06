import type { DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { EMPTY_VALUE } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import { ADJUSTMENT_KIND_LABEL, ADJUSTMENT_KIND_TONE } from "./options";
import type { PayrollAdjustment } from "./types";

export function adjustmentColumns(nameOf: (staffId: string) => string | undefined): DataTableColumn<PayrollAdjustment>[] {
  return [
    {
      id: "staff",
      header: "Staff",
      className: "min-w-44",
      cell: (row) => <span className="font-medium">{row.staff?.name ?? row.staffName ?? nameOf(row.staffId) ?? EMPTY_VALUE}</span>,
    },
    {
      id: "kind",
      header: "Kind",
      className: "whitespace-nowrap",
      cell: (row) => <Badge tone={ADJUSTMENT_KIND_TONE[row.kind] ?? "neutral"}>{ADJUSTMENT_KIND_LABEL[row.kind] ?? row.kind}</Badge>,
    },
    {
      id: "amount",
      header: "Amount",
      className: cn(NUMERIC_COLUMN, "whitespace-nowrap"),
      cell: (row) => <MoneyText amountMinor={row.amountMinor} />,
    },
    { id: "reason", header: "Reason", className: "min-w-56", cell: (row) => <span className="text-fg-muted">{row.reason}</span> },
  ];
}
