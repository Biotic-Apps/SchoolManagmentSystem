"use client";

import { FormSection } from "@/components/shared/FormSection";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { SelectField } from "@/components/shared/form/SelectField";
import { ONLINE_GATEWAY_OPTIONS } from "../settings-schema";

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
      <SelectField
        name="onlineGateway"
        label="Online fee payment"
        options={ONLINE_GATEWAY_OPTIONS}
        hint="Parents see Pay Online only when a wallet is chosen. The wallet's merchant account must be set up on the server."
        required
      />
    </FormSection>
  );
}
