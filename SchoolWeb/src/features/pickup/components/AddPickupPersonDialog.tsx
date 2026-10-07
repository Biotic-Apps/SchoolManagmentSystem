"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { TextField } from "@/components/shared/form/TextField";
import { UploadField } from "@/features/files/components/UploadField";
import { usePickupPersonForm } from "../use-pickup-person-form";

export function AddPickupPersonDialog({ studentId, onClose }: { studentId: string; onClose: () => void }) {
  const { form, submit, submitting, formError } = usePickupPersonForm(studentId, onClose);
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Add authorized person"
      submitLabel="Add person"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <InlineNotice>The school verifies each person before they can collect your child.</InlineNotice>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField name="name" label="Full name" required />
        <TextField name="relation" label="Relation" required placeholder="e.g. Driver, Uncle" />
        <TextField name="phone" label="Phone" type="tel" required />
        <TextField name="cnic" label="CNIC" inputMode="numeric" autoComplete="off" placeholder="35202-1234567-1" />
      </div>
      <UploadField name="photoFileId" label="Photo" purpose="STUDENT_PHOTO" />
    </FormDialog>
  );
}
