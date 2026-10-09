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
        <TextField
          name="name"
          label="Name"
          required
          maxLength={100}
          placeholder="e.g. Mid-term exam 2026"
          hint="Shown to teachers, parents and on report cards"
          className="sm:col-span-2"
        />
        <SelectField
          name="type"
          label="Type"
          options={EXAM_TYPE_OPTIONS}
          required
          placeholder="Select exam type"
          hint="Unit test, mid-term, term or final exam"
        />
        <SelectField
          name="gradingSchemeId"
          label="Grading scheme"
          options={form.schemeOptions}
          required
          placeholder={form.noSchemes ? "No grading scheme yet" : "Select grading scheme"}
          hint={
            form.noSchemes
              ? "No grading scheme yet — add one in the Grading schemes tab"
              : "Turns marks into grades (A, B, C…) and sets the pass mark"
          }
        />
        <SelectField
          name="termId"
          label="Term"
          options={form.termOptions}
          emptyLabel="No term"
          hint="Optional: the term this exam belongs to"
        />
        <TextField
          name="weightPercent"
          label="Weight %"
          inputMode="numeric"
          placeholder="e.g. 30"
          hint="How much this exam counts in the final yearly result. Leave empty if it doesn't count."
        />
      </div>
      <FormSection title="Classes">
        <ClassChecklistField name="classIds" options={form.classOptions} loading={form.classesLoading} />
      </FormSection>
    </FormDialog>
  );
}
