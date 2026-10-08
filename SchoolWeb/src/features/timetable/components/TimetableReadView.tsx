"use client";

import { useMemo } from "react";
import { CalendarClock } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSectionTimetable } from "../api";
import { slotsToCells, cellKey } from "../grid";
import { gridFrame } from "../grid-frame";
import { stateLabel, stateOf } from "../timetable-state";
import { SlotCell } from "./SlotCell";
import { WeekGrid } from "./WeekGrid";

interface TimetableReadViewProps {
  sectionId: string;
  sectionName: string;
  workingDays: number[];
}

/** Published timetable of a section for people who can't edit it; drafts show as "Not published yet". */
export function TimetableReadView({ sectionId, sectionName, workingDays }: TimetableReadViewProps) {
  const query = useSectionTimetable(sectionId);
  const timetable = query.data ?? null;
  const frame = useMemo(
    () => gridFrame(timetable?.periods ?? [], timetable?.dayPeriods, workingDays),
    [timetable, workingDays],
  );
  const cells = useMemo(() => slotsToCells(timetable?.slots ?? []), [timetable]);

  if (query.isLoading) return <Skeleton className="h-72 w-full" />;
  if (query.error)
    return (
      <Card>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Card>
    );
  const state = stateOf(timetable);
  if (state === "EMPTY" || state === "DRAFT" || frame.rows.length === 0)
    return (
      <Card>
        <EmptyState icon={CalendarClock} title="Not published yet" description={`${sectionName}'s timetable appears here once it is published.`} />
      </Card>
    );
  return (
    <div className="flex flex-col gap-3">
      <Badge tone="success" className="self-start">
        {stateLabel(timetable)}
      </Badge>
      <WeekGrid
        caption={`Timetable for ${sectionName}`}
        days={frame.days}
        rows={frame.rows}
        info={frame.info}
        renderCell={(day, row) => <SlotCell cell={cells[cellKey(day, row.periodIndex)]} />}
      />
    </div>
  );
}
