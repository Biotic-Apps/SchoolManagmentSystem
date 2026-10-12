import type { DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { formatDate } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import type { Income } from "./types";
import type { IncomeLookups } from "./use-income-lookups";

export function incomeColumns(lookups: IncomeLookups): DataTableColumn<Income>[] {
  return [
    {
      id: "title",
      header: "Income",
      className: "min-w-48",
      cell: (row) => <span className="font-medium text-fg">{row.title}</span>,
    },
    { id: "category", header: "Category", className: "min-w-32", cell: (row) => lookups.categoryName(row) },
    { id: "receivedOn", header: "Date received", className: "whitespace-nowrap", cell: (row) => formatDate(row.receivedOn) },
    {
      id: "amount",
      header: "Amount",
      className: NUMERIC_COLUMN,
      cell: (row) => <MoneyText amountMinor={row.amountMinor} />,
    },
    { id: "description", header: "Description", className: "min-w-40 max-w-60 truncate", cell: (row) => row.description ?? "" },
  ];
}
