"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import type { StudentDetail } from "../types";
import { useWithdrawForm } from "../use-withdraw-form";

export function WithdrawStudentDialog({ student, onClose }: { student: StudentDetail; onClose: () => void }) {
  const { form, submit, submitting, formError } = useWithdrawForm(student, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Withdraw ${student.name}?`}
      submitLabel="Withdraw student"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <InlineNotice tone="warning">
        The current enrollment ends and the student is marked withdrawn. Records are kept.
      </InlineNotice>
      <TextField name="effectiveDate" label="Effective date" type="date" required />
      <TextareaField name="reason" label="Reason" rows={3} required />
    </FormDialog>
  );
}
