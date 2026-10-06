"use client";

import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { RELATION_OPTIONS } from "../options";

interface GuardianFieldsProps {
  /** Form path of the guardian object, e.g. "guardians.0" or "guardian". */
  prefix: string;
  /** Hide relation when the form asks for it separately (link dialogs). */
  showRelation?: boolean;
  cnicHint?: string;
}

export function GuardianFields({ prefix, showRelation = true, cnicHint }: GuardianFieldsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <TextField name={`${prefix}.name`} label="Full name" required />
      {showRelation && <SelectField name={`${prefix}.relation`} label="Relation" options={RELATION_OPTIONS} required />}
      <TextField name={`${prefix}.phone`} label="Phone" type="tel" required />
      <TextField name={`${prefix}.email`} label="Email" type="email" />
      <TextField name={`${prefix}.cnic`} label="CNIC" inputMode="numeric" placeholder="35202-1234567-1" hint={cnicHint} />
      <TextField name={`${prefix}.occupation`} label="Occupation" />
      <TextField name={`${prefix}.address`} label="Address" className="sm:col-span-2" />
    </div>
  );
}
