import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { NUMERIC_COLUMN } from "@/lib/table";
import type { Invoice, InvoiceLine } from "../../types";

export function InvoiceLinesTable({ invoice }: { invoice: Invoice }) {
  const columns: DataTableColumn<InvoiceLine>[] = [
    { id: "head", header: "Fee head", className: "whitespace-nowrap font-medium", cell: (row) => row.feeHead?.name },
    { id: "description", header: "Description", className: "min-w-40", cell: (row) => row.description },
    {
      id: "amount",
      header: "Amount",
      className: `${NUMERIC_COLUMN} whitespace-nowrap`,
      cell: (row) => <MoneyText amountMinor={row.amountMinor} currency={invoice.currency} />,
    },
  ];
  return (
    <DataTable
      columns={columns}
      rows={invoice.lines ?? []}
      getRowId={(row) => row.id}
      emptyTitle="No lines on this invoice"
    />
  );
}
