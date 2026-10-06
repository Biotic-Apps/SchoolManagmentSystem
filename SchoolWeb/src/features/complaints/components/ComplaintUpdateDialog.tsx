"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { AttachmentsField } from "@/features/files/components/AttachmentsField";
import { UPDATE_STATUS_OPTIONS } from "../options";
import { useComplaintUpdateForm } from "../use-complaint-update-form";

interface ComplaintUpdateDialogProps {
  complaintId: string;
  /** Only the assignee moves the status forward. */
  canSetStatus: boolean;
  onClose: () => void;
}

export function ComplaintUpdateDialog({ complaintId, canSetStatus, onClose }: ComplaintUpdateDialogProps) {
  const { form, submit, submitting, formError } = useComplaintUpdateForm(complaintId, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Add update"
      submitLabel="Post update"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <TextareaField name="message" label="Update" required rows={4} />
      {canSetStatus && (
        <SelectField
          name="status"
          label="Status"
          options={UPDATE_STATUS_OPTIONS}
          emptyLabel="Keep current status"
          placeholder="Keep current status"
        />
      )}
      <AttachmentsField name="attachmentFileIds" max={3} />
    </FormDialog>
  );
}
