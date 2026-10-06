import type { DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/format";
import { formatPeriod } from "@/lib/period";
import { NUMERIC_COLUMN } from "@/lib/table";
import type { Invoice } from "./types";

export function parentInvoiceColumns(): DataTableColumn<Invoice>[] {
  const money = (id: string, header: string, pick: (row: Invoice) => number): DataTableColumn<Invoice> => ({
    id,
    header,
    className: NUMERIC_COLUMN,
    cell: (row) => <MoneyText amountMinor={pick(row)} currency={row.currency} />,
  });
  return [
    { id: "invoice", header: "Invoice no.", className: "whitespace-nowrap font-medium", cell: (row) => row.invoiceNo },
    { id: "period", header: "Month", className: "whitespace-nowrap", cell: (row) => formatPeriod(row.period) },
    { id: "due", header: "Due date", className: "whitespace-nowrap", cell: (row) => formatDate(row.dueDate) },
    money("total", "Total", (row) => row.totalMinor),
    money("paid", "Paid", (row) => row.paidMinor),
    { ...money("balance", "Balance", (row) => row.balanceMinor), className: `${NUMERIC_COLUMN} font-semibold` },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  ];
}
