import { CalendarClock } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import type { Meeting } from "@/features/meetings/types";
import { formatDate, formatDateRange, humanize } from "@/lib/format";
import { formatTime } from "@/lib/time";
import type { ParentHomeEvent } from "../../types";
import { TodayCard } from "../TodayCard";

const KIND_TONE: Record<ParentHomeEvent["kind"], BadgeTone> = {
  ACTIVITY: "info",
  EVENT: "info",
  HOLIDAY: "success",
  VACATION: "success",
  DEADLINE: "warning",
};

interface Item {
  key: string;
  date: string;
  title: string;
  detail: string;
  badge: string;
  tone: BadgeTone;
}

const fromMeeting = (m: Meeting): Item => ({
  key: `m-${m.id}`,
  date: m.date,
  title: `Meeting with ${m.staff.name}`,
  detail: [`${formatDate(m.date)} · ${formatTime(m.startTime)}`, humanize(m.mode), m.location].filter(Boolean).join(" · "),
  badge: "Meeting",
  tone: "primary" as BadgeTone,
});

const fromEvent = (e: ParentHomeEvent): Item => ({
  key: `e-${e.id}`,
  date: e.startDate,
  title: e.title,
  detail: formatDateRange(e.startDate, e.endDate ?? e.startDate),
  badge: humanize(e.kind),
  tone: KIND_TONE[e.kind],
});

/** Meetings, activities and calendar dates coming up, soonest first. */
export function UpcomingCard({ meetings, events, href }: { meetings: Meeting[]; events: ParentHomeEvent[]; href: string | null }) {
  const items = [...meetings.map(fromMeeting), ...events.map(fromEvent)]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);
  return (
    <TodayCard title="Coming up" icon={CalendarClock} href={href} linkLabel="Meetings">
      {items.length === 0 ? (
        <p className="text-label text-fg-muted">
          No meetings or school events ahead. You can book a meeting with a teacher any time.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.key} className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-label font-medium text-fg">{item.title}</span>
                <span className="truncate text-caption text-fg-muted">{item.detail}</span>
              </div>
              <Badge tone={item.tone}>{item.badge}</Badge>
            </li>
          ))}
        </ul>
      )}
    </TodayCard>
  );
}
