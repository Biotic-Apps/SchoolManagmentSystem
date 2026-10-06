import type { FieldErrors } from "react-hook-form";

/** Message of a whole-array rule; RHF keeps it on `.root` for field arrays, on the array otherwise. */
export function arrayError(errors: FieldErrors, name: string): string | undefined {
  const entry = errors[name] as { message?: unknown; root?: { message?: unknown } } | undefined;
  const message = entry?.root?.message ?? entry?.message;
  return typeof message === "string" ? message : undefined;
}
