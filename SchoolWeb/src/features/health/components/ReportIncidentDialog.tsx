"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { InlineNotice } from "@/components/shared/InlineNotice";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import { TimeField } from "@/components/shared/form/TimeField";
import { AttachmentsField } from "@/features/files/components/AttachmentsField";
import { StudentSearchField } from "@/features/students/components/StudentSearchField";
import { INCIDENT_SEVERITY_OPTIONS, INCIDENT_TYPE_OPTIONS } from "../options";
import { useIncidentForm } from "../use-incident-form";

export function ReportIncidentDialog({ branchId, onClose }: { branchId: string | null; onClose: () => void }) {
  const { form, submit, submitting, formError } = useIncidentForm(onClose);
  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Report an incident"
      submitLabel="Report incident"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="lg"
    >
      <InlineNotice tone="warning">
        Guardians are notified immediately; serious incidents also alert the principal. Incidents can&apos;t be edited
        after saving.
      </InlineNotice>
      <StudentSearchField name="studentId" required branchId={branchId} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField name="date" label="Date" type="date" required />
        <TimeField name="time" label="Time" required />
        <SelectField name="type" label="Type" options={INCIDENT_TYPE_OPTIONS} required />
        <SelectField name="severity" label="Severity" options={INCIDENT_SEVERITY_OPTIONS} required />
      </div>
      <TextareaField name="description" label="What happened" required rows={4} />
      <TextareaField name="actionTaken" label="Action taken" required placeholder="e.g. First aid given, parent called" />
      <AttachmentsField name="attachmentFileIds" label="Photos or documents" />
    </FormDialog>
  );
}
