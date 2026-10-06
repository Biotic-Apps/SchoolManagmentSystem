import { Badge } from "@/components/ui/Badge";
import type { TeacherSlot } from "@/features/timetable/types";
import { formatTimeRange } from "@/lib/time";
import { TodayCard } from "./TodayCard";

export function TeacherPeriodsCard({ periods, href }: { periods: TeacherSlot[]; href: string | null }) {
  return (
    <TodayCard title="Today's periods" href={href} linkLabel="Timetable">
      {periods.length === 0 ? (
        <p className="text-label text-fg-muted">No periods scheduled today.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {periods.map((slot) => (
            <li key={`${slot.periodIndex}-${slot.section.id}`} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
              <span className="w-36 shrink-0 whitespace-nowrap text-label tabular-nums text-fg-muted">
                {formatTimeRange(slot.startTime, slot.endTime)}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-label font-medium text-fg">{slot.subject.name}</span>
                <span className="truncate text-caption text-fg-muted">
                  {slot.section.className} {slot.section.name}
                </span>
              </span>
              {slot.isSubstitute && <Badge tone="info">Substitute</Badge>}
            </li>
          ))}
        </ul>
      )}
    </TodayCard>
  );
}
