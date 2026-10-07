"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { FormPanel } from "@/components/shared/FormPanel";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { DateField } from "@/components/shared/form/DateField";
import { SegmentedField } from "@/components/shared/form/SegmentedField";
import { TextField } from "@/components/shared/form/TextField";
import { TileSelectField } from "@/components/shared/form/TileSelectField";
import { CLASS_GROUPS, SUBJECT_GROUPS, sectionsHint } from "../presets";
import type { SetupFormValues } from "../schemas";
import { useSessionNameSync } from "../use-session-name-sync";

const SECTION_OPTIONS = ["1", "2", "3", "4"].map((id) => ({ id, name: id }));

export function AcademicsFields() {
  const { control } = useFormContext<SetupFormValues>();
  const createSession = useWatch({ control, name: "academics.createSession" });
  useSessionNameSync();

  return (
    <FormPanel
      title="Academic year & classes"
      description="Creates the session with classes, sections and subjects so the principal can start admitting students. They can change these later."
    >
      <CheckboxField name="academics.createSession" label="Set up the academic year now" />
      {createSession && (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <DateField name="academics.startDate" label="Starts on" required />
            <DateField name="academics.endDate" label="Ends on" required />
            <TextField name="academics.sessionName" label="Session name" required autoComplete="off" hint="Filled in from the dates" />
          </div>
          <TileSelectField name="academics.classes" label="Classes" groups={CLASS_GROUPS} />
          <SegmentedField
            name="academics.sectionsPerClass"
            label="Sections per class"
            options={SECTION_OPTIONS}
            hint={(value) => sectionsHint(Number(value) || 1)}
          />
          <TileSelectField name="academics.subjects" label="Subjects" groups={SUBJECT_GROUPS} />
        </div>
      )}
    </FormPanel>
  );
}
