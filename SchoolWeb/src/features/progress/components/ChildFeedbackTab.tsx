"use client";

import { ErrorState } from "@/components/shared/ErrorState";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useProgressNotes } from "../api";
import { NotesTimeline } from "./NotesTimeline";

/** PARENT: only notes teachers shared with parents come back from the API. */
export function ChildFeedbackTab({ childId }: { childId: string }) {
  const notes = useProgressNotes(childId);

  return (
    <Card>
      <CardContent>
        {notes.isLoading && <Skeleton className="h-40 w-full" />}
        {!!notes.error && <ErrorState error={notes.error} onRetry={() => notes.refetch()} />}
        {notes.data && (
          <NotesTimeline
            notes={notes.data}
            emptyDescription="Notes from teachers about homework, behaviour and learning appear here."
          />
        )}
      </CardContent>
    </Card>
  );
}
