"use client";

import { FormPanel } from "@/components/shared/FormPanel";
import { TextField } from "@/components/shared/form/TextField";
import { TextareaField } from "@/components/shared/form/TextareaField";
import { useCodeSuggestion } from "../use-code-suggestion";

export function SchoolStep() {
  useCodeSuggestion();
  return (
    <div className="flex flex-col gap-6">
      <FormPanel title="School" description="The name and a short code identify the school everywhere.">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="school.name" label="School name" required autoComplete="off" placeholder="e.g. Bright Star School" />
          <TextField
            name="school.code"
            label="Short code"
            required
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={12}
            inputClassName="uppercase"
            hint="2–12 letters or digits, used on receipts and IDs. Can't be changed later."
          />
        </div>
      </FormPanel>
      <FormPanel title="Contact" description="Optional. Shown on receipts and letters.">
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField name="school.phone" label="Phone" type="tel" autoComplete="off" placeholder="+92 42 1234567" />
          <TextField name="school.email" label="Email" type="email" autoComplete="off" placeholder="office@school.edu.pk" />
          <TextField name="school.website" label="Website" type="url" inputMode="url" autoComplete="off" placeholder="https://" />
          <TextareaField name="school.address" label="Address" rows={2} className="sm:col-span-3" />
        </div>
      </FormPanel>
    </div>
  );
}
