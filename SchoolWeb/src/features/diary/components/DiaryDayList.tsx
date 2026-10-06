import { formatDate } from "@/lib/format";
import type { DiaryDay } from "../options";
import { DiaryEntryCard } from "./DiaryEntryCard";

const WEEKDAY = new Intl.DateTimeFormat("en-PK", { weekday: "long" });

function dayHeading(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${WEEKDAY.format(new Date(year, month - 1, day))}, ${formatDate(iso)}`;
}

export function DiaryDayList({ days }: { days: DiaryDay[] }) {
  return (
    <div className="flex flex-col gap-6">
      {days.map((day) => (
        <section key={day.date} className="flex flex-col gap-3" aria-label={dayHeading(day.date)}>
          <h2 className="text-label font-semibold text-fg-muted">{dayHeading(day.date)}</h2>
          {day.entries.map((entry) => (
            <DiaryEntryCard key={entry.id} entry={entry} />
          ))}
        </section>
      ))}
    </div>
  );
}
