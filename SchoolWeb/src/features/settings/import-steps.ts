import type { StepperStep } from "@/components/shared/StatusStepper";
import type { ImportStatus } from "./import-types";

export const IMPORT_STEPS: StepperStep[] = [
  { id: "upload", label: "Upload" },
  { id: "validate", label: "Validate" },
  { id: "review", label: "Review" },
  { id: "commit", label: "Commit" },
  { id: "done", label: "Done" },
];

const STEP_BY_STATUS: Record<ImportStatus, string> = {
  VALIDATING: "validate",
  READY: "review",
  INVALID: "review",
  COMMITTING: "commit",
  COMMITTED: "done",
  REVERTED: "done",
  FAILED: "validate",
};

/** Stepper position for an import; `committing` marks a failure that happened while applying rows. */
export function importStep(status: ImportStatus | undefined, committing: boolean) {
  if (!status) return { current: "upload", failedLabel: null };
  if (status === "FAILED") return { current: committing ? "commit" : "validate", failedLabel: "Failed" };
  if (status === "REVERTED") return { current: "done", failedLabel: "Reverted" };
  return { current: STEP_BY_STATUS[status] ?? "upload", failedLabel: null };
}
