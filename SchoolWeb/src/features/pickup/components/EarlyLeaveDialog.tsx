"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import { TimeField } from "@/components/shared/form/TimeField";
import { StudentSearchField } from "@/features/students/components/StudentSearchField";
import { useEarlyLeaveForm } from "../use-early-leave-form";

interface EarlyLeaveDialogProps {
  branchId: string;
  date: string;
  onClose: () => void;
}

/** Staff-initiated early-leave request. */
export function EarlyLeaveDialog({ branchId, date, onClose }: EarlyLeaveDialogProps) {
  const { form, submit, submitting, formError } = useEarlyLeaveForm({ date, onDone: onClose });
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="New early-leave request"
      submitLabel="Create request"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <StudentSearchField name="studentId" required branchId={branchId} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField name="date" label="Date" type="date" required />
        <TimeField name="time" label="Leaving at" required />
      </div>
      <TextareaField name="reason" label="Reason" required />
    </FormDialog>
  );
}
