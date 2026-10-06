"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import { AttachmentsField } from "@/features/files/components/AttachmentsField";
import { StudentSearchField } from "@/features/students/components/StudentSearchField";
import { COMPLAINT_CATEGORY_OPTIONS } from "../options";
import type { Complaint } from "../types";
import { useComplaintForm } from "../use-complaint-form";

interface ComplaintFormDialogProps {
  onClose: () => void;
  onSaved: (complaint: Complaint) => void;
}

export function ComplaintFormDialog({ onClose, onSaved }: ComplaintFormDialogProps) {
  const complaint = useComplaintForm(onSaved);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="File a complaint"
      description="It goes to the right person automatically and must be answered within the response deadline."
      submitLabel="File complaint"
      submitting={complaint.submitting}
      onSubmit={complaint.submit}
      form={complaint.form}
      error={complaint.formError}
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="category" label="Category" options={COMPLAINT_CATEGORY_OPTIONS} required />
        {complaint.isParent && (
          <SelectField
            name="studentId"
            label="Child"
            options={complaint.childOptions}
            emptyLabel="Not about a specific child"
          />
        )}
      </div>
      {!complaint.isParent && <StudentSearchField name="studentId" label="Student (optional)" />}
      <TextField name="subject" label="Subject" required maxLength={150} />
      <TextareaField name="description" label="Details" required rows={5} />
      <AttachmentsField name="attachmentFileIds" max={5} />
      <CheckboxField
        name="anonymous"
        label="File anonymously"
        hint="Your name is hidden from staff; the principal can still see it."
      />
    </FormDialog>
  );
}
