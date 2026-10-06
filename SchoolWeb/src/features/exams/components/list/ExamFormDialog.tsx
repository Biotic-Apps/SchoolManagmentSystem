"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { FormSection } from "@/components/shared/FormSection";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { EXAM_TYPE_OPTIONS } from "../../options";
import type { Exam } from "../../types";
import { useExamForm } from "../../use-exam-form";
import { ClassChecklistField } from "./ClassChecklistField";

interface ExamFormDialogProps {
  exam: Exam | null;
  scope: { schoolId: string | null; branchId: string; sessionId: string };
  onClose: () => void;
  onSaved?: (exam: Exam) => void;
}

export function ExamFormDialog({ exam, scope, onClose, onSaved }: ExamFormDialogProps) {
  const form = useExamForm(exam, scope, (saved) => {
    onClose();
    onSaved?.(saved);
  });

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={exam ? "Edit exam" : "New exam"}
      description="Set the date sheet after creating the exam."
      submitLabel={exam ? "Save changes" : "Create exam"}
      submitting={form.submitting}
      onSubmit={form.submit}
      form={form.form}
      error={form.formError}
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="name" label="Name" required maxLength={100} className="sm:col-span-2" />
        <SelectField name="type" label="Type" options={EXAM_TYPE_OPTIONS} required />
        <SelectField name="gradingSchemeId" label="Grading scheme" options={form.schemeOptions} required />
        <SelectField name="termId" label="Term" options={form.termOptions} emptyLabel="No term" />
        <TextField
          name="weightPercent"
          label="Weight %"
          inputMode="numeric"
          placeholder="Not weighted"
          hint="Share of the final result, if weighted"
        />
      </div>
      <FormSection title="Classes">
        <ClassChecklistField name="classIds" options={form.classOptions} loading={form.classesLoading} />
      </FormSection>
    </FormDialog>
  );
}
