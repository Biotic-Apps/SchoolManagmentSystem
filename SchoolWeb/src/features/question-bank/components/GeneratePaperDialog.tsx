"use client";

import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormSection } from "@/components/shared/FormSection";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import type { Option } from "@/components/shared/OptionSelect";
import { Button } from "@/components/ui/Button";
import { useServerForm } from "@/lib/use-server-form";
import { useGenerateExamPaper } from "../api";
import { QUESTION_TYPE_OPTIONS, DIFFICULTY_OPTIONS } from "../options";
import { generatePaperDefaults, generatePaperSchema, type GeneratePaperFormValues } from "../schemas";
import type { ExamPaper, GenerateExamPaperInput } from "../types";

interface GeneratePaperDialogProps {
  schoolId: string;
  classOptions: Option[];
  subjectOptions: Option[];
  onClose: () => void;
  onGenerated: (paper: ExamPaper) => void;
}

export function GeneratePaperDialog({
  schoolId,
  classOptions,
  subjectOptions,
  onClose,
  onGenerated,
}: GeneratePaperDialogProps) {
  const generate = useGenerateExamPaper();
  const { form, submit, submitting, formError } = useServerForm<GeneratePaperFormValues, ExamPaper>({
    schema: generatePaperSchema,
    defaultValues: generatePaperDefaults(),
    onSubmit: (values) => {
      const input: GenerateExamPaperInput = {
        schoolId,
        subjectId: values.subjectId,
        classId: values.classId,
        title: values.title.trim(),
        totalMarks: Number(values.totalMarks),
        duration: Number(values.duration),
        sections: values.sections.map((s) => ({
          title: s.title.trim(),
          questionCount: Number(s.questionCount),
          type: s.type as GenerateExamPaperInput["sections"][0]["type"],
          difficulty: s.difficulty as GenerateExamPaperInput["sections"][0]["difficulty"],
          marksPerQuestion: Number(s.marksPerQuestion),
        })),
      };
      return generate.mutateAsync(input);
    },
    onSuccess: (paper) => {
      onGenerated(paper);
      onClose();
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "sections" });

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Generate exam paper"
      description="Configure sections and the system will randomly pick questions from the bank."
      submitLabel="Generate"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="xl"
    >
      <FormSection title="Paper details">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField name="subjectId" label="Subject" options={subjectOptions} required />
          <SelectField name="classId" label="Class" options={classOptions} required />
          <TextField name="title" label="Paper title" required maxLength={200} className="sm:col-span-2" />
          <TextField name="totalMarks" label="Total marks" type="number" required />
          <TextField name="duration" label="Duration (minutes)" type="number" required />
        </div>
      </FormSection>
      <FormSection title="Sections">
        {fields.map((field, index) => (
          <div key={field.id} className="mb-4 rounded-lg border border-border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-label font-medium">Section {index + 1}</span>
              {fields.length > 1 && (
                <Button variant="ghost" onClick={() => remove(index)} className="h-8 w-8 p-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <TextField name={`sections.${index}.title`} label="Section title" required />
              <SelectField name={`sections.${index}.type`} label="Question type" options={QUESTION_TYPE_OPTIONS} required />
              <SelectField name={`sections.${index}.difficulty`} label="Difficulty" options={DIFFICULTY_OPTIONS} required />
              <TextField name={`sections.${index}.questionCount`} label="No. of questions" type="number" required />
              <TextField name={`sections.${index}.marksPerQuestion`} label="Marks per question" type="number" required />
            </div>
          </div>
        ))}
        <Button
          variant="secondary"
          onClick={() =>
            append({ title: `Section ${String.fromCharCode(65 + fields.length)}`, questionCount: "5", type: "SHORT", difficulty: "MEDIUM", marksPerQuestion: "2" })
          }
        >
          <Plus className="mr-1 h-4 w-4" /> Add section
        </Button>
      </FormSection>
    </FormDialog>
  );
}
