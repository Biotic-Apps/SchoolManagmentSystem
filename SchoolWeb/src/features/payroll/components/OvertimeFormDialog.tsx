"use client";

import type { Option } from "@/components/shared/OptionSelect";
import { FormDialog } from "@/components/shared/FormDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { DateField } from "@/components/shared/form/DateField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { useOvertimeForm } from "../use-overtime-form";

interface OvertimeFormDialogProps {
  date: string;
  staffOptions: Option[];
  onClose: () => void;
}

/** Overtime that attendance cannot show (events, weekend duty); it still needs approval. */
export function OvertimeFormDialog({ date, staffOptions, onClose }: OvertimeFormDialogProps) {
  const { form, submit, submitting, formError } = useOvertimeForm(date, onClose);
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Add overtime"
      submitLabel="Add overtime"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <InlineNotice>Use this for extra work that attendance does not show, such as an evening event. It is paid only after approval.</InlineNotice>
      <SelectField name="staffId" label="Staff member" options={staffOptions} placeholder="Select staff member" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <DateField name="date" label="Date" required />
        <TextField name="hours" label="Extra hours" inputMode="decimal" placeholder="e.g. 2 or 1.5" hint="1.5 = 1 hour 30 minutes" required />
      </div>
      <TextareaField name="reason" label="Reason" required placeholder="e.g. Stayed for the annual function" />
    </FormDialog>
  );
}
