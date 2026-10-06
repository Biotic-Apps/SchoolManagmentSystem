import type { DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { PersonCell } from "@/components/shared/PersonCell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Checkbox } from "@/components/ui/Checkbox";
import { formatDate } from "@/lib/format";
import { formatPeriod } from "@/lib/period";
import { NUMERIC_COLUMN } from "@/lib/table";
import { studentCaption } from "./invoice-options";
import type { Invoice } from "./types";
import type { InvoiceSelection } from "./use-invoice-selection";

const MONEY_COLUMN = `${NUMERIC_COLUMN} whitespace-nowrap`;

function selectColumn(selection: InvoiceSelection): DataTableColumn<Invoice> {
  return {
    id: "select",
    header: "",
    className: "w-px",
    cell: (row) =>
      row.status === "DRAFT" ? (
        <span className="flex" onClick={(event) => event.stopPropagation()}>
          <Checkbox
            checked={selection.isSelected(row.id)}
            onCheckedChange={(checked) => selection.toggle(row.id, checked === true)}
            aria-label={`Select ${row.invoiceNo}`}
          />
        </span>
      ) : null,
  };
}

export function invoiceColumns(selection: InvoiceSelection | null): DataTableColumn<Invoice>[] {
  const columns: DataTableColumn<Invoice>[] = [
    { id: "no", header: "Invoice no.", className: "whitespace-nowrap font-medium", cell: (row) => row.invoiceNo },
    {
      id: "student",
      header: "Student",
      className: "min-w-52",
      cell: (row) => <PersonCell name={row.student.name} caption={studentCaption(row.student)} />,
    },
    { id: "period", header: "Period", className: "whitespace-nowrap", cell: (row) => formatPeriod(row.period) },
    { id: "due", header: "Due date", className: "whitespace-nowrap", cell: (row) => formatDate(row.dueDate) },
    { id: "total", header: "Total", className: MONEY_COLUMN, cell: (row) => <MoneyText amountMinor={row.totalMinor} currency={row.currency} /> },
    { id: "paid", header: "Paid", className: MONEY_COLUMN, cell: (row) => <MoneyText amountMinor={row.paidMinor} currency={row.currency} /> },
    {
      id: "balance",
      header: "Balance",
      className: `${MONEY_COLUMN} font-medium`,
      cell: (row) => <MoneyText amountMinor={row.balanceMinor} currency={row.currency} />,
    },
    { id: "status", header: "Status", className: "whitespace-nowrap", cell: (row) => <StatusBadge status={row.status} /> },
  ];
  return selection ? [selectColumn(selection), ...columns] : columns;
}
