"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { MoneyField } from "@/components/shared/form/MoneyField";
import { TextField } from "@/components/shared/form/TextField";
import type { FeePlanFormValues } from "../../structure-schemas";

export function FeePlanLateFeeFields() {
  const { control } = useFormContext<FeePlanFormValues>();
  const enabled = useWatch({ control, name: "hasLateFee" });
  return (
    <div className="flex flex-col gap-3">
      <CheckboxField
        name="hasLateFee"
        label="Charge a late fee"
        hint="Added when an invoice is still unpaid the given number of days after its due date."
      />
      {enabled && (
        <div className="grid gap-4 sm:grid-cols-2">
          <MoneyField name="lateFeeAmount" label="Late fee" required />
          <TextField name="lateFeeAfterDays" label="Days after due date" inputMode="numeric" required />
        </div>
      )}
    </div>
  );
}
