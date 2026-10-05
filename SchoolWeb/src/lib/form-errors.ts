import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "./api-error";
import { errorMessage } from "./error-messages";

interface Issue {
  field?: string;
  message: string;
}

function sentence(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// class-validator style: "email must be an email" -> field "email".
function fromString(text: string): Issue {
  const [first] = text.split(" ");
  return { field: first, message: sentence(text) };
}

function fromObject(value: Record<string, unknown>): Issue[] {
  const field = (value.field ?? value.property ?? value.path) as string | undefined;
  const raw = value.message ?? value.messages ?? value.constraints;
  if (field && raw !== undefined) {
    const texts = typeof raw === "string" ? [raw] : Object.values(raw as object).map(String);
    return texts.map((message) => ({ field: String(field), message: sentence(message) }));
  }
  return Object.entries(value).flatMap(([key, entry]) =>
    (Array.isArray(entry) ? entry : [entry]).map((message) => ({ field: key, message: sentence(String(message)) })),
  );
}

export function validationIssues(error: unknown): Issue[] {
  if (!(error instanceof ApiError) || error.code !== "VALIDATION_FAILED") return [];
  const { details } = error;
  if (Array.isArray(details)) {
    return details.flatMap((entry) =>
      typeof entry === "string" ? [fromString(entry)] : fromObject(entry as Record<string, unknown>),
    );
  }
  if (details && typeof details === "object") return fromObject(details as Record<string, unknown>);
  return [];
}

/** Puts server errors on matching fields; returns the message for the form-level alert, if any. */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly string[],
  conflictField?: Path<T>,
): string | null {
  if (conflictField && error instanceof ApiError && error.code === "CONFLICT") {
    setError(conflictField, { type: "server", message: errorMessage(error) });
    return null;
  }
  const issues = validationIssues(error);
  const unmatched = issues.filter((issue) => {
    if (!issue.field || !fields.includes(issue.field)) return true;
    setError(issue.field as Path<T>, { type: "server", message: issue.message });
    return false;
  });
  if (issues.length > 0 && unmatched.length === 0) return null;
  if (unmatched.length > 0) return unmatched.map((issue) => issue.message).join(" ");
  return errorMessage(error);
}
