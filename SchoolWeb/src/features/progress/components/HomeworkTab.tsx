"use client";

import { NotebookPen } from "lucide-react";
import { DateStepper } from "@/components/shared/DateStepper";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { todayIso } from "@/lib/dates";
import { useHomeworkTab } from "../use-homework-tab";
import { HomeworkEntryPicker } from "./HomeworkEntryPicker";
import { HomeworkRosterPanel } from "./HomeworkRosterPanel";

export function HomeworkTab({ sectionId }: { sectionId: string | null }) {
  const tab = useHomeworkTab(sectionId);
  const { diary, entry } = tab;

  return (
    <div className="flex flex-col gap-4">
      <DateStepper value={tab.date} onChange={tab.setDate} max={todayIso()} className="md:w-72" />
      {diary.isLoading && <Skeleton className="h-48 w-full" />}
      {!!diary.error && (
        <Card>
          <ErrorState error={diary.error} onRetry={() => diary.refetch()} />
        </Card>
      )}
      {diary.data && tab.entries.length === 0 && (
        <Card>
          <EmptyState
            icon={NotebookPen}
            title="No homework set on this day"
            description="Published diary entries with homework appear here to tick off."
          />
        </Card>
      )}
      {entry && (
        <>
          <HomeworkEntryPicker entries={tab.entries} selectedId={entry.id} onSelect={tab.selectEntry} />
          <HomeworkRosterPanel
            key={entry.id}
            entry={entry}
            students={tab.students}
            studentsQuery={tab.studentsQuery}
            editable={tab.canEdit}
          />
        </>
      )}
    </div>
  );
}
