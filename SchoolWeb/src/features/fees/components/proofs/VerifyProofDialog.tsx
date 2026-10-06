"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { todayIso } from "@/lib/dates";
import type { useProofReview } from "../../use-proof-review";

interface VerifyProofDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ReturnType<typeof useProofReview>["verifyForm"];
}

export function VerifyProofDialog({ open, onOpenChange, form }: VerifyProofDialogProps) {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Verify proof"
      description="Verifying creates a payment for this amount, allocates it to the invoice and issues a receipt."
      submitLabel="Verify and record payment"
      submitting={form.submitting}
      onSubmit={form.submit}
      form={form.form}
      error={form.formError}
    >
      <TextField
        name="receivedOn"
        label="Received on"
        type="date"
        max={todayIso()}
        hint="Leave empty to use the date the parent paid."
      />
      <TextareaField name="note" label="Note" />
    </FormDialog>
  );
}
