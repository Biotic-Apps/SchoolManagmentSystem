import type { FieldPath, UseFormSetError } from "react-hook-form";
import { ApiError, NETWORK_ERROR } from "@/lib/api-error";
import { errorMessage, isRouteMissing } from "@/lib/error-messages";
import { validationIssues } from "@/lib/form-errors";
import type { SetupFormValues } from "./schemas";
import { stepForField } from "./steps";

type Field = FieldPath<SetupFormValues>;

const CONFLICTS: Record<string, { field: Field; message: string }> = {
  SCHOOL_CODE_TAKEN: { field: "school.code", message: "Another school already uses this code. Pick a different one." },
  USER_EMAIL_TAKEN: { field: "principal.email", message: "An account with this email already exists." },
  USER_PHONE_TAKEN: { field: "principal.phone", message: "An account with this phone number already exists." },
};

// API paths that the form keeps under another name.
const ALIASES: Record<string, string> = {
  "academics.classNames": "academics.classes",
  "academics.bellSchedule": "bell",
};

// The API names the timing fields under branch.timings.*; the form keeps them flat on branch.
function formField(field: string): string {
  const flat = field.replace(/^branch\.timings\./, "branch.").replace(/^academics\.bellSchedule\./, "bell.");
  return ALIASES[flat] ?? flat;
}

function normalise(issue: { field?: string; message: string }): { field: string; message: string } {
  return { field: issue.field ?? "", message: withoutPath(issue.message, issue.field ?? "") };
}

const SIGN_IN_NEEDED = "Enter an email or phone number so the principal can sign in";

// "School.code must be shorter…" reads oddly under the Code field; drop the path.
function withoutPath(message: string, path: string): string {
  if (!path.includes(".") || !message.toLowerCase().startsWith(`${path.toLowerCase()} `)) return message;
  if (/^principal\.(email|phone)$/i.test(path) && /or principal\./i.test(message)) return SIGN_IN_NEEDED;
  // Later paths in the message read better without their group: "after academics.startDate" → "after startDate".
  const rest = message.slice(path.length + 1).replace(/(school|branch|principal|academics)\.(\w+)/g, "$2");
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}

export interface SetupErrorOutcome {
  /** Step to jump to (first step with a field error), or null to stay. */
  step: number | null;
  /** Message for the alert when nothing could be placed on a field. */
  message: string | null;
}

/** Puts API errors on the wizard fields and says which step to show. */
const UNREACHABLE = "Couldn't create the school: the server isn't reachable or is out of date. Nothing was saved; please try again.";

const OUTDATED_API =
  "The server hasn't been updated for classes, sections and the bell schedule yet. Nothing was saved; please try again in a few minutes.";

export function applySetupErrors(error: unknown, setError: UseFormSetError<SetupFormValues>): SetupErrorOutcome {
  if (isRouteMissing(error) || (error instanceof ApiError && error.code === NETWORK_ERROR)) {
    return { step: null, message: UNREACHABLE };
  }
  const conflict = error instanceof ApiError ? CONFLICTS[error.code] : undefined;
  if (conflict) {
    setError(conflict.field, { type: "server", message: conflict.message });
    return { step: stepForField(conflict.field), message: null };
  }
  const issues = validationIssues(error);
  // "classes should not exist": the API doesn't know a field this web version sends yet.
  if (issues.some((issue) => /should not exist/i.test(issue.message))) return { step: null, message: OUTDATED_API };
  const placed: number[] = [];
  const unplaced: string[] = [];
  for (const raw of issues) {
    const issue = normalise(raw);
    const field = issue.field ? formField(issue.field) : "";
    const step = field.includes(".") ? stepForField(field) : -1;
    if (step < 0) {
      unplaced.push(issue.message);
      continue;
    }
    setError(field as Field, { type: "server", message: issue.message });
    placed.push(step);
  }
  if (placed.length > 0) {
    return { step: Math.min(...placed), message: unplaced.length ? unplaced.join(" ") : null };
  }
  return { step: null, message: unplaced.length ? unplaced.join(" ") : errorMessage(error) };
}
