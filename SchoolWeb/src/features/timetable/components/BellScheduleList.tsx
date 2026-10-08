import { BellOff } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { BellSchedule } from "../builder-types";
import { periodRows } from "../grid";
import { scheduleName } from "./BellDayTabs";

/** Read-only bell schedule (default day plus any weekday with its own times). */
export function BellScheduleList({ bell }: { bell: BellSchedule | null }) {
  if (!bell || bell.default.length === 0)
    return (
      <Card>
        <EmptyState icon={BellOff} title="No bell schedule yet" description="The branch's periods haven't been set up." />
      </Card>
    );
  const schedules = [
    { day: 0, rows: periodRows(bell.default) },
    ...Object.entries(bell.days).map(([day, periods]) => ({ day: Number(day), rows: periodRows(periods) })),
  ].filter((schedule) => schedule.rows.length > 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {schedules.map((schedule) => (
        <Card key={schedule.day}>
          <h3 className="border-b border-border px-4 py-3 text-label font-semibold text-fg">{scheduleName(schedule.day)}</h3>
          <ol className="divide-y divide-border">
            {schedule.rows.map((row) => (
              <li key={row.periodIndex} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="text-body font-medium text-fg">{row.title}</span>
                <span className="flex items-center gap-2 text-label text-fg-muted">
                  {row.time}
                  {row.isBreak && <Badge tone="info">Break</Badge>}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      ))}
    </div>
  );
}
