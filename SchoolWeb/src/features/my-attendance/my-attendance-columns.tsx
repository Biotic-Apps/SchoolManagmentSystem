import type { DataTableColumn } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ATTENDANCE_STATUS_LABEL } from "@/features/attendance/options";
import type { MyStaffAttendance } from "@/features/attendance/types";
import { EMPTY_VALUE, formatDate } from "@/lib/format";
import { formatTime } from "@/lib/time";

type Day = MyStaffAttendance["entries"][number];

const weekday = new Intl.DateTimeFormat("en-PK", { weekday: "short" });

function weekdayOf(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return weekday.format(new Date(year, month - 1, day));
}

export const myAttendanceColumns: DataTableColumn<Day>[] = [
  {
    id: "date",
    header: "Date",
    className: "whitespace-nowrap",
    cell: (row) => (
      <span className="flex items-center gap-2">
        <span className="w-9 text-fg-muted">{weekdayOf(row.date)}</span>
        {formatDate(row.date)}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    className: "whitespace-nowrap",
    cell: (row) =>
      row.status ? (
        <StatusBadge status={row.status} label={ATTENDANCE_STATUS_LABEL[row.status]} />
      ) : (
        <StatusBadge status="UNMARKED" label="Unmarked" />
      ),
  },
  { id: "checkIn", header: "Check-in", className: "whitespace-nowrap tabular-nums", cell: (row) => formatTime(row.checkIn) },
  { id: "checkOut", header: "Check-out", className: "whitespace-nowrap tabular-nums", cell: (row) => formatTime(row.checkOut) },
  {
    id: "remark",
    header: "Remark",
    className: "min-w-48",
    cell: (row) => (
      <span className="block max-w-80 truncate text-fg-muted" title={row.remark ?? undefined}>
        {row.remark || EMPTY_VALUE}
      </span>
    ),
  },
];
