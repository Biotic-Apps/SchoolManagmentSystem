"use client";

import { useState } from "react";
import { CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/Sheet";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AttachmentList } from "@/components/shared/AttachmentList";
import { useHomeworkSubmissions, useGradeSubmission, useReturnSubmission } from "../api";
import { GradeDialog } from "./GradeDialog";
import type { Homework, HomeworkSubmission } from "../types";

interface SubmissionsPanelProps {
  homework: Homework;
  open: boolean;
  onClose: () => void;
}

export function SubmissionsPanel({ homework, open, onClose }: SubmissionsPanelProps) {
  const query = useHomeworkSubmissions(homework.id);
  const [grading, setGrading] = useState<HomeworkSubmission | null>(null);
  const returnSub = useReturnSubmission();

  const handleReturn = async (sub: HomeworkSubmission) => {
    await returnSub.mutateAsync({
      submissionId: sub.id,
      feedback: "Please revise and resubmit.",
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent>
          <div className="flex flex-col gap-1 border-b border-border px-6 py-4">
            <SheetTitle className="text-heading text-fg">{homework.title}</SheetTitle>
            <SheetDescription className="text-caption text-fg-muted">
              {homework.subject.name} &middot; Due {homework.dueDate} &middot;{" "}
              {query.data?.length ?? 0} submissions
            </SheetDescription>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {query.isLoading && <Skeleton className="h-32 w-full" />}
            {query.data && query.data.length === 0 && (
              <EmptyState title="No submissions yet" description="Students have not submitted homework." />
            )}
            <div className="flex flex-col gap-4">
              {query.data?.map((sub) => (
                <SubmissionCard
                  key={sub.id}
                  submission={sub}
                  maxMarks={homework.maxMarks}
                  onGrade={() => setGrading(sub)}
                  onReturn={() => handleReturn(sub)}
                  returning={returnSub.isPending}
                />
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {grading && (
        <GradeDialog
          submission={grading}
          maxMarks={homework.maxMarks}
          open={!!grading}
          onClose={() => setGrading(null)}
        />
      )}
    </>
  );
}

function SubmissionCard({
  submission,
  maxMarks,
  onGrade,
  onReturn,
  returning,
}: {
  submission: HomeworkSubmission;
  maxMarks: number | null;
  onGrade: () => void;
  onReturn: () => void;
  returning: boolean;
}) {
  return (
    <div className="rounded-card border border-border p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-fg">{submission.student.name}</p>
          <p className="text-caption text-fg-muted">
            Submitted {new Date(submission.submittedAt).toLocaleDateString()}
          </p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      {submission.text && (
        <p className="mt-2 whitespace-pre-wrap text-label text-fg-muted">{submission.text}</p>
      )}
      {submission.attachments.length > 0 && (
        <div className="mt-2">
          <AttachmentList items={submission.attachments} />
        </div>
      )}

      {submission.status === "GRADED" && (
        <div className="mt-3 rounded-input bg-background p-3 text-label">
          {submission.marks != null && (
            <p>
              Marks: <strong>{submission.marks}</strong>
              {maxMarks != null ? ` / ${maxMarks}` : ""}
            </p>
          )}
          {submission.grade && (
            <p>
              Grade: <strong>{submission.grade}</strong>
            </p>
          )}
          {submission.feedback && <p className="mt-1 text-fg-muted">{submission.feedback}</p>}
        </div>
      )}

      {(submission.status === "SUBMITTED" || submission.status === "LATE") && (
        <div className="mt-3 flex gap-2">
          <Button variant="primary" size="sm" onClick={onGrade}>
            <CheckCircle />
            Grade
          </Button>
          <Button variant="ghost" size="sm" onClick={onReturn} loading={returning}>
            <RotateCcw />
            Return
          </Button>
        </div>
      )}
    </div>
  );
}
