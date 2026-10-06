import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { formatDate, textOrDash } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import { minor } from "../amounts";
import { methodLabel } from "../options";
import type { ExpensePayment } from "../types";

const COLUMNS: DataTableColumn<ExpensePayment>[] = [
  { id: "paidOn", header: "Paid on", className: "whitespace-nowrap", cell: (row) => formatDate(row.paidOn) },
  { id: "method", header: "Method", className: "whitespace-nowrap", cell: (row) => methodLabel(row.method) },
  { id: "reference", header: "Reference", cell: (row) => textOrDash(row.reference) },
  {
    id: "amount",
    header: "Amount",
    className: NUMERIC_COLUMN,
    cell: (row) => <MoneyText amountMinor={minor(row.amountMinor)} />,
  },
];

export function ExpensePayments({ payments }: { payments: ExpensePayment[] }) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={payments}
      getRowId={(row) => row.id}
      emptyTitle="No payments yet"
      emptyDescription="Payments can be recorded once the expense is approved."
    />
  );
}
