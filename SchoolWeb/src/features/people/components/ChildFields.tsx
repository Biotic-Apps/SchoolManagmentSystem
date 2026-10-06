"use client";

import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { UploadField } from "@/features/files/components/UploadField";
import { GENDER_OPTIONS } from "../options";

interface ChildFieldsProps {
  /** Form path of the child object, e.g. "child". */
  prefix: string;
  photoUrl?: string | null;
  showPreviousSchool?: boolean;
}

export function ChildFields({ prefix, photoUrl, showPreviousSchool = true }: ChildFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField name={`${prefix}.firstName`} label="First name" required />
      <TextField name={`${prefix}.lastName`} label="Last name" required />
      <TextField name={`${prefix}.dob`} label="Date of birth" type="date" required />
      <SelectField name={`${prefix}.gender`} label="Gender" options={GENDER_OPTIONS} required />
      <TextField name={`${prefix}.bForm`} label="B-Form number" inputMode="numeric" placeholder="35202-1234567-1" />
      {showPreviousSchool && <TextField name={`${prefix}.previousSchool`} label="Previous school" />}
      <div className="sm:col-span-2">
        <UploadField name={`${prefix}.photoFileId`} label="Photo" purpose="STUDENT_PHOTO" currentUrl={photoUrl} />
      </div>
    </div>
  );
}
