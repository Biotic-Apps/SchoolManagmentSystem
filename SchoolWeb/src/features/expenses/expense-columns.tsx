import type { DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import { expenseBalance, expensePaid, isRecurring, minor } from "./amounts";
import type { Expense } from "./types";
import type { ExpenseLookups } from "./use-expense-lookups";

export function expenseColumns(lookups: ExpenseLookups): DataTableColumn<Expense>[] {
  return [
    {
      id: "title",
      header: "Expense",
      className: "min-w-48",
      cell: (row) => (
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="font-medium text-fg">{row.title}</span>
          {isRecurring(row) && <Badge tone="info">Monthly</Badge>}
        </span>
      ),
    },
    { id: "category", header: "Category", className: "min-w-32", cell: (row) => lookups.categoryName(row) },
    { id: "vendor", header: "Vendor", className: "min-w-32", cell: (row) => lookups.vendorName(row) },
    { id: "billDate", header: "Bill date", className: "whitespace-nowrap", cell: (row) => formatDate(row.billDate) },
    { id: "dueDate", header: "Due date", className: "whitespace-nowrap", cell: (row) => formatDate(row.dueDate) },
    {
      id: "amount",
      header: "Amount",
      className: NUMERIC_COLUMN,
      cell: (row) => <MoneyText amountMinor={minor(row.amountMinor)} />,
    },
    { id: "paid", header: "Paid", className: NUMERIC_COLUMN, cell: (row) => <MoneyText amountMinor={expensePaid(row)} /> },
    {
      id: "balance",
      header: "Balance",
      className: NUMERIC_COLUMN,
      cell: (row) => <MoneyText amountMinor={expenseBalance(row)} className="font-medium" />,
    },
    { id: "status", header: "Status", className: "whitespace-nowrap", cell: (row) => <StatusBadge status={row.status} /> },
  ];
}
