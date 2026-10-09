"use client";

import { FormSection } from "@/components/shared/FormSection";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";

/** Deposit account printed on the bank, school and parent copies of every fee challan. */
export function BranchBankFields() {
  return (
    <FormSection
      title="Fee challan bank details"
      description="Printed on every challan. Leave empty if parents pay at the school counter."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="bankName" label="Bank name" placeholder="e.g. HBL, Meezan Bank" maxLength={80} />
        <TextField name="bankBranchCode" label="Bank branch code" placeholder="e.g. 0456" maxLength={20} />
      </div>
      <TextField name="bankAccountTitle" label="Account title" maxLength={100} />
      <TextField
        name="bankAccountNumber"
        label="Account number / IBAN"
        maxLength={34}
        autoComplete="off"
        inputClassName="font-mono"
      />
      <TextareaField
        name="challanNote"
        label="Note on challans"
        hint="Optional, e.g. late-fee or refund policy. Up to 300 characters."
        rows={2}
      />
    </FormSection>
  );
}
