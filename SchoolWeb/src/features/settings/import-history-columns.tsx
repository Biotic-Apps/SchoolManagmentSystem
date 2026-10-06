import { FolderOpen, Undo2 } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime, formatNumber, textOrDash } from "@/lib/format";
import { importKindLabel } from "./import-kinds";
import type { ImportSummary } from "./import-types";

interface HistoryHandlers {
  onOpen: (item: ImportSummary) => void;
  onRevert: (item: ImportSummary) => void;
}

const NUMBER_CELL = "text-right tabular-nums";

export function importHistoryColumns({ onOpen, onRevert }: HistoryHandlers): DataTableColumn<ImportSummary>[] {
  return [
    { id: "started", header: "Started", className: "whitespace-nowrap", cell: (item) => formatDateTime(item.startedAt) },
    { id: "kind", header: "Kind", cell: (item) => importKindLabel(item.kind) },
    { id: "file", header: "File name", className: "min-w-40 break-all", cell: (item) => textOrDash(item.fileName) },
    { id: "status", header: "Status", cell: (item) => <StatusBadge status={item.status} /> },
    { id: "rows", header: "Rows", className: NUMBER_CELL, cell: (item) => formatNumber(item.totals?.rows) },
    { id: "valid", header: "Valid", className: NUMBER_CELL, cell: (item) => formatNumber(item.totals?.valid) },
    { id: "invalid", header: "Invalid", className: NUMBER_CELL, cell: (item) => formatNumber(item.totals?.invalid) },
    { id: "by", header: "By", cell: (item) => textOrDash(item.startedBy) },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (item) => (
        <RowActions
          label={`Actions for ${item.fileName ?? "import"}`}
          actions={[
            { id: "open", label: "Open", icon: FolderOpen, onSelect: () => onOpen(item) },
            {
              id: "revert",
              label: "Revert",
              icon: Undo2,
              danger: true,
              hidden: item.status !== "COMMITTED",
              onSelect: () => onRevert(item),
            },
          ]}
        />
      ),
    },
  ];
}
