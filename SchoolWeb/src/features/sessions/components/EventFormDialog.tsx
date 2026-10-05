"use client";

import type { Option } from "@/components/shared/OptionSelect";
import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { EVENT_TYPE_OPTIONS } from "../event-types";
import type { CalendarEvent } from "../types";
import { useEventForm } from "../use-event-form";

const SCOPE_OPTIONS: Option[] = [
  { id: "BRANCH", name: "This branch" },
  { id: "SCHOOL", name: "Whole school (all branches)" },
];

interface EventFormDialogProps {
  event: CalendarEvent | null;
  schoolId: string | null;
  branchId: string | null;
  onClose: () => void;
}

export function EventFormDialog({ event, schoolId, branchId, onClose }: EventFormDialogProps) {
  const { form, submit, submitting, formError } = useEventForm({ event, schoolId, branchId }, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={event ? "Edit calendar entry" : "Add calendar entry"}
      submitLabel={event ? "Save changes" : "Add entry"}
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="type" label="Type" options={EVENT_TYPE_OPTIONS} required />
        <SelectField name="scope" label="Applies to" options={SCOPE_OPTIONS} required />
        <TextField name="title" label="Title" required className="sm:col-span-2" placeholder="Winter vacation" />
        <TextField name="startDate" label="Start date" type="date" required />
        <TextField name="endDate" label="End date" type="date" required />
        <TextareaField name="description" label="Description" className="sm:col-span-2" rows={3} />
      </div>
    </FormDialog>
  );
}
