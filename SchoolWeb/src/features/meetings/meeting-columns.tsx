import { CircleCheck, CircleX, UserX } from "lucide-react";
import type { DataTableColumn } from "@/components/shared/DataTable";
import { RowActions } from "@/components/shared/RowActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/format";
import { formatTimeRange } from "@/lib/time";
import { modeLabel } from "./options";
import type { Meeting } from "./types";

interface MeetingRowHandlers {
  onCancel: (meeting: Meeting) => void;
  onNoShow: (meeting: Meeting) => void;
  onComplete: (meeting: Meeting) => void;
}

export function meetingColumns(handlers: MeetingRowHandlers): DataTableColumn<Meeting>[] {
  return [
    { id: "date", header: "Date", className: "whitespace-nowrap", cell: (row) => formatDate(row.date) },
    {
      id: "time",
      header: "Time",
      className: "whitespace-nowrap",
      cell: (row) => formatTimeRange(row.startTime, row.endTime),
    },
    { id: "student", header: "Student", className: "min-w-32", cell: (row) => row.student.name },
    { id: "guardian", header: "Guardian", className: "min-w-32", cell: (row) => row.guardian.name },
    { id: "mode", header: "Mode", className: "whitespace-nowrap", cell: (row) => modeLabel(row.mode) },
    {
      id: "agenda",
      header: "Agenda",
      className: "min-w-48 max-w-72",
      cell: (row) => <span className="block truncate" title={row.agenda}>{row.agenda}</span>,
    },
    { id: "status", header: "Status", className: "whitespace-nowrap", cell: (row) => <StatusBadge status={row.status} /> },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <RowActions
          actions={[
            { id: "complete", label: "Complete", icon: CircleCheck, onSelect: () => handlers.onComplete(row) },
            { id: "no-show", label: "Mark no-show", icon: UserX, onSelect: () => handlers.onNoShow(row) },
            { id: "cancel", label: "Cancel meeting", icon: CircleX, danger: true, onSelect: () => handlers.onCancel(row) },
          ].map((action) => ({ ...action, hidden: row.status !== "SCHEDULED" }))}
        />
      ),
    },
  ];
}
