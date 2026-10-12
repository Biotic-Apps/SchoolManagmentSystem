"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { EMPTY_ASSIGNMENT, type CreateUserValues } from "../schemas";
import type { AssignmentOptions } from "../use-assignment-options";
import { AssignmentFields } from "./AssignmentFields";

export function AssignmentsBuilder({ options }: { options: AssignmentOptions }) {
  const { control, formState } = useFormContext<CreateUserValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "assignments" });
  const assignmentErrors = formState.errors.assignments;
  const listError = assignmentErrors?.root?.message ?? assignmentErrors?.message;

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-label font-medium text-fg">Roles and scope</legend>
      {fields.map((field, index) => {
        const rowHasError = !!(assignmentErrors as Record<string, unknown> | undefined)?.[index];
        return (
        <div key={field.id} className={`flex flex-col gap-2 rounded-input border p-3 ${rowHasError ? "border-error" : "border-border"}`}>
          <div className="flex items-center justify-between">
            <span className="text-caption font-medium text-fg-muted">Assignment {index + 1}</span>
            {fields.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => remove(index)} aria-label={`Remove assignment ${index + 1}`}>
                <Trash2 />
              </Button>
            )}
          </div>
          <AssignmentFields prefix={`assignments.${index}`} options={options} />
        </div>
        );
      })}
      {listError && (
        <p role="alert" className="text-caption text-error">
          {listError}
        </p>
      )}
      <Button variant="secondary" size="sm" className="self-start" onClick={() => append({ ...EMPTY_ASSIGNMENT })}>
        <Plus />
        Add another role
      </Button>
    </fieldset>
  );
}
