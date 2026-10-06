"use client";

import type { Option } from "@/components/shared/OptionSelect";
import { FormDialog } from "@/components/shared/FormDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { MoneyField } from "@/components/shared/form/MoneyField";
import { MonthField } from "@/components/shared/form/MonthField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { ADJUSTMENT_KIND_OPTIONS } from "../options";
import { useAdjustmentForm } from "../use-adjustment-form";

interface AdjustmentFormDialogProps {
  month: string;
  staffId: string | undefined;
  staffOptions: Option[];
  onClose: () => void;
}

export function AdjustmentFormDialog({ month, staffId, staffOptions, onClose }: AdjustmentFormDialogProps) {
  const { form, submit, submitting, formError } = useAdjustmentForm(month, staffId, onClose);
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Add adjustment"
      submitLabel="Add adjustment"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <InlineNotice>Adjustments are approved together with the month&apos;s payroll run.</InlineNotice>
      <SelectField name="staffId" label="Staff member" options={staffOptions} placeholder="Select staff member" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <MonthField name="month" label="Month" required />
        <SelectField name="kind" label="Kind" options={ADJUSTMENT_KIND_OPTIONS} placeholder="Select kind" required />
      </div>
      <MoneyField name="amount" label="Amount" required />
      <TextareaField name="reason" label="Reason" required placeholder="e.g. Eid bonus" />
    </FormDialog>
  );
}
