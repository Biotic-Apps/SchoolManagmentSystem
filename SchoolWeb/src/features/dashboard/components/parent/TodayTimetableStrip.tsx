import { Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/time";
import type { ParentPeriod } from "../../types";
import { TodayCard } from "../TodayCard";

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Today's classes as a scrollable row; the one in progress is highlighted. */
export function TodayTimetableStrip({ periods, href }: { periods: ParentPeriod[]; href: string | null }) {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  return (
    <TodayCard title="Today's classes" icon={Clock} href={href} linkLabel="Timetable">
      {periods.length === 0 ? (
        <p className="text-label text-fg-muted">No classes today. Weekends and holidays show here as free days.</p>
      ) : (
        <ol className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1">
          {periods.map((period) => {
            const live = minutes(period.startTime) <= current && current < minutes(period.endTime);
            return (
              <li
                key={`${period.periodIndex}-${period.startTime}`}
                className={cn(
                  "flex w-40 shrink-0 snap-start flex-col gap-1 rounded-input border p-3",
                  live ? "border-primary bg-selected" : "border-border",
                )}
              >
                <span className="text-caption text-fg-muted tabular-nums">
                  {formatTime(period.startTime)} – {formatTime(period.endTime)}
                </span>
                <span className="truncate text-label font-semibold text-fg">{period.subject.name}</span>
                {period.staff && <span className="truncate text-caption text-fg-muted">{period.staff.name}</span>}
                {(live || period.isSubstitute) && (
                  <span className="text-caption font-medium text-primary">
                    {live ? "Now" : "Substitute teacher"}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </TodayCard>
  );
}
