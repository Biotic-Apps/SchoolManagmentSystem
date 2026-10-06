import { CircleCheck, CircleX, ExternalLink } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime, textOrDash } from "@/lib/format";
import { docTypeLabel } from "./options";
import type { SchoolDocument } from "./types";

interface DocumentRowHandlers {
  onVerify?: (doc: SchoolDocument) => void;
  onReject?: (doc: SchoolDocument) => void;
}

export function documentColumns({ onVerify, onReject }: DocumentRowHandlers): DataTableColumn<SchoolDocument>[] {
  return [
    { id: "type", header: "Document", cell: (row) => <span className="font-medium">{docTypeLabel(row.docType)}</span> },
    {
      id: "file",
      header: "File",
      cell: (row) => (
        <a
          href={row.file.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          Open
          <ExternalLink className="size-3.5" />
        </a>
      ),
    },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
    {
      id: "checked",
      header: "Checked by",
      cell: (row) =>
        row.verifiedBy ? (
          <span className="flex flex-col">
            <span>{row.verifiedBy.name}</span>
            <span className="text-caption text-fg-muted">{formatDateTime(row.verifiedAt)}</span>
          </span>
        ) : (
          textOrDash(null)
        ),
    },
    { id: "note", header: "Note", cell: (row) => textOrDash(row.note) },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <RowActions
          actions={[
            {
              id: "verify",
              label: "Verify",
              icon: CircleCheck,
              onSelect: () => onVerify?.(row),
              hidden: !onVerify || row.status === "VERIFIED",
            },
            {
              id: "reject",
              label: "Reject",
              icon: CircleX,
              danger: true,
              onSelect: () => onReject?.(row),
              hidden: !onReject || row.status === "REJECTED",
            },
          ]}
        />
      ),
    },
  ];
}
