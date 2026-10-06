import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { formatDate } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import type { Invoice, InvoicePayment } from "../../types";

export function InvoicePaymentsList({ invoice }: { invoice: Invoice }) {
  const columns: DataTableColumn<InvoicePayment>[] = [
    { id: "receipt", header: "Receipt no.", className: "whitespace-nowrap font-medium", cell: (row) => row.receiptNo },
    { id: "date", header: "Paid on", className: "whitespace-nowrap", cell: (row) => formatDate(row.paidOn) },
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
      rows={invoice.payments ?? []}
      getRowId={(row) => row.paymentId}
      emptyTitle="No payments yet"
      emptyDescription="Payments allocated to this invoice appear here."
    />
  );
}
