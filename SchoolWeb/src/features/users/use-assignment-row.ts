import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { scopeOptions, scopesForRole } from "./assignment-rules";

/** Keeps a row's scope valid for the chosen role and tells the row which pickers to show. */
export function useAssignmentRow(prefix: string, activeRole: string) {
  const { control, setValue } = useFormContext();
  const roleKey = useWatch({ control, name: `${prefix}.roleKey` }) as string;
  const scopeType = useWatch({ control, name: `${prefix}.scopeType` }) as string;
  const scopes = scopesForRole(roleKey, activeRole);

  useEffect(() => {
    if (!scopes.includes(scopeType as never)) setValue(`${prefix}.scopeType`, scopes[0]);
  }, [scopes, scopeType, prefix, setValue]);

  return {
    scopeOptions: scopeOptions(scopes),
    showScopePicker: scopes.length > 1,
    needsSchool: scopeType === "SCHOOL",
    needsBranch: scopeType === "BRANCH",
  };
}
