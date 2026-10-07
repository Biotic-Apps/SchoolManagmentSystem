import type { SetupFormValues } from "./schemas";

export type StepId = "school" | "branch" | "people" | "review";

export interface WizardStep {
  id: StepId;
  label: string;
  title: string;
  helper: string;
  /** Top-level form groups validated before leaving the step. */
  groups: (keyof SetupFormValues)[];
}

export const SETUP_STEPS: WizardStep[] = [
  {
    id: "school",
    label: "School",
    title: "About the school",
    helper: "Only the name and code are needed now; everything else can be added later.",
    groups: ["school"],
  },
  {
    id: "branch",
    label: "Branch",
    title: "Main branch",
    helper: "We've filled in common defaults. Change anything that differs.",
    groups: ["branch"],
  },
  {
    id: "people",
    label: "Principal",
    title: "Principal and academic year",
    helper: "Who runs the branch, and the classes and subjects to start with.",
    groups: ["principal", "academics"],
  },
  {
    id: "review",
    label: "Review",
    title: "Review and create",
    helper: "Check everything once. Nothing is saved until you press Create school.",
    groups: [],
  },
];

/** Step index that owns a field path such as "school.code" or "principal.email". */
export function stepForField(field: string): number {
  const group = field.split(".")[0];
  const index = SETUP_STEPS.findIndex((step) => step.groups.includes(group as keyof SetupFormValues));
  return index;
}
