import { BellOff } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { GridRow } from "../grid";

/** Read-only bell schedule for users without timetable.edit. */
export function BellScheduleList({ rows }: { rows: GridRow[] }) {
  if (rows.length === 0)
    return (
      <Card>
        <EmptyState icon={BellOff} title="No bell schedule yet" description="The branch's periods haven't been set up." />
      </Card>
    );
  return (
    <Card>
      <ol className="divide-y divide-border">
        {rows.map((row) => (
          <li key={row.periodIndex} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex flex-col">
              <span className="text-body font-medium text-fg">{row.title}</span>
              <span className="text-caption text-fg-muted">{row.time}</span>
            </div>
            {row.isBreak && <Badge tone="info">Break</Badge>}
          </li>
        ))}
      </ol>
    </Card>
  );
}
