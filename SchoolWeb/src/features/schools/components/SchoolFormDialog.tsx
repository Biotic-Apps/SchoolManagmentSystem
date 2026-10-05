"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import type { School } from "../types";
import { useSchoolForm } from "../use-school-form";
import { SchoolLogoField } from "./SchoolLogoField";

interface SchoolFormDialogProps {
  school: School | null;
  onClose: () => void;
}

export function SchoolFormDialog({ school, onClose }: SchoolFormDialogProps) {
  const { form, submit, submitting, formError } = useSchoolForm(school, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={school ? "Edit school" : "Add school"}
      submitLabel={school ? "Save changes" : "Create school"}
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="code"
          label="Code"
          required
          readOnly={!!school}
          hint={school ? "The code can't be changed." : "2–12 uppercase letters or digits, e.g. BSS"}
          autoCapitalize="characters"
          inputClassName="uppercase"
        />
        <TextField name="name" label="Name" required />
        <TextField name="phone" label="Phone" type="tel" />
        <TextField name="email" label="Email" type="email" />
        <TextField name="website" label="Website" className="sm:col-span-2" placeholder="https://" />
        <TextareaField name="address" label="Address" className="sm:col-span-2" rows={2} />
      </div>
      <SchoolLogoField currentUrl={school?.logoUrl ?? null} />
    </FormDialog>
  );
}
