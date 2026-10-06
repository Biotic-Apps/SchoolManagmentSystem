import { Download, ListChecks, ShieldCheck } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDateTime } from "@/lib/format";
import { formatBytes } from "@/lib/format-bytes";
import { formatDuration } from "./backup-format";
import type { BackupRun } from "./backup-types";
import { ChecksumCell } from "./components/backups/ChecksumCell";

interface Options {
  onVerify: (run: BackupRun) => void;
  onDownload: (run: BackupRun) => void;
  onViewChecks: (run: BackupRun) => void;
}

export function backupColumns({ onVerify, onDownload, onViewChecks }: Options): DataTableColumn<BackupRun>[] {
  return [
    { id: "started", header: "Started", className: "whitespace-nowrap", cell: (row) => formatDateTime(row.startedAt) },
    {
      id: "duration",
      header: "Duration",
      className: "whitespace-nowrap text-right tabular-nums",
      cell: (row) => formatDuration(row.startedAt, row.finishedAt),
    },
    { id: "status", header: "Status", className: "whitespace-nowrap", cell: (row) => <StatusBadge status={row.status} /> },
    {
      id: "size",
      header: "Size",
      className: "whitespace-nowrap text-right tabular-nums",
      cell: (row) => formatBytes(row.sizeBytes),
    },
    { id: "checksum", header: "Checksum", className: "whitespace-nowrap", cell: (row) => <ChecksumCell value={row.checksumSha256} /> },
    { id: "encrypted", header: "Encrypted", className: "whitespace-nowrap", cell: (row) => (row.encrypted ? "Yes" : "No") },
    {
      id: "verify",
      header: "Restore check",
      className: "whitespace-nowrap",
      cell: (row) => {
        const verify = row.verify;
        const status = verify?.status ?? "NOT_RUN";
        return (
          <div className="flex flex-col items-start gap-1">
            <StatusBadge status={status} label={status === "PASSED" ? "Passed" : undefined} />
            {verify?.at && <span className="text-caption text-fg-muted">{formatDateTime(verify.at)}</span>}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      className: "w-px text-right",
      cell: (row) => (
        <RowActions
          label="Backup actions"
          actions={[
            {
              id: "verify",
              label: "Verify restore",
              icon: ShieldCheck,
              onSelect: () => onVerify(row),
              hidden: row.status !== "DONE" || row.verify?.status === "RUNNING",
            },
            { id: "download", label: "Download", icon: Download, onSelect: () => onDownload(row), hidden: row.status !== "DONE" },
            {
              id: "checks",
              label: "View checks",
              icon: ListChecks,
              onSelect: () => onViewChecks(row),
              hidden: !row.verify?.checks?.length,
            },
          ]}
        />
      ),
    },
  ];
}
