"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import { TimeField } from "@/components/shared/form/TimeField";
import type { Application } from "../types";
import { useScheduleTestForm } from "../use-application-action-forms";

export function ScheduleTestDialog({ app, onClose }: { app: Application; onClose: () => void }) {
  const { form, submit, submitting, formError } = useScheduleTestForm(app, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={app.test ? "Reschedule entrance test" : "Schedule entrance test"}
      description="The primary guardian is notified of the date, time and venue."
      submitLabel={app.test ? "Reschedule" : "Schedule test"}
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="date" label="Date" type="date" required />
        <TimeField name="time" label="Time" required />
        <TextField name="venue" label="Venue" placeholder="e.g. Room 12, Main block" className="sm:col-span-2" />
        <TextareaField name="notes" label="Notes for the guardian" rows={2} className="sm:col-span-2" />
      </div>
    </FormDialog>
  );
}
