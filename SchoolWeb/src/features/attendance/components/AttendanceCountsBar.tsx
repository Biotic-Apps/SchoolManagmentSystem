import { Badge } from "@/components/ui/Badge";
import { COUNT_ITEMS } from "../options";
import type { AttendanceCounts } from "../types";

/** Pill row of present / absent / late / leave / half day / unmarked totals. */
export function AttendanceCountsBar({ counts }: { counts: AttendanceCounts }) {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Attendance totals">
      {COUNT_ITEMS.map((item) => (
        <Badge key={item.key} tone={item.tone} className="px-3 py-1 text-label">
          {item.label} <span className="tabular-nums font-semibold">{counts[item.key]}</span>
        </Badge>
      ))}
    </div>
  );
}
