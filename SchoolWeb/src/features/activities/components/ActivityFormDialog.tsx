"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { FormSection } from "@/components/shared/FormSection";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TimeField } from "@/components/shared/form/TimeField";
import type { AudienceOptions } from "@/features/notices/use-audience-options";
import { ACTIVITY_TYPE_OPTIONS } from "../options";
import type { Activity } from "../types";
import { useActivityForm } from "../use-activity-form";
import { ActivityAudiencePicker } from "./ActivityAudiencePicker";

interface ActivityFormDialogProps {
  activity: Activity | null;
  branchId: string;
  audience: AudienceOptions;
  onClose: () => void;
}

export function ActivityFormDialog({ activity, branchId, audience, onClose }: ActivityFormDialogProps) {
  const { form, submit, submitting, formError, wholeBranch, consentRequired } = useActivityForm(
    activity,
    branchId,
    onClose,
  );

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={activity ? "Edit activity" : "Propose activity"}
      description="The principal approves it before it is announced to parents."
      submitLabel={activity ? "Save changes" : "Propose"}
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="xl"
    >
      <FormSection title="Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField name="type" label="Type" options={ACTIVITY_TYPE_OPTIONS} required />
          <TextField name="title" label="Title" required maxLength={150} />
          <TextareaField name="description" label="Description" rows={3} required className="sm:col-span-2" />
          <TextField name="venue" label="Venue" className="sm:col-span-2" />
        </div>
      </FormSection>
      <FormSection title="When">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="startDate" label="Start date" type="date" required />
          <TimeField name="startTime" label="Start time" required />
          <TextField name="endDate" label="End date" type="date" required />
          <TimeField name="endTime" label="End time" required />
        </div>
      </FormSection>
      <FormSection title="Who takes part">
        <ActivityAudiencePicker options={audience} wholeBranch={wholeBranch} />
      </FormSection>
      <FormSection title="Consent and fee">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <CheckboxField
              name="consentRequired"
              label="Parent consent required"
              hint="Only students whose parents agree can take part."
            />
          </div>
          {consentRequired && <TextField name="consentDeadline" label="Consent deadline" type="date" required />}
          <TextField name="fee" label="Fee (Rs)" inputMode="decimal" placeholder="Free" />
          <TextField name="maxParticipants" label="Maximum participants" inputMode="numeric" placeholder="No limit" />
        </div>
      </FormSection>
    </FormDialog>
  );
}
