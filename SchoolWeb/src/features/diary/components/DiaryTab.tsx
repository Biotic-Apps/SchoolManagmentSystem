"use client";

import { NotebookPen, Plus } from "lucide-react";
import { DateStepper } from "@/components/shared/DateStepper";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { SectionScopeBar } from "@/features/classes/components/SectionScopeBar";
import { useDiaryTab } from "../use-diary-tab";
import { DiaryEditorDialog } from "./DiaryEditorDialog";
import { DiaryEntryActions } from "./DiaryEntryActions";
import { DiaryEntryCard } from "./DiaryEntryCard";

export function DiaryTab() {
  const tab = useDiaryTab();
  const { scope, query, entries, editor, sectionId } = tab;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SectionScopeBar scope={scope}>
          <DateStepper value={tab.date} onChange={tab.setDate} />
        </SectionScopeBar>
        {tab.canAdd && (
          <Button className="h-11" onClick={() => editor.show()} disabled={tab.freeSubjects.length === 0}>
            <Plus />
            Add entry
          </Button>
        )}
      </div>
      {tab.isHelper && <InlineNotice>You can save drafts; the responsible teacher publishes them.</InlineNotice>}
      {scope.isLoading && <Skeleton className="h-48 w-full" />}
      {!scope.isLoading && !sectionId && (
        <Card>
          <EmptyState icon={NotebookPen} title="No section in your scope" description="The diary is written per section." />
        </Card>
      )}
      {sectionId && query.isLoading && <Skeleton className="h-48 w-full" />}
      {!!query.error && (
        <Card>
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        </Card>
      )}
      {sectionId && query.data && entries.length === 0 && (
        <Card>
          <EmptyState
            icon={NotebookPen}
            title="No diary entries for this day"
            description="Add what each subject covered and any homework."
          />
        </Card>
      )}
      {entries.map((entry) => (
        <DiaryEntryCard key={entry.id} entry={entry} showMeta actions={<DiaryEntryActions entry={entry} tab={tab} />} />
      ))}
      {editor.open && sectionId && (
        <DiaryEditorDialog
          sectionId={sectionId}
          date={tab.date}
          entry={editor.item}
          subjectOptions={editor.item ? tab.subjectOptions : tab.freeSubjects}
          onClose={editor.close}
        />
      )}
    </div>
  );
}
