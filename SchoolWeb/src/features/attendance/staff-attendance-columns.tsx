import type { DataTableColumn } from "@/components/shared/DataTable";
import { PersonCell } from "@/components/shared/PersonCell";
import { Input } from "@/components/ui/Input";
import { InlineTimeSelect } from "./components/InlineTimeSelect";
import { StatusChips } from "./components/StatusChips";
import type { StaffRow, StaffAttendanceEditor } from "./use-staff-attendance-editor";

const NO_TIMES = new Set(["ABSENT", "LEAVE"]);

export function staffAttendanceColumns(update: StaffAttendanceEditor["update"]): DataTableColumn<StaffRow>[] {
  return [
    {
      id: "staff",
      header: "Staff member",
      className: "min-w-56",
      cell: (row) => <PersonCell name={row.name} caption={row.designation} photoUrl={row.photoUrl} />,
    },
    {
      id: "status",
      header: "Status",
      className: "whitespace-nowrap",
      cell: (row) => (
        <StatusChips value={row.status} onChange={(status) => update(row.staffId, { status })} label={row.name} />
      ),
    },
    {
      id: "checkIn",
      header: "Check-in",
      className: "min-w-52 whitespace-nowrap",
      cell: (row) => (
        <InlineTimeSelect
          label={`Check-in for ${row.name}`}
          value={row.checkIn}
          onChange={(checkIn) => update(row.staffId, { checkIn })}
          disabled={!row.status || NO_TIMES.has(row.status)}
        />
      ),
    },
    {
      id: "checkOut",
      header: "Check-out",
      className: "min-w-52 whitespace-nowrap",
      cell: (row) => (
        <InlineTimeSelect
          label={`Check-out for ${row.name}`}
          value={row.checkOut}
          onChange={(checkOut) => update(row.staffId, { checkOut })}
          disabled={!row.status || NO_TIMES.has(row.status)}
        />
      ),
    },
    {
      id: "remark",
      header: "Remark",
      className: "min-w-44",
      cell: (row) => (
        <Input
          aria-label={`Remark for ${row.name}`}
          placeholder="Optional"
          maxLength={200}
          value={row.remark ?? ""}
          onChange={(event) => update(row.staffId, { remark: event.target.value })}
          className="h-9"
        />
      ),
    },
  ];
}
