"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import { UploadField } from "@/features/files/components/UploadField";
import { useStudentLeaveForm } from "../use-leave-request-form";

interface StudentLeaveDialogProps {
  studentId: string;
  childName: string;
  onClose: () => void;
}

export function StudentLeaveDialog({ studentId, childName, onClose }: StudentLeaveDialogProps) {
  const { form, submit, submitting, formError } = useStudentLeaveForm(studentId, onClose);
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Request leave"
      description={`For ${childName}. The class teacher reviews the request.`}
      submitLabel="Send request"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="from" label="First day" type="date" required />
        <TextField name="to" label="Last day" type="date" required />
      </div>
      <TextareaField name="reason" label="Reason" required placeholder="e.g. Family wedding out of town" />
      <UploadField name="attachmentFileId" label="Supporting document" purpose="ATTACHMENT" />
    </FormDialog>
  );
}
