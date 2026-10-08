"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { FormPanel } from "@/components/shared/FormPanel";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { DateField } from "@/components/shared/form/DateField";
import { TextField } from "@/components/shared/form/TextField";
import type { SetupFormValues } from "../schemas";
import { useSessionNameSync } from "../use-session-name-sync";

/** The school year; classes, subjects and the bell schedule follow on the next steps. */
export function AcademicsFields() {
  const { control } = useFormContext<SetupFormValues>();
  const createSession = useWatch({ control, name: "academics.createSession" });
  useSessionNameSync();

  return (
    <FormPanel
      title="Academic year"
      description="Creates the session so the principal can start admitting students. Classes and periods come next."
    >
      <CheckboxField name="academics.createSession" label="Set up the academic year now" />
      {createSession && (
        <div className="grid gap-4 sm:grid-cols-3">
          <DateField name="academics.startDate" label="Starts on" required />
          <DateField name="academics.endDate" label="Ends on" required />
          <TextField name="academics.sessionName" label="Session name" required autoComplete="off" hint="Filled in from the dates" />
        </div>
      )}
    </FormPanel>
  );
}
