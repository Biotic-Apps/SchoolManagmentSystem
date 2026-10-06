"use client";

import { CalendarX } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cellKey, type TeacherWeek } from "../grid";
import { TeacherSlotCell } from "./TeacherSlotCell";
import { WeekGrid } from "./WeekGrid";

interface TeacherWeekGridProps {
  caption: string;
  week: TeacherWeek;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  showSection: boolean;
  emptyDescription: string;
}

/** Read-only week built from TeacherSlot[] (my week, child, teacher week). */
export function TeacherWeekGrid({ caption, week, loading, error, onRetry, showSection, emptyDescription }: TeacherWeekGridProps) {
  if (loading) return <Skeleton className="h-72 w-full" />;
  if (error)
    return (
      <Card>
        <ErrorState error={error} onRetry={onRetry} />
      </Card>
    );
  if (week.rows.length === 0)
    return (
      <Card>
        <EmptyState icon={CalendarX} title="Nothing scheduled this week" description={emptyDescription} />
      </Card>
    );
  return (
    <WeekGrid
      caption={caption}
      days={week.days}
      rows={week.rows}
      renderCell={(day, row) => (
        <TeacherSlotCell slots={week.cells[cellKey(day, row.periodIndex)]} showSection={showSection} />
      )}
    />
  );
}
