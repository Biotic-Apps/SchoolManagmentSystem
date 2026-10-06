"use client";

import { useFormContext } from "react-hook-form";
import { FormField } from "@/components/shared/FormField";
import { SearchPicker } from "@/components/shared/SearchPicker";
import { fieldError, fieldId } from "@/components/shared/form/field-error";
import { useStudentSearchField } from "../use-student-search-field";

interface StudentSearchFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  branchId?: string | null;
  sectionId?: string | null;
}

/** Form field: type a name or admission number, then pick the student. */
export function StudentSearchField({ name, label = "Student", required, branchId, sectionId }: StudentSearchFieldProps) {
  const { formState } = useFormContext();
  const picker = useStudentSearchField(name, { branchId, sectionId });
  const id = fieldId(name);
  return (
    <FormField id={id} label={label} required={required} error={fieldError(formState.errors, name)}>
      <SearchPicker
        id={id}
        {...picker}
        placeholder="Search by name or admission no."
        emptyText="No students match"
      />
    </FormField>
  );
}
