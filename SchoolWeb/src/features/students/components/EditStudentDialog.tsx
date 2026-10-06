"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import { UploadField } from "@/features/files/components/UploadField";
import { GENDER_OPTIONS } from "@/features/people/options";
import type { StudentDetail } from "../types";
import { useEditStudentForm } from "../use-edit-student-form";

export function EditStudentDialog({ student, onClose }: { student: StudentDetail; onClose: () => void }) {
  const { form, submit, submitting, formError } = useEditStudentForm(student, onClose);

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Edit ${student.name}`}
      submitLabel="Save changes"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="lg"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField name="firstName" label="First name" required />
        <TextField name="lastName" label="Last name" required />
        <TextField name="dob" label="Date of birth" type="date" required />
        <SelectField name="gender" label="Gender" options={GENDER_OPTIONS} required />
        <TextField
          name="bForm"
          label="B-Form number"
          inputMode="numeric"
          placeholder={student.bForm ?? "35202-1234567-1"}
          hint="Leave blank to keep the current number."
        />
        <TextField name="address" label="Address" />
        <div className="sm:col-span-2">
          <UploadField name="photoFileId" label="Photo" purpose="STUDENT_PHOTO" currentUrl={student.photoUrl} />
        </div>
      </div>
    </FormDialog>
  );
}
