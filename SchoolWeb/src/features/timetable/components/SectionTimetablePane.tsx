"use client";

import type { ReactNode } from "react";
import { Bell } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ApiError } from "@/lib/api-error";
import { useTimetableBuilder } from "../builder-api";
import { TimetableBuilderView } from "./TimetableBuilderView";
import { TimetableReadView } from "./TimetableReadView";

interface SectionTimetablePaneProps {
  sectionId: string;
  sectionName: string;
  workingDays: number[];
  /** Try the builder (editors, and teachers for their class-teacher section); else read only. */
  tryEdit: boolean;
  canEdit: boolean;
  canPublish: boolean;
  onOpenBell?: () => void;
  editNote?: ReactNode;
}

const NOT_ALLOWED = new Set([403]);

/** The builder where this user may edit the section, otherwise the published timetable. */
export function SectionTimetablePane({ sectionId, sectionName, workingDays, tryEdit, canEdit, canPublish, onOpenBell, editNote }: SectionTimetablePaneProps) {
  const query = useTimetableBuilder(tryEdit ? sectionId : null);
  const denied = query.error instanceof ApiError && NOT_ALLOWED.has(query.error.status);

  if (!tryEdit || denied) return <TimetableReadView sectionId={sectionId} sectionName={sectionName} workingDays={workingDays} />;
  if (query.isLoading) return <Skeleton className="h-96 w-full" />;
  if (query.error || !query.data)
    return (
      <Card>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Card>
    );
  const builder = query.data;
  if (!builder.timetable.periods.some((period) => !period.isBreak))
    return (
      <Card>
        <EmptyState
          icon={Bell}
          title="No bell schedule yet"
          description="Set the period times first; the timetable grid is built from them."
          action={
            onOpenBell ? (
              <Button variant="secondary" size="sm" onClick={onOpenBell}>
                Open bell schedule
              </Button>
            ) : undefined
          }
        />
      </Card>
    );
  const editable = builder.canEdit ?? builder.timetable.canEdit ?? canEdit;
  return (
    <TimetableBuilderView
      builder={builder}
      workingDays={workingDays}
      canEdit={canEdit}
      canPublish={canPublish}
      note={editable ? editNote : undefined}
    />
  );
}
