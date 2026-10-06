"use client";

import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { UploadField } from "@/features/files/components/UploadField";
import { DESIGNATION_OPTIONS } from "../options";

interface StaffProfileFieldsProps {
  photoUrl?: string | null;
  /** On edit the CNIC is masked, so the field is left blank to keep it. */
  cnicHint?: string;
}

/** Personal and job fields shared by the add and edit staff forms. */
export function StaffProfileFields({ photoUrl = null, cnicHint }: StaffProfileFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField name="name" label="Full name" required className="sm:col-span-2" />
      <TextField name="email" label="Email" type="email" autoComplete="off" />
      <TextField name="phone" label="Phone" type="tel" autoComplete="off" />
      <TextField name="employeeNo" label="Employee no." autoComplete="off" />
      <SelectField name="designation" label="Designation" options={DESIGNATION_OPTIONS} required />
      <TextField name="joinDate" label="Join date" type="date" required />
      <TextField name="cnic" label="CNIC" inputMode="numeric" placeholder="35202-1234567-1" hint={cnicHint} />
      <TextField name="qualification" label="Qualification" className="sm:col-span-2" placeholder="e.g. M.Sc Mathematics, B.Ed" />
      <div className="sm:col-span-2">
        <UploadField name="photoFileId" label="Photo" purpose="STAFF_PHOTO" currentUrl={photoUrl} />
      </div>
    </div>
  );
}
