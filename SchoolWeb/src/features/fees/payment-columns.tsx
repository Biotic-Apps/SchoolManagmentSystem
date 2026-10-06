import { FileText, Undo2, RotateCcw } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, textOrDash } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import { paymentMethodLabel } from "./payment-options";
import type { Payment } from "./types";

export interface PaymentRowHandlers {
  onReceipt: (payment: Payment) => void;
  onRefund?: (payment: Payment) => void;
  onReverse?: (payment: Payment) => void;
}

export function paymentColumns({ onReceipt, onRefund, onReverse }: PaymentRowHandlers): DataTableColumn<Payment>[] {
  return [
    { id: "receipt", header: "Receipt no.", className: "whitespace-nowrap font-medium", cell: (row) => row.receiptNo },
    { id: "student", header: "Student", className: "min-w-40", cell: (row) => row.student?.name },
    { id: "method", header: "Method", className: "whitespace-nowrap", cell: (row) => paymentMethodLabel(row.method) },
    { id: "reference", header: "Reference", className: "min-w-28", cell: (row) => textOrDash(row.reference) },
    { id: "receivedOn", header: "Received on", className: "whitespace-nowrap", cell: (row) => formatDate(row.receivedOn) },
    {
      id: "amount",
      header: "Amount",
      className: NUMERIC_COLUMN,
      cell: (row) => <MoneyText amountMinor={row.amountMinor} currency={row.currency} />,
    },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => {
        const active = row.status !== "REVERSED";
        return (
          <RowActions
            label={`Actions for ${row.receiptNo}`}
            actions={[
              { id: "receipt", label: "Download receipt", icon: FileText, onSelect: () => onReceipt(row) },
              { id: "refund", label: "Refund", icon: Undo2, onSelect: () => onRefund?.(row), hidden: !onRefund || !active },
              {
                id: "reverse",
                label: "Reverse payment",
                icon: RotateCcw,
                danger: true,
                onSelect: () => onReverse?.(row),
                hidden: !onReverse || !active,
              },
            ]}
          />
        );
      },
    },
  ];
}
