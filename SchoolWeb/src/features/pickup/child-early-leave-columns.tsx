import type { DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/format";
import { formatTime } from "@/lib/time";
import type { EarlyLeave } from "./types";

export function childEarlyLeaveColumns(): DataTableColumn<EarlyLeave>[] {
  return [
    { id: "date", header: "Date", className: "whitespace-nowrap", cell: (row) => formatDate(row.date) },
    { id: "time", header: "Time", className: "whitespace-nowrap", cell: (row) => formatTime(row.time) },
    {
      id: "reason",
      header: "Reason",
      className: "min-w-48",
      cell: (row) => (
        <span className="line-clamp-2 max-w-72" title={row.reason}>
          {row.reason}
        </span>
      ),
    },
    {
      id: "pickup",
      header: "Collected by",
      className: "min-w-36",
      cell: (row) => row.pickupPerson?.name ?? "Guardian",
    },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  ];
}
