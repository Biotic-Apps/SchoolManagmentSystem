import { get, type FieldError, type FieldErrors } from "react-hook-form";

/** Reads a (possibly nested, e.g. "assignments.0.roleKey") field error. */
export function fieldError(errors: FieldErrors, name: string): FieldError | undefined {
  return get(errors, name) as FieldError | undefined;
}

export function fieldId(name: string): string {
  return `field-${name.replace(/\./g, "-")}`;
}
