"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { MoneyField } from "@/components/shared/form/MoneyField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { UploadField } from "@/features/files/components/UploadField";
import { todayIso } from "@/lib/dates";
import { PROOF_METHOD_OPTIONS } from "../../proof-options";
import type { Invoice } from "../../types";
import { useParentFeesProofForm } from "../../use-parent-fees-proof-form";

interface UploadProofDialogProps {
  invoices: Invoice[];
  invoiceId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadProofDialog(props: UploadProofDialogProps) {
  if (!props.open) return null;
  return <UploadProofForm {...props} />;
}

function UploadProofForm({ invoices, invoiceId, onOpenChange }: UploadProofDialogProps) {
  const proof = useParentFeesProofForm(invoices, invoiceId, () => onOpenChange(false));
  return (
    <FormDialog
      open
      onOpenChange={onOpenChange}
      title="Upload payment proof"
      description="For a bank transfer or wallet payment. The invoice is marked paid only after the school verifies it."
      submitLabel="Submit proof"
      submitting={proof.submitting}
      onSubmit={proof.submit}
      form={proof.form}
      error={proof.formError}
      size="lg"
    >
      {proof.uploadOff && (
        <InlineNotice tone="warning">
          Your school has turned off payment proof uploads. Please pay at the school office or contact the accounts office.
        </InlineNotice>
      )}
      <SelectField name="invoiceId" label="Invoice" options={proof.invoiceOptions} placeholder="Choose the invoice" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <MoneyField name="amount" label="Amount paid" required />
        <TextField name="paidOn" label="Paid on" type="date" max={todayIso()} required />
        <SelectField name="method" label="Paid by" options={PROOF_METHOD_OPTIONS} required />
        <TextField name="reference" label="Transaction reference" required />
      </div>
      <UploadField name="fileId" label="Receipt or screenshot" purpose="DOCUMENT" required />
    </FormDialog>
  );
}
