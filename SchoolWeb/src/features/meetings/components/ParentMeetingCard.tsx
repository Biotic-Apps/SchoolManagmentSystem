import { DetailList } from "@/components/shared/DetailList";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDate } from "@/lib/format";
import { formatTimeRange } from "@/lib/time";
import { modeLabel } from "../options";
import type { Meeting } from "../types";

interface ParentMeetingCardProps {
  meeting: Meeting;
  onCancel?: () => void;
}

export function ParentMeetingCard({ meeting, onCancel }: ParentMeetingCardProps) {
  const requested = meeting.status === "REQUESTED";
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-body font-semibold text-fg">{meeting.staff.name}</h3>
              <StatusBadge status={meeting.status} label={requested ? "Awaiting teacher" : undefined} />
            </div>
            <p className="whitespace-nowrap text-label text-fg-muted">
              {requested && "You suggested "}
              {formatDate(meeting.date)} · {formatTimeRange(meeting.startTime, meeting.endTime)}
            </p>
            {requested && (
              <p className="text-caption text-fg-muted">Waiting for the teacher to confirm this time or offer another.</p>
            )}
          </div>
          {onCancel && (
            <Button variant="secondary" size="sm" onClick={onCancel} className="self-start">
              {requested ? "Withdraw request" : "Cancel meeting"}
            </Button>
          )}
        </div>
        <DetailList
          items={[
            { label: "Mode", value: modeLabel(meeting.mode) },
            { label: "Location", value: meeting.location },
            { label: "Agenda", value: meeting.agenda },
          ]}
        />
        {meeting.summary && (
          <div className="flex flex-col gap-1 rounded-input bg-background px-4 py-3">
            <span className="text-caption font-medium text-fg-muted">Summary from the teacher</span>
            <p className="whitespace-pre-wrap break-words text-label text-fg">{meeting.summary}</p>
          </div>
        )}
        {meeting.followUps.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-caption font-medium text-fg-muted">Follow-ups</span>
            <ul className="flex flex-col gap-1.5">
              {meeting.followUps.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center gap-2 text-label text-fg">
                  <span className="min-w-0 flex-1">{item.title}</span>
                  <span className="whitespace-nowrap text-caption text-fg-muted">Due {formatDate(item.dueDate)}</span>
                  <StatusBadge status={item.status} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
