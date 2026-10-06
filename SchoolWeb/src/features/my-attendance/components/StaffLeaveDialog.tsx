"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import { LEAVE_TYPE_OPTIONS } from "@/features/attendance/options";
import { useStaffLeaveForm } from "@/features/attendance/use-leave-request-form";

export function StaffLeaveDialog({ onClose }: { onClose: () => void }) {
  const { form, submit, submitting, formError } = useStaffLeaveForm(onClose);
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Request leave"
      description="The principal reviews your request."
      submitLabel="Send request"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <SelectField name="type" label="Leave type" options={LEAVE_TYPE_OPTIONS} placeholder="Select leave type" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="from" label="First day" type="date" required />
        <TextField name="to" label="Last day" type="date" required />
      </div>
      <TextareaField name="reason" label="Reason" required placeholder="e.g. Medical appointment" />
    </FormDialog>
  );
}
