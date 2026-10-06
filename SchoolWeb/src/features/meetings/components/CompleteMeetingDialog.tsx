"use client";

import { Plus, Trash2 } from "lucide-react";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormSection } from "@/components/shared/FormSection";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import { formatTimeRange } from "@/lib/time";
import type { Meeting } from "../types";
import { useCompleteForm } from "../use-complete-form";

export function CompleteMeetingDialog({ meeting, onClose }: { meeting: Meeting; onClose: () => void }) {
  const complete = useCompleteForm(meeting, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Complete meeting"
      description={`${meeting.student.name} with ${meeting.guardian.name} · ${formatDate(meeting.date)}, ${formatTimeRange(meeting.startTime, meeting.endTime)}`}
      submitLabel="Complete meeting"
      submitting={complete.submitting}
      onSubmit={complete.submit}
      form={complete.form}
      error={complete.formError}
      size="lg"
    >
      <TextareaField name="notes" label="Notes (staff only)" required rows={4} />
      <CheckboxField
        name="shareSummaryWithParent"
        label="Share a summary with the parent"
        hint="Only the summary is shared; your notes stay with staff."
      />
      {complete.sharing && <TextareaField name="summary" label="Summary for the parent" required rows={3} />}
      <FormSection title="Follow-ups" description="Agreed actions, each with an owner and a due date.">
        {complete.followUps.map((field, index) => (
          <div key={field.id} className="grid gap-3 rounded-input border border-border p-3 sm:grid-cols-[1fr_9rem_10rem_auto] sm:items-start">
            <TextField name={`followUps.${index}.title`} label="Action" required />
            <SelectField name={`followUps.${index}.ownerUserId`} label="Owner" options={complete.ownerOptions} required />
            <TextField name={`followUps.${index}.dueDate`} label="Due" type="date" required />
            <Button
              variant="ghost"
              size="icon"
              className="size-11 sm:mt-6"
              aria-label="Remove follow-up"
              onClick={() => complete.removeFollowUp(index)}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
        <div>
          <Button variant="secondary" size="sm" onClick={complete.addFollowUp}>
            <Plus />
            Add follow-up
          </Button>
        </div>
      </FormSection>
    </FormDialog>
  );
}
