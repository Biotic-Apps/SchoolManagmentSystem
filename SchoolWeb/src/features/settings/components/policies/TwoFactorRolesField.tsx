"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { ROLE_KEYS, roleLabel } from "@/config/roles";
import type { PolicySettingsValues } from "../../policy-schemas";

function toggle(selected: string[], role: string, on: boolean): string[] {
  return on ? [...selected.filter((item) => item !== role), role] : selected.filter((item) => item !== role);
}

/** Roles that must use two-step sign-in. */
export function TwoFactorRolesField() {
  const { control } = useFormContext<PolicySettingsValues>();
  return (
    <Controller
      control={control}
      name="twoFactorRequiredFor"
      render={({ field }) => (
        <fieldset className="flex min-w-0 flex-col gap-2">
          <legend className="text-label font-medium text-fg">Two-step sign-in required for</legend>
          <p className="text-caption text-fg-muted">People in these roles must set up an authenticator app.</p>
          <div className="mt-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ROLE_KEYS.map((role) => {
              const id = `two-factor-${role}`;
              return (
                <div key={role} className="flex items-center gap-2">
                  <Checkbox
                    id={id}
                    checked={field.value.includes(role)}
                    onCheckedChange={(checked) => field.onChange(toggle(field.value, role, checked === true))}
                  />
                  <Label htmlFor={id}>{roleLabel(role)}</Label>
                </div>
              );
            })}
          </div>
        </fieldset>
      )}
    />
  );
}
