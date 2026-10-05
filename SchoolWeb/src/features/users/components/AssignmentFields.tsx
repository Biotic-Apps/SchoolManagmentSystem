"use client";

import { SelectField } from "@/components/shared/form/SelectField";
import { TextField } from "@/components/shared/form/TextField";
import type { AssignmentOptions } from "../use-assignment-options";
import { useAssignmentRow } from "../use-assignment-row";

interface AssignmentFieldsProps {
  prefix: string;
  options: AssignmentOptions;
}

/** Role + scope + optional end date for one assignment (used by create-user and add-assignment). */
export function AssignmentFields({ prefix, options }: AssignmentFieldsProps) {
  const row = useAssignmentRow(prefix, options.activeRole);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SelectField name={`${prefix}.roleKey`} label="Role" options={options.roleOptions} required />
      {row.showScopePicker && (
        <SelectField name={`${prefix}.scopeType`} label="Applies to" options={row.scopeOptions} required />
      )}
      {row.needsSchool && (
        <SelectField name={`${prefix}.schoolId`} label="School" options={options.schoolOptions} required />
      )}
      {row.needsBranch && (
        <SelectField name={`${prefix}.branchId`} label="Branch" options={options.branchOptions} required />
      )}
      <TextField
        name={`${prefix}.validUntil`}
        label="Valid until"
        type="date"
        hint="Leave empty for a permanent assignment (use a date for substitutes)."
      />
    </div>
  );
}
