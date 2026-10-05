"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { useAddAssignmentForm } from "../use-add-assignment-form";
import { useAssignmentOptions } from "../use-assignment-options";
import { AssignmentFields } from "./AssignmentFields";

interface AddAssignmentDialogProps {
  userId: string;
  userName: string;
  onClose: () => void;
}

export function AddAssignmentDialog({ userId, userName, onClose }: AddAssignmentDialogProps) {
  const { form, submit, submitting, formError } = useAddAssignmentForm(userId, onClose);
  const options = useAssignmentOptions();

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Assign a role to ${userName}`}
      submitLabel="Assign role"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <AssignmentFields prefix="assignment" options={options} />
    </FormDialog>
  );
}
