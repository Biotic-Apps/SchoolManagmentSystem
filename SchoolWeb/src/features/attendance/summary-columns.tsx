import type { DataTableColumn } from "@/components/shared/DataTable";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EMPTY_VALUE } from "@/lib/format";
import { REGISTER_STATUS_LABEL, percentTone, sectionLabel } from "./options";
import type { SectionAttendanceRow } from "./types";

const NUMBER = "whitespace-nowrap text-right tabular-nums";

/** Present share of marked students; late counts as present. */
export function rowPercent(row: SectionAttendanceRow): number | null {
  const marked = row.present + row.absent + row.late + row.leave;
  return marked ? Math.round(((row.present + row.late) / marked) * 100) : null;
}

export const summaryColumns: DataTableColumn<SectionAttendanceRow>[] = [
  { id: "section", header: "Class & section", className: "min-w-40 font-medium", cell: sectionLabel },
  {
    id: "status",
    header: "Register",
    className: "whitespace-nowrap",
    cell: (row) => <StatusBadge status={row.status} label={REGISTER_STATUS_LABEL[row.status]} />,
  },
  { id: "present", header: "Present", className: NUMBER, cell: (row) => row.present },
  { id: "absent", header: "Absent", className: NUMBER, cell: (row) => row.absent },
  { id: "late", header: "Late", className: NUMBER, cell: (row) => row.late },
  { id: "leave", header: "Leave", className: NUMBER, cell: (row) => row.leave },
  { id: "total", header: "Students", className: NUMBER, cell: (row) => row.total },
  {
    id: "percent",
    header: "Attendance",
    className: "min-w-40",
    cell: (row) => {
      const percent = rowPercent(row);
      return percent === null ? (
        <span className="text-fg-muted">{EMPTY_VALUE}</span>
      ) : (
        <ProgressBar percent={percent} tone={percentTone(percent)} label="Attendance" />
      );
    },
  },
];
