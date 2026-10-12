"use client";

import { useForm } from "react-hook-form";
import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { AttachmentsField } from "@/features/files/components/AttachmentsField";
import { useSectionScope } from "@/features/classes/use-section-scope";
import { useClassSubjectOptions } from "@/features/classes/api";
import { useCreateHomework } from "../api";
import { errorMessage } from "@/lib/error-messages";

interface AssignHomeworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
}

interface FormValues {
  subjectId: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: string;
  attachmentFileIds: string[];
}

export function AssignHomeworkDialog({ open, onOpenChange, sectionId }: AssignHomeworkDialogProps) {
  const scope = useSectionScope();
  const section = scope.sections.find((s) => s.id === sectionId);
  const subjects = useClassSubjectOptions(section?.classId);
  const create = useCreateHomework();

  const form = useForm<FormValues>({
    defaultValues: {
      subjectId: "",
      title: "",
      description: "",
      dueDate: "",
      maxMarks: "",
      attachmentFileIds: [],
    },
  });

  const formError = create.error ? errorMessage(create.error) : null;

  const submit = form.handleSubmit(async (values) => {
    await create.mutateAsync({
      sectionId,
      subjectId: values.subjectId,
      title: values.title,
      description: values.description,
      dueDate: values.dueDate,
      maxMarks: values.maxMarks ? Number(values.maxMarks) : undefined,
      attachmentFileIds: values.attachmentFileIds,
    });
    onOpenChange(false);
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Assign homework"
      description="Create a new homework assignment for this section."
      submitLabel="Assign"
      submitting={create.isPending}
      onSubmit={submit}
      form={form}
      error={formError}
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          name="subjectId"
          label="Subject"
          options={subjects.options}
          required
          className="sm:col-span-2"
        />
        <TextField name="title" label="Title" required className="sm:col-span-2" />
        <TextareaField name="description" label="Description" rows={4} required className="sm:col-span-2" />
        <TextField name="dueDate" label="Due date" type="date" required />
        <TextField name="maxMarks" label="Max marks (optional)" type="number" />
      </div>
      <AttachmentsField name="attachmentFileIds" />
    </FormDialog>
  );
}
