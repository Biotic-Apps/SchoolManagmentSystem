"use client";

import { MessageSquareText, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useFeedbackTab } from "../use-feedback-tab";
import { NoteFormDialog } from "./NoteFormDialog";
import { NotesTimeline } from "./NotesTimeline";
import { StudentPickList } from "./StudentPickList";

export function FeedbackTab({ sectionId }: { sectionId: string | null }) {
  const tab = useFeedbackTab(sectionId);
  const { student, notes } = tab;

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <StudentPickList
        query={tab.studentsQuery}
        students={tab.students}
        selectedId={student?.id ?? null}
        onSelect={tab.selectStudent}
      />
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle>{student ? student.name : "Feedback notes"}</CardTitle>
          {tab.canAdd && (
            <Button size="sm" onClick={() => tab.setAdding(true)}>
              <Plus />
              Add note
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!student && (
            <EmptyState
              icon={MessageSquareText}
              title="Pick a student"
              description="Their feedback notes appear here, newest first."
            />
          )}
          {student && notes.isLoading && <Skeleton className="h-40 w-full" />}
          {!!notes.error && <ErrorState error={notes.error} onRetry={() => notes.refetch()} />}
          {student && notes.data && (
            <NotesTimeline
              notes={notes.data}
              showVisibility
              emptyDescription="Add a note about homework, behaviour, learning or an achievement."
            />
          )}
        </CardContent>
      </Card>
      {tab.adding && student && (
        <NoteFormDialog studentId={student.id} studentName={student.name} onClose={() => tab.setAdding(false)} />
      )}
    </div>
  );
}
