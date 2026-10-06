import { Ban, Check, X } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, formatDateTime, textOrDash } from "@/lib/format";
import type { Transfer } from "./types";

interface TransferRowHandlers {
  /** Destination branch of the current view; decides incoming vs outgoing actions. */
  branchId: string;
  onAccept?: (item: Transfer) => void;
  onReject?: (item: Transfer) => void;
  onCancel?: (item: Transfer) => void;
}

export function transferColumns({ branchId, onAccept, onReject, onCancel }: TransferRowHandlers): DataTableColumn<Transfer>[] {
  return [
    {
      id: "student",
      header: "Student",
      cell: (row) => (
        <span className="flex flex-col">
          <span className="font-medium">{row.student.name}</span>
          <span className="text-caption text-fg-muted">{row.student.admissionNo}</span>
        </span>
      ),
    },
    { id: "route", header: "From → To", cell: (row) => `${row.fromBranch.name} → ${row.toBranch.name}` },
    { id: "effective", header: "Effective", cell: (row) => formatDate(row.effectiveDate), className: "whitespace-nowrap" },
    { id: "reason", header: "Reason", cell: (row) => textOrDash(row.reason) },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    { id: "created", header: "Requested", cell: (row) => formatDateTime(row.createdAt), className: "whitespace-nowrap" },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => {
        const open = row.status === "REQUESTED";
        const incoming = row.toBranch.id === branchId;
        return (
          <RowActions
            actions={[
              { id: "accept", label: "Accept", icon: Check, onSelect: () => onAccept?.(row), hidden: !onAccept || !open || !incoming },
              { id: "reject", label: "Reject", icon: X, danger: true, onSelect: () => onReject?.(row), hidden: !onReject || !open || !incoming },
              { id: "cancel", label: "Cancel transfer", icon: Ban, danger: true, onSelect: () => onCancel?.(row), hidden: !onCancel || !open || incoming },
            ]}
          />
        );
      },
    },
  ];
}
