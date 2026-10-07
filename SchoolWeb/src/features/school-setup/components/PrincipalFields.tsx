"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { FormPanel } from "@/components/shared/FormPanel";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { TextField } from "@/components/shared/form/TextField";
import type { SetupFormValues } from "../schemas";

export function PrincipalFields() {
  const { control } = useFormContext<SetupFormValues>();
  const generate = useWatch({ control, name: "principal.generatePassword" });
  return (
    <FormPanel
      title="Principal"
      description="Runs this branch and adds teachers and students. Needs an email or phone number to sign in."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField name="principal.name" label="Full name" required autoComplete="off" />
        <TextField name="principal.email" label="Email" type="email" autoComplete="off" placeholder="name@school.edu.pk" />
        <TextField name="principal.phone" label="Phone" type="tel" autoComplete="off" placeholder="+92 300 1234567" />
      </div>
      <CheckboxField
        name="principal.generatePassword"
        label="Create a temporary password"
        hint="Recommended. You'll see it once after creating; they choose their own at first sign-in."
      />
      {!generate && (
        <TextField
          name="principal.password"
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          hint="At least 8 characters with a letter and a digit"
          className="sm:max-w-sm"
        />
      )}
    </FormPanel>
  );
}
