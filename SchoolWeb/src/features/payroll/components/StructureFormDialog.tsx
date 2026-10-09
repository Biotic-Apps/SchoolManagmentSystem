"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { MoneyField } from "@/components/shared/form/MoneyField";
import { MonthField } from "@/components/shared/form/MonthField";
import type { SalaryStructure } from "../types";
import { useStructureForm } from "../use-structure-form";
import { SalaryItemsFields } from "./SalaryItemsFields";

interface StructureFormDialogProps {
  staffId: string;
  staffName: string;
  current: SalaryStructure | null;
  onClose: () => void;
}

export function StructureFormDialog({ staffId, staffName, current, onClose }: StructureFormDialogProps) {
  const { form, submit, submitting, formError, allowances, deductions } = useStructureForm(staffId, current, onClose);
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Salary · ${staffName}`}
      submitLabel="Save salary"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="lg"
    >
      <InlineNotice>Earlier salaries are kept. The new salary applies from the chosen month. Absences, lates and overtime are worked out from attendance each month.</InlineNotice>
      <div className="grid gap-4 sm:grid-cols-2">
        <MonthField name="effectiveFrom" label="Effective from" required />
        <MoneyField name="basic" label="Basic salary" required />
      </div>
      <SalaryItemsFields name="allowances" title="Allowances" itemLabel="Allowance" placeholder="e.g. House rent" rows={allowances} />
      <SalaryItemsFields name="deductions" title="Deductions" itemLabel="Deduction" placeholder="e.g. Provident fund" rows={deductions} />
      <MoneyField
        name="overtimeRate"
        label="Overtime pay per hour (optional)"
        hint="Leave empty to use the school rule in Pay rules (basic ÷ working hours × multiplier)."
      />
    </FormDialog>
  );
}
