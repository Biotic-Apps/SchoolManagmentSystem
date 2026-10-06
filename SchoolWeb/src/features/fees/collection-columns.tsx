import type { DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EMPTY_VALUE, formatNumber, textOrDash } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import { paymentMethodLabel } from "./payment-options";
import type { DailyCollection, Payment } from "./types";

type CashierRow = DailyCollection["byCashier"][number];

export function cashierColumns(): DataTableColumn<CashierRow>[] {
  return [
    { id: "cashier", header: "Cashier", className: "min-w-40", cell: (row) => row.cashier?.name ?? EMPTY_VALUE },
    { id: "count", header: "Payments", className: NUMERIC_COLUMN, cell: (row) => formatNumber(row.count) },
    { id: "amount", header: "Collected", className: NUMERIC_COLUMN, cell: (row) => <MoneyText amountMinor={row.amountMinor} /> },
  ];
}

export function collectionPaymentColumns(): DataTableColumn<Payment>[] {
  return [
    { id: "receipt", header: "Receipt no.", className: "whitespace-nowrap font-medium", cell: (row) => row.receiptNo },
    { id: "student", header: "Student", className: "min-w-40", cell: (row) => row.student?.name },
    { id: "method", header: "Method", className: "whitespace-nowrap", cell: (row) => paymentMethodLabel(row.method) },
    { id: "reference", header: "Reference", className: "min-w-28", cell: (row) => textOrDash(row.reference) },
    { id: "cashier", header: "Cashier", className: "min-w-32", cell: (row) => row.cashier?.name ?? EMPTY_VALUE },
    { id: "amount", header: "Amount", className: NUMERIC_COLUMN, cell: (row) => <MoneyText amountMinor={row.amountMinor} /> },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  ];
}
