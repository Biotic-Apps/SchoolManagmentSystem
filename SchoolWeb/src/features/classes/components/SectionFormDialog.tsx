"use client";

import type { Option } from "@/components/shared/OptionSelect";
import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { useRoomOptions } from "../rooms-api";
import type { Section } from "../types";
import { useSectionForm, type SectionFormContext } from "../use-section-form";

interface SectionFormDialogProps {
  item: Section | null;
  context: SectionFormContext;
  sessionOptions: Option[];
  classOptions: Option[];
  onClose: () => void;
}

export function SectionFormDialog({ item, context, sessionOptions, classOptions, onClose }: SectionFormDialogProps) {
  const { form, submit, submitting, formError } = useSectionForm(item, context, onClose);
  const rooms = useRoomOptions(context.branchId);
  const fixed = item ? "Session and class can't be changed after creation." : undefined;

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={item ? `Edit section ${item.className} ${item.name}` : "Add section"}
      submitLabel={item ? "Save changes" : "Create section"}
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          name="sessionId"
          label="Session"
          options={sessionOptions}
          required
          disabled={!!item}
          hint={fixed}
        />
        <SelectField name="classId" label="Class" options={classOptions} required disabled={!!item} />
        <TextField name="name" label="Section name" required placeholder="e.g. A or Blue" />
        <TextField name="capacity" label="Capacity" required inputMode="numeric" hint="Maximum students." />
        <SelectField
          name="roomId"
          label="Room"
          options={rooms.options}
          emptyLabel="No room"
          placeholder={rooms.isLoading ? "Loading rooms" : "Select"}
          className="sm:col-span-2"
        />
      </div>
    </FormDialog>
  );
}
