"use client";

import { useFormContext } from "react-hook-form";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { fieldError } from "@/components/shared/form/field-error";
import { CheckboxListField } from "@/features/notices/components/CheckboxListField";
import type { AudienceOptions } from "@/features/notices/use-audience-options";

interface ActivityAudiencePickerProps {
  options: AudienceOptions;
  wholeBranch: boolean;
}

/** Whole branch, or any mix of classes and sections of the branch. */
export function ActivityAudiencePicker({ options, wholeBranch }: ActivityAudiencePickerProps) {
  const { formState } = useFormContext();
  const error = fieldError(formState.errors, "wholeBranch");

  return (
    <div className="flex flex-col gap-4 rounded-card border border-border p-4">
      <CheckboxField name="wholeBranch" label="Whole branch" hint="Every class and section of this branch." />
      {!wholeBranch && (
        <div className="grid gap-4 md:grid-cols-2">
          <CheckboxListField name="classIds" label="Classes" options={options.classOptions} loading={options.loading} />
          <CheckboxListField
            name="sectionIds"
            label="Sections"
            options={options.sectionOptions}
            loading={options.loading}
            emptyText="No sections in this branch's session"
          />
        </div>
      )}
      {error?.message && (
        <p role="alert" className="text-caption text-error">
          {error.message}
        </p>
      )}
    </div>
  );
}
