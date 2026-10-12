"use client";

import { useForm } from "react-hook-form";
import { FormDialog } from "@/components/shared/FormDialog";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { errorMessage } from "@/lib/error-messages";
import { useGradeSubmission } from "../api";
import type { HomeworkSubmission } from "../types";

interface GradeDialogProps {
  submission: HomeworkSubmission;
  maxMarks: number | null;
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  marks: string;
  grade: string;
  feedback: string;
}

export function GradeDialog({ submission, maxMarks, open, onClose }: GradeDialogProps) {
  const grade = useGradeSubmission();

  const form = useForm<FormValues>({
    defaultValues: {
      marks: submission.marks?.toString() ?? "",
      grade: submission.grade ?? "",
      feedback: submission.feedback ?? "",
    },
  });

  const formError = grade.error ? errorMessage(grade.error) : null;

  const submit = form.handleSubmit(async (values) => {
    await grade.mutateAsync({
      submissionId: submission.id,
      marks: values.marks ? Number(values.marks) : undefined,
      grade: values.grade || undefined,
      feedback: values.feedback || undefined,
    });
    onClose();
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={`Grade ${submission.student.name}`}
      description={maxMarks != null ? `Maximum marks: ${maxMarks}` : undefined}
      submitLabel="Save grade"
      submitting={grade.isPending}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="marks" label={maxMarks != null ? `Marks (out of ${maxMarks})` : "Marks"} type="number" />
        <TextField name="grade" label="Grade (optional)" />
        <TextareaField name="feedback" label="Feedback (optional)" rows={3} className="sm:col-span-2" />
      </div>
    </FormDialog>
  );
}
