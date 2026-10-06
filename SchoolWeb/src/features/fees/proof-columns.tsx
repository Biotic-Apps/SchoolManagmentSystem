import type { DataTableColumn } from "@/components/shared/DataTable";
import { MoneyText } from "@/components/shared/MoneyText";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EMPTY_VALUE, formatDate, formatDateTime } from "@/lib/format";
import { NUMERIC_COLUMN } from "@/lib/table";
import { proofMethodLabel } from "./proof-options";
import type { PaymentProof } from "./types";

export function proofColumns({ withStudent = true } = {}): DataTableColumn<PaymentProof>[] {
  const columns: DataTableColumn<PaymentProof>[] = [
    { id: "student", header: "Student", className: "min-w-40", cell: (row) => row.student?.name ?? EMPTY_VALUE },
    { id: "invoice", header: "Invoice no.", className: "whitespace-nowrap", cell: (row) => row.invoiceNo ?? EMPTY_VALUE },
    { id: "amount", header: "Amount", className: NUMERIC_COLUMN, cell: (row) => <MoneyText amountMinor={row.amountMinor} /> },
    { id: "paidOn", header: "Paid on", className: "whitespace-nowrap", cell: (row) => formatDate(row.paidOn) },
    { id: "method", header: "Method", className: "whitespace-nowrap", cell: (row) => proofMethodLabel(row.method) },
    { id: "reference", header: "Reference", className: "min-w-28", cell: (row) => row.reference || EMPTY_VALUE },
    { id: "submitted", header: "Submitted", className: "whitespace-nowrap", cell: (row) => formatDateTime(row.createdAt) },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  ];
  return withStudent ? columns : columns.filter((column) => column.id !== "student");
}

export function proofFileUrl(proof: PaymentProof): string | null {
  return proof.file?.url ?? proof.fileUrl ?? null;
}
