"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import { TimeField } from "@/components/shared/form/TimeField";
import { StudentSearchField } from "@/features/students/components/StudentSearchField";
import { todayIso } from "@/lib/dates";
import { MODE_OPTIONS } from "../options";
import { useRequestMeetingForm } from "../use-request-meeting-form";

export function RequestMeetingDialog({ onClose }: { onClose: () => void }) {
  const request = useRequestMeetingForm(onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Request a meeting"
      description="Schedule a meeting with a student's guardian. They are notified straight away."
      submitLabel="Schedule meeting"
      submitting={request.submitting}
      onSubmit={request.submit}
      form={request.form}
      error={request.formError}
      size="lg"
    >
      <StudentSearchField name="studentId" required />
      {request.hasStudent && (
        <SelectField
          name="guardianId"
          label="Guardian"
          options={request.guardianOptions}
          placeholder={request.guardiansLoading ? "Loading guardians…" : "Choose guardian"}
          hint={
            !request.guardiansLoading && request.guardianOptions.length === 0
              ? "This student has no verified guardian yet."
              : undefined
          }
          required
        />
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="date" label="Date" type="date" min={todayIso()} required />
        <SelectField name="mode" label="Mode" options={MODE_OPTIONS} required />
        <TimeField name="startTime" label="Start" required />
        <TimeField name="endTime" label="End" required />
      </div>
      <TextareaField name="agenda" label="Agenda" required rows={3} />
    </FormDialog>
  );
}
