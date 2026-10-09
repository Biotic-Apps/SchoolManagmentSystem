"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { TimeField } from "@/components/shared/form/TimeField";
import { todayIso } from "@/lib/dates";
import { MODE_OPTIONS } from "../options";
import type { Meeting } from "../types";
import { useAcceptForm } from "../use-accept-form";

export function AcceptMeetingDialog({ meeting, onClose }: { meeting: Meeting; onClose: () => void }) {
  const accept = useAcceptForm(meeting, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Accept meeting request"
      description={`${meeting.guardian.name} (parent of ${meeting.student.name}) suggested this time. Keep it or change it — they are notified either way.`}
      submitLabel="Confirm meeting"
      submitting={accept.submitting}
      onSubmit={accept.submit}
      form={accept.form}
      error={accept.formError}
      size="lg"
    >
      <p className="whitespace-pre-wrap break-words rounded-input bg-background px-4 py-3 text-label text-fg">
        {meeting.agenda}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="date" label="Date" type="date" min={todayIso()} required />
        <SelectField name="mode" label="Mode" options={MODE_OPTIONS} required />
        <TimeField name="startTime" label="Start" required />
        <TimeField name="endTime" label="End" required />
      </div>
      <TextField name="location" label="Location" placeholder="e.g. Staff room" />
    </FormDialog>
  );
}
