"use client";

import { Users } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { fieldError } from "@/components/shared/form/field-error";
import { audienceSummary } from "../options";
import type { NoticeFormValues } from "../schemas";
import type { AudienceOptions } from "../use-audience-options";
import { CheckboxListField } from "./CheckboxListField";

/** Who receives a notice: school-wide, or any mix of branches, classes and sections; optionally staff only. */
export function AudienceBuilder({ options }: { options: AudienceOptions }) {
  const { control, formState } = useFormContext<NoticeFormValues>();
  const [schoolWide, branchIds, classIds, sectionIds, staffOnly] = useWatch({
    control,
    name: ["schoolWide", "branchIds", "classIds", "sectionIds", "staffOnly"],
  });
  const error = fieldError(formState.errors, "schoolWide");
  const summary = audienceSummary({ schoolWide, branchIds, classIds, sectionIds, staffOnly }, options.nameOf);

  return (
    <div className="flex flex-col gap-4 rounded-card border border-border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
        <CheckboxField name="schoolWide" label="Whole school" hint="Every branch, class and section." />
        <CheckboxField name="staffOnly" label="Staff only" hint="Parents will not see it." />
      </div>
      {!schoolWide && (
        <div className="grid gap-4 md:grid-cols-3">
          <CheckboxListField name="branchIds" label="Branches" options={options.branchOptions} loading={options.loading} />
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
      <p className="flex items-center gap-2 text-label text-fg-muted">
        <Users className="size-4 shrink-0 text-primary" />
        <span>
          Sent to: <span className="font-medium text-fg">{summary}</span>
        </span>
      </p>
      {error?.message && (
        <p role="alert" className="text-caption text-error">
          {error.message}
        </p>
      )}
    </div>
  );
}
