"use client";

import { FormDialog } from "@/components/shared/FormDialog";
import { FormField } from "@/components/shared/FormField";
import { SearchPicker } from "@/components/shared/SearchPicker";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { SelectField } from "@/components/shared/form/SelectField";
import { ParentSignInDialog } from "@/features/guardians/components/ParentSignInDialog";
import { GuardianFields } from "@/features/people/components/GuardianFields";
import { RELATION_OPTIONS } from "@/features/people/options";
import type { StudentDetail } from "../types";
import { useAddGuardianForm } from "../use-add-guardian-form";

const MODE_OPTIONS = [
  { id: "existing", name: "Existing guardian" },
  { id: "new", name: "New guardian" },
];

export function AddGuardianDialog({ student, onClose }: { student: StudentDetail; onClose: () => void }) {
  const { form, submit, submitting, formError, mode, picker, pickerError, parentLogin } = useAddGuardianForm(
    student,
    onClose,
  );

  if (parentLogin) {
    return (
      <ParentSignInDialog
        child={{ name: student.name, admissionNo: student.admissionNo }}
        logins={[parentLogin]}
        onClose={onClose}
      />
    );
  }

  return (
    <FormDialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Add guardian for ${student.name}`}
      description="Links added by staff are verified immediately. A guardian without a parent sign-in gets one, shown once."
      submitLabel="Add guardian"
      submitting={submitting}
      onSubmit={submit}
      form={form}
      error={formError}
      size="lg"
    >
      <SelectField name="mode" label="Guardian" options={MODE_OPTIONS} required />
      {mode === "existing" ? (
        <FormField
          id="guardian-search"
          label="Find guardian"
          required
          error={pickerError ? { type: "required", message: pickerError } : undefined}
        >
          <SearchPicker id="guardian-search" placeholder="Search name or phone" {...picker} />
        </FormField>
      ) : (
        <GuardianFields prefix="guardian" showRelation={false} />
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="relation" label="Relation to student" options={RELATION_OPTIONS} required />
        <div className="sm:pt-7">
          <CheckboxField name="isPrimary" label="Primary contact" hint="Replaces the current primary guardian." />
        </div>
      </div>
    </FormDialog>
  );
}
