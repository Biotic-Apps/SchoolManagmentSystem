"use client";

import type { Option } from "@/components/shared/OptionSelect";
import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import { MOVEMENT_TYPE_OPTIONS } from "../options";
import { useMovementForm } from "../use-movement-form";

const QUANTITY_HINT: Record<string, string> = {
  ADJUST: "Use a negative number to reduce stock, e.g. -3.",
  ISSUE: "Taken out of this branch's stock.",
  TRANSFER_OUT: "Taken out of this branch's stock.",
};

interface MovementFormDialogProps {
  branchId: string;
  itemOptions: Option[];
  branchOptions: Option[];
  onClose: () => void;
}

export function MovementFormDialog({ branchId, itemOptions, branchOptions, onClose }: MovementFormDialogProps) {
  const movement = useMovementForm(branchId, branchOptions, onClose);
  const quantityHint = [QUANTITY_HINT[movement.type], movement.inStockHint].filter(Boolean).join(" ");

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Record stock movement"
      description="Stock can't go below zero; every movement is kept in the history."
      submitLabel="Record movement"
      submitting={movement.submitting}
      onSubmit={movement.submit}
      form={movement.form}
      error={movement.formError}
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="itemId" label="Item" options={itemOptions} required className="sm:col-span-2" />
        <SelectField name="type" label="Movement type" options={MOVEMENT_TYPE_OPTIONS} required />
        <TextField
          name="quantity"
          label="Quantity"
          required
          inputMode="numeric"
          inputClassName="text-right tabular-nums"
          hint={quantityHint || undefined}
        />
        {movement.type === "TRANSFER_OUT" && (
          <SelectField
            name="toBranchId"
            label="To branch"
            options={movement.targetBranches}
            required
            placeholder={movement.targetBranches.length ? "Select" : "No other branch in your scope"}
          />
        )}
        {movement.type === "ISSUE" && (
          <TextField name="issuedTo" label="Issued to" maxLength={120} placeholder="Person or department" />
        )}
      </div>
      <TextareaField name="reason" label="Reason" required={movement.type === "ADJUST"} rows={2} />
    </FormDialog>
  );
}
