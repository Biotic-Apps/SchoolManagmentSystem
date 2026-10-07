import { FormSection } from "@/components/shared/FormSection";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { TextField } from "@/components/shared/form/TextField";
import { TwoFactorRolesField } from "./TwoFactorRolesField";

export function SecurityPolicySection() {
  return (
    <FormSection title="Security" description="Applies to every account in this school.">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="passwordMinLength"
          label="Minimum password length"
          hint="Between 8 and 64 characters."
          inputMode="numeric"
          autoComplete="off"
          required
        />
        <TextField
          name="sessionTimeoutMinutes"
          label="Sign out after inactivity (minutes)"
          hint="Between 5 and 1440 minutes (24 hours)."
          inputMode="numeric"
          autoComplete="off"
          required
        />
      </div>
      <CheckboxField name="requireDigit" label="Passwords must include a digit" />
      <TwoFactorRolesField />
    </FormSection>
  );
}
