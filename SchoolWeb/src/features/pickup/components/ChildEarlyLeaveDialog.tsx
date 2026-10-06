"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import type { Option } from "@/components/shared/OptionSelect";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import { TimeField } from "@/components/shared/form/TimeField";
import { todayIso } from "@/lib/dates";
import { useEarlyLeaveForm } from "../use-early-leave-form";

interface ChildEarlyLeaveDialogProps {
  studentId: string;
  pickupOptions: Option[];
  onClose: () => void;
}

export function ChildEarlyLeaveDialog({ studentId, pickupOptions, onClose }: ChildEarlyLeaveDialogProps) {
  const today = todayIso();
  const { form, submit, submitting, formError } = useEarlyLeaveForm({ studentId, date: today, onDone: onClose });
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Request early leave"
      description="The class teacher or principal approves it; you are notified either way."
      submitLabel="Send request"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField name="date" label="Date" type="date" min={today} required />
        <TimeField name="time" label="Leaving at" required />
      </div>
      <TextareaField name="reason" label="Reason" required placeholder="e.g. Doctor's appointment" />
      <SelectField
        name="pickupPersonId"
        label="Who will collect"
        options={pickupOptions}
        emptyLabel="A guardian (me)"
        placeholder="A guardian (me)"
        hint="Only persons verified by the school are listed."
      />
    </FormDialog>
  );
}
