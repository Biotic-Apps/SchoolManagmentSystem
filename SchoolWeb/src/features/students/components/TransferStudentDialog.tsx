"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import type { StudentDetail } from "../types";
import { useTransferForm } from "../use-transfer-form";

export function TransferStudentDialog({ student, onClose }: { student: StudentDetail; onClose: () => void }) {
  const { form, submit, submitting, formError, branchOptions, loadingBranches } = useTransferForm(student, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Transfer ${student.name}`}
      description="The destination branch accepts the transfer and places the student in a section."
      submitLabel="Request transfer"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <SelectField
        name="toBranchId"
        label="Destination branch"
        options={branchOptions}
        placeholder={loadingBranches ? "Loading branches" : "Select"}
        required
      />
      <TextField name="effectiveDate" label="Effective date" type="date" required />
      <TextareaField name="reason" label="Reason" rows={3} required />
    </FormDialog>
  );
}
