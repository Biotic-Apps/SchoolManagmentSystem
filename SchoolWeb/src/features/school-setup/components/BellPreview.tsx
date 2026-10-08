import { formatTimeRange } from "@/lib/time";
import type { BellRow } from "@/features/timetable/bell-generator";

/** "Period 1 · 8:00 AM – 8:40 AM … Break · 10:40 AM – 11:10 AM". */
export function BellPreview({ title, rows }: { title: string; rows: BellRow[] }) {
  let number = 0;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-caption font-medium text-fg-muted">{title}</span>
      <ol className="grid gap-x-6 gap-y-1 rounded-input bg-background p-3 text-label sm:grid-cols-2">
        {rows.map((row, index) => (
          <li key={index} className={row.isBreak ? "font-medium text-on-selected" : "text-fg"}>
            {row.isBreak ? row.label || "Break" : `Period ${++number}`}
            <span className="text-fg-muted"> · {formatTimeRange(row.startTime, row.endTime)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
