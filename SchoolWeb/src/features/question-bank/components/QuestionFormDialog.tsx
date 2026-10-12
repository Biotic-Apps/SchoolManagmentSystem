"use client";

import { useWatch } from "react-hook-form";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormSection } from "@/components/shared/FormSection";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import type { Option } from "@/components/shared/OptionSelect";
import { QUESTION_TYPE_OPTIONS, DIFFICULTY_OPTIONS } from "../options";
import type { Question } from "../types";
import { useQuestionForm } from "../use-question-form";

interface QuestionFormDialogProps {
  question: Question | null;
  schoolId: string;
  classOptions: Option[];
  subjectOptions: Option[];
  onClose: () => void;
}

export function QuestionFormDialog({
  question,
  schoolId,
  classOptions,
  subjectOptions,
  onClose,
}: QuestionFormDialogProps) {
  const { form, submit, submitting, formError } = useQuestionForm(question, schoolId, onClose);
  const questionType = useWatch({ control: form.control, name: "questionType" });

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={question ? "Edit question" : "Add question"}
      description="Add a question to the bank for this subject and class."
      submitLabel={question ? "Save changes" : "Add question"}
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="xl"
    >
      <FormSection title="Classification">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField name="subjectId" label="Subject" options={subjectOptions} required />
          <SelectField name="classId" label="Class" options={classOptions} required />
          <TextField name="chapterName" label="Chapter / Topic" required maxLength={150} />
          <SelectField name="questionType" label="Question type" options={QUESTION_TYPE_OPTIONS} required />
          <SelectField name="difficultyLevel" label="Difficulty" options={DIFFICULTY_OPTIONS} required />
          <TextField name="marks" label="Marks" type="number" required />
        </div>
      </FormSection>
      <FormSection title="Content">
        <TextareaField name="questionText" label="Question text" rows={4} required />
        {questionType === "MCQ" && (
          <TextareaField
            name="options"
            label="Options (one per line)"
            hint="Enter each option on a new line, e.g. four lines for four choices."
            rows={4}
          />
        )}
        <TextareaField name="correctAnswer" label="Correct answer" rows={2} required />
      </FormSection>
    </FormDialog>
  );
}
