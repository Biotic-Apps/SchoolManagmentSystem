import { CalendarClock } from "lucide-react";
import type { Meeting } from "@/features/meetings/types";
import { formatDate, humanize } from "@/lib/format";
import { formatTime } from "@/lib/time";
import { TodayCard } from "./TodayCard";

export function NextMeetingCard({ meeting, href }: { meeting: Meeting | null; href: string | null }) {
  return (
    <TodayCard title="Next meeting" icon={CalendarClock} href={href} linkLabel="Meetings">
      {meeting ? (
        <div className="flex flex-col gap-1">
          <span className="text-label font-semibold text-fg">
            {formatDate(meeting.date)} · {formatTime(meeting.startTime)}
          </span>
          <span className="text-label text-fg">with {meeting.staff.name}</span>
          <span className="text-caption text-fg-muted">
            {[humanize(meeting.mode), meeting.location].filter(Boolean).join(" · ")}
          </span>
          {meeting.agenda && <p className="line-clamp-2 text-caption text-fg-muted">{meeting.agenda}</p>}
        </div>
      ) : (
        <p className="text-label text-fg-muted">No upcoming meetings.</p>
      )}
    </TodayCard>
  );
}
