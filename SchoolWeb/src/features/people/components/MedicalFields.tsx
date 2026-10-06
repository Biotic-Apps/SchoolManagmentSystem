"use client";

import { TextareaField } from "@/components/shared/form/TextareaField";
import { TextField } from "@/components/shared/form/TextField";

/** Optional medical notes; form path of the medical object, e.g. "medical". */
export function MedicalFields({ prefix }: { prefix: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField name={`${prefix}.allergies`} label="Allergies" placeholder="e.g. Peanuts" />
      <TextField name={`${prefix}.conditions`} label="Medical conditions" placeholder="e.g. Asthma" />
      <TextareaField name={`${prefix}.notes`} label="Notes for staff" rows={2} className="sm:col-span-2" />
    </div>
  );
}
