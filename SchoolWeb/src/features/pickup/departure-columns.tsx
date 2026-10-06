import type { DataTableColumn } from "@/components/shared/DataTable";
import { PersonCell } from "@/components/shared/PersonCell";
import { Badge } from "@/components/ui/Badge";
import { EMPTY_VALUE, textOrDash } from "@/lib/format";
import { formatTime, pad } from "@/lib/time";
import { classSectionOf } from "./early-leave-columns";
import type { Departure } from "./types";

/** ISO instant → 12-hour local time. */
export function formatInstantTime(iso: string | null | undefined): string {
  if (!iso) return EMPTY_VALUE;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? EMPTY_VALUE : formatTime(`${pad(date.getHours())}:${pad(date.getMinutes())}`);
}

export function departureColumns(): DataTableColumn<Departure>[] {
  return [
    { id: "time", header: "Time", className: "whitespace-nowrap", cell: (row) => formatInstantTime(row.at) },
    {
      id: "student",
      header: "Student",
      className: "min-w-48",
      cell: (row) => <PersonCell name={row.student.name} caption={classSectionOf(row.student)} />,
    },
    {
      id: "pickedUpBy",
      header: "Picked up by",
      className: "min-w-40",
      cell: (row) =>
        row.pickedUpBy ? (
          <span className="flex flex-col">
            <span>{row.pickedUpBy.name}</span>
            {row.pickedUpBy.relation && <span className="text-caption text-fg-muted">{row.pickedUpBy.relation}</span>}
          </span>
        ) : (
          EMPTY_VALUE
        ),
    },
    {
      id: "earlyLeave",
      header: "Early leave",
      cell: (row) => (row.earlyLeaveId ? <Badge tone="info">Early leave</Badge> : EMPTY_VALUE),
    },
    { id: "recordedBy", header: "Recorded by", className: "min-w-36", cell: (row) => textOrDash(row.recordedBy?.name) },
  ];
}
