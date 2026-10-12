"use client";

import { FormProvider, useForm } from "react-hook-form";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { AttachmentList } from "@/components/shared/AttachmentList";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { AttachmentsField } from "@/features/files/components/AttachmentsField";
import { errorMessage } from "@/lib/error-messages";
import { useStudentSubmission, useSubmitHomework } from "../api";
import type { Homework } from "../types";

interface SubmitHomeworkDialogProps {
  homework: Homework;
  studentId: string;
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  text: string;
  fileIds: string[];
}

export function SubmitHomeworkDialog({ homework, studentId, open, onClose }: SubmitHomeworkDialogProps) {
  const existing = useStudentSubmission(homework.id, studentId);
  const submit = useSubmitHomework();

  const form = useForm<FormValues>({
    defaultValues: {
      text: "",
      fileIds: [],
    },
  });

  const formError = submit.error ? errorMessage(submit.error) : null;
  const sub = existing.data;
  const canSubmit = !sub || sub.status === "SUBMITTED" || sub.status === "LATE" || sub.status === "RETURNED";

  const handleSubmit = form.handleSubmit(async (values) => {
    await submit.mutateAsync({
      homeworkId: homework.id,
      studentId,
      text: values.text || undefined,
      fileIds: values.fileIds.length ? values.fileIds : undefined,
    });
    onClose();
  });

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <div className="flex flex-col gap-1 border-b border-border px-6 py-4">
          <SheetTitle className="text-heading text-fg">{homework.title}</SheetTitle>
          <SheetDescription className="text-caption text-fg-muted">
            {homework.subject.name} &middot; Due {homework.dueDate}
            {homework.maxMarks != null ? ` &middot; Max marks: ${homework.maxMarks}` : ""}
          </SheetDescription>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="mb-4">
            <p className="whitespace-pre-wrap text-label text-fg">{homework.description}</p>
            {homework.attachments.length > 0 && (
              <div className="mt-2">
                <AttachmentList items={homework.attachments} />
              </div>
            )}
          </div>

          {existing.isLoading && <Skeleton className="h-24 w-full" />}

          {sub && sub.status === "GRADED" && (
            <div className="mb-4 rounded-card border border-border p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="font-semibold text-fg">Your submission</span>
                <StatusBadge status={sub.status} />
              </div>
              {sub.text && <p className="text-label text-fg-muted">{sub.text}</p>}
              {sub.attachments.length > 0 && (
                <div className="mt-2">
                  <AttachmentList items={sub.attachments} />
                </div>
              )}
              <div className="mt-3 rounded-input bg-background p-3 text-label">
                {sub.marks != null && (
                  <p>
                    Marks: <strong>{sub.marks}</strong>
                    {homework.maxMarks != null ? ` / ${homework.maxMarks}` : ""}
                  </p>
                )}
                {sub.grade && (
                  <p>
                    Grade: <strong>{sub.grade}</strong>
                  </p>
                )}
                {sub.feedback && <p className="mt-1 text-fg-muted">{sub.feedback}</p>}
              </div>
            </div>
          )}

          {sub && sub.status === "RETURNED" && (
            <div className="mb-4 rounded-card border border-warning/30 bg-warning/5 p-4">
              <p className="font-semibold text-fg">Returned for revision</p>
              {sub.feedback && <p className="mt-1 text-label text-fg-muted">{sub.feedback}</p>}
            </div>
          )}

          {canSubmit && (
            <FormProvider {...form}>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <TextareaField name="text" label="Your answer" rows={5} />
                <AttachmentsField name="fileIds" label="Attach files" max={10} />
                {formError && (
                  <p role="alert" className="text-caption text-error">
                    {formError}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" type="button" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" loading={submit.isPending}>
                    {sub ? "Resubmit" : "Submit"}
                  </Button>
                </div>
              </form>
            </FormProvider>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
