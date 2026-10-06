"use client";

import { CalendarClock } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { ReasonDialog } from "@/components/shared/ReasonDialog";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import type { MeetingBox } from "../api";
import { useParentMeetings } from "../use-parent-meetings";
import { ParentMeetingCard } from "./ParentMeetingCard";

const EMPTY: Record<MeetingBox, string> = {
  upcoming: "Meetings you book or the school schedules appear here.",
  past: "Finished meetings, with any summary the teacher shared, appear here.",
};

export function ParentMeetingList({ box }: { box: MeetingBox }) {
  const list = useParentMeetings(box);
  const { query, cancelDialog } = list;

  if (query.isLoading) return <Skeleton className="h-40 w-full" />;
  if (query.error) {
    return (
      <Card>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Card>
    );
  }
  if (list.meetings.length === 0) {
    return (
      <Card>
        <EmptyState icon={CalendarClock} title={`No ${box} meetings`} description={EMPTY[box]} />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {list.meetings.map((meeting) => (
        <ParentMeetingCard
          key={meeting.id}
          meeting={meeting}
          onCancel={box === "upcoming" && meeting.status === "SCHEDULED" ? () => cancelDialog.show(meeting) : undefined}
        />
      ))}
      <ReasonDialog
        open={cancelDialog.open}
        onOpenChange={cancelDialog.onOpenChange}
        title="Cancel meeting"
        description="The teacher is notified and the time becomes free again."
        label="Reason"
        submitLabel="Cancel meeting"
        submitting={list.cancelling}
        error={list.cancelError}
        onSubmit={list.confirmCancel}
      />
    </div>
  );
}
