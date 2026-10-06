import type { StepperStep } from "@/components/shared/StatusStepper";
import { APPLICATION_STEPS, type ApplicationStepId } from "./options";
import type { Application, ApplicationStatus } from "./types";

const OPEN: ApplicationStatus[] = [
  "SUBMITTED",
  "DOCUMENTS_PENDING",
  "TEST_SCHEDULED",
  "TEST_COMPLETED",
  "OFFERED",
  "WAITLISTED",
];
const BEFORE_DECISION: ApplicationStatus[] = ["SUBMITTED", "DOCUMENTS_PENDING", "TEST_SCHEDULED", "TEST_COMPLETED"];
const TEST_SCHEDULABLE: ApplicationStatus[] = ["SUBMITTED", "DOCUMENTS_PENDING", "TEST_SCHEDULED"];

export const isOpenStatus = (status: ApplicationStatus) => OPEN.includes(status);
/** Editable (PATCH) and decidable only before OFFERED. */
export const isBeforeDecision = (status: ApplicationStatus) => BEFORE_DECISION.includes(status);
export const canScheduleTestStatus = (status: ApplicationStatus) => TEST_SCHEDULABLE.includes(status);

const STEP_BY_STATUS: Partial<Record<ApplicationStatus, ApplicationStepId>> = {
  SUBMITTED: "submitted",
  DOCUMENTS_PENDING: "documents",
  TEST_SCHEDULED: "test_scheduled",
  TEST_COMPLETED: "test_completed",
  OFFERED: "decision",
  WAITLISTED: "decision",
  REJECTED: "decision",
  EXPIRED: "decision",
  CONFIRMED: "confirmed",
  ENROLLED: "enrolled",
};

const FAILED_LABEL: Partial<Record<ApplicationStatus, string>> = {
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  WITHDRAWN: "Withdrawn",
};

// A withdrawal does not record where it happened, so infer the furthest step from the data.
function reachedStep(app: Application): ApplicationStepId {
  if (app.waitlistPosition != null || app.decisionReason) return "decision";
  if (app.test?.score != null) return "test_completed";
  if (app.test) return "test_scheduled";
  if ((app.documents?.length ?? 0) > 0) return "documents";
  return "submitted";
}

function decisionLabel(app: Application): string {
  if (app.status === "WAITLISTED") return app.waitlistPosition ? `Waitlisted #${app.waitlistPosition}` : "Waitlisted";
  if (["OFFERED", "CONFIRMED", "ENROLLED"].includes(app.status)) return "Offered";
  return "Decision";
}

export function applicationStepper(app: Application): { steps: StepperStep[]; current: string; failedLabel: string | null } {
  const steps = APPLICATION_STEPS.map((step) => (step.id === "decision" ? { ...step, label: decisionLabel(app) } : step));
  return {
    steps,
    current: STEP_BY_STATUS[app.status] ?? reachedStep(app),
    failedLabel: FAILED_LABEL[app.status] ?? null,
  };
}

export function childName(app: Pick<Application, "child">): string {
  const name = `${app.child?.firstName ?? ""} ${app.child?.lastName ?? ""}`.trim();
  return name || "Unnamed child";
}

export function primaryGuardian(app: Pick<Application, "guardians">) {
  return app.guardians?.find((guardian) => guardian.isPrimary) ?? app.guardians?.[0] ?? null;
}
