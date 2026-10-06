import { RotateCw } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatDateTime, formatNumber, humanize, textOrDash } from "@/lib/format";
import type { JobRun } from "./support-types";

interface Options {
  canEdit: boolean;
  onRetry: (id: string) => void;
  retryingId?: string;
}

export function failedJobColumns({ canEdit, onRetry, retryingId }: Options): DataTableColumn<JobRun>[] {
  const columns: DataTableColumn<JobRun>[] = [
    {
      id: "started",
      header: "Started",
      className: "whitespace-nowrap",
      cell: (row) => formatDateTime(row.startedAt ?? row.createdAt),
    },
    {
      id: "job",
      header: "Job",
      className: "min-w-40 max-w-56 break-words",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{humanize(row.name)}</span>
          <span className="text-caption text-fg-muted">{humanize(row.queue)}</span>
        </div>
      ),
    },
    { id: "status", header: "Status", className: "whitespace-nowrap", cell: (row) => <StatusBadge status={row.status} /> },
    {
      id: "attempts",
      header: "Attempts",
      className: "whitespace-nowrap text-right tabular-nums",
      cell: (row) => formatNumber(row.attempts),
    },
    {
      id: "error",
      header: "Error",
      className: "min-w-48 max-w-80 whitespace-normal break-words text-fg-muted",
      cell: (row) => <span className="line-clamp-2">{textOrDash(row.error)}</span>,
    },
    { id: "finished", header: "Finished", className: "whitespace-nowrap", cell: (row) => formatDateTime(row.finishedAt) },
  ];
  if (!canEdit) return columns;
  return [
    ...columns,
    {
      id: "actions",
      header: "",
      className: "w-px text-right",
      cell: (row) =>
        row.status === "FAILED" && (
          <Button
            variant="ghost"
            size="sm"
            loading={retryingId === row.id}
            onClick={(event) => {
              event.stopPropagation();
              onRetry(row.id);
            }}
          >
            <RotateCw />
            Retry
          </Button>
        ),
    },
  ];
}
