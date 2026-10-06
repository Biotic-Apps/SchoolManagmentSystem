"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import { AttachmentsField } from "@/features/files/components/AttachmentsField";
import { StudentSearchField } from "@/features/students/components/StudentSearchField";
import { useNewThreadForm } from "../use-new-thread-form";

interface NewThreadDialogProps {
  onClose: () => void;
  onCreated: (threadId: string) => void;
}

export function NewThreadDialog({ onClose, onCreated }: NewThreadDialogProps) {
  const thread = useNewThreadForm(onCreated);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="New message"
      description={
        thread.isParent
          ? "Write to your child's teachers or the school office."
          : "Write to the guardians of a student you teach."
      }
      submitLabel="Send"
      submitting={thread.submitting}
      onSubmit={thread.submit}
      form={thread.form}
      error={thread.error}
      size="lg"
    >
      {thread.isParent ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField name="studentId" label="Child" options={thread.childOptions} required />
          <SelectField
            name="staffUserId"
            label="To"
            options={thread.staffOptions}
            emptyLabel="Class teacher / office"
            placeholder={thread.staffLoading ? "Loading teachers…" : "Class teacher"}
            hint="Leave empty to reach the class teacher."
          />
        </div>
      ) : (
        <StudentSearchField name="studentId" required />
      )}
      <TextField name="subject" label="Subject" required maxLength={150} />
      <TextareaField name="body" label="Message" required rows={5} />
      <AttachmentsField name="attachmentFileIds" max={3} />
    </FormDialog>
  );
}
