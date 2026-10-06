import type { DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { EMPTY_VALUE, formatDate } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import type { LedgerEntry } from "./types";

/** Zero debit / credit cells stay blank so each row reads as one movement. */
function amountOrBlank(amountMinor: number) {
  return amountMinor ? <MoneyText amountMinor={amountMinor} /> : null;
}

export function ledgerColumns(): DataTableColumn<LedgerEntry>[] {
  return [
    { id: "date", header: "Date", className: "whitespace-nowrap", cell: (row) => formatDate(row.date) },
    { id: "description", header: "Description", className: "min-w-48", cell: (row) => row.description },
    { id: "reference", header: "Reference", className: "whitespace-nowrap", cell: (row) => row.reference || EMPTY_VALUE },
    { id: "debit", header: "Debit", className: NUMERIC_COLUMN, cell: (row) => amountOrBlank(row.debitMinor) },
    { id: "credit", header: "Credit", className: NUMERIC_COLUMN, cell: (row) => amountOrBlank(row.creditMinor) },
    {
      id: "balance",
      header: "Balance",
      className: `${NUMERIC_COLUMN} font-medium`,
      cell: (row) => <MoneyText amountMinor={row.balanceMinor} />,
    },
  ];
}
