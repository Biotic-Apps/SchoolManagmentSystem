import type { DataTableColumn } from "@/components/shared/DataTable";
import { PersonCell } from "@/components/shared/PersonCell";
import { Input } from "@/components/ui/Input";
import { InlineTimeSelect } from "./components/InlineTimeSelect";
import { StatusChips } from "./components/StatusChips";
import type { StaffRow, StaffAttendanceEditor } from "./use-staff-attendance-editor";

const NO_TIMES = new Set(["ABSENT", "LEAVE"]);

export function staffAttendanceColumns(update: StaffAttendanceEditor["update"]): DataTableColumn<StaffRow>[] {
  const chips = (row: StaffRow) => (
    <StatusChips value={row.status} onChange={(status) => update(row.staffId, { status })} label={row.name} />
  );
  return [
    {
      id: "staff",
      header: "Staff member",
      className: "px-3 sm:min-w-56 sm:px-5",
      // Phones: the status buttons sit under the name instead of off-screen to the right.
      cell: (row) => (
        <div className="flex flex-col gap-2">
          <PersonCell name={row.name} caption={row.designation} photoUrl={row.photoUrl} />
          <div className="sm:hidden">{chips(row)}</div>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "hidden whitespace-nowrap sm:table-cell",
      cell: chips,
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
