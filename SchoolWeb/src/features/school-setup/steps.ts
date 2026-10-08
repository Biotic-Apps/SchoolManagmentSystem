export type StepId = "school" | "branch" | "people" | "classes" | "bell" | "review";

export interface WizardStep {
  id: StepId;
  label: string;
  title: string;
  helper: string;
  /** Field paths (or their prefixes) validated before leaving the step. */
  fields: string[];
}

export const SETUP_STEPS: WizardStep[] = [
  {
    id: "school",
    label: "School",
    title: "About the school",
    helper: "Only the name and code are needed now; everything else can be added later.",
    fields: ["school"],
  },
  {
    id: "branch",
    label: "Branch",
    title: "Main branch",
    helper: "We've filled in common defaults. Change anything that differs.",
    fields: ["branch"],
  },
  {
    id: "people",
    label: "Principal",
    title: "Principal and academic year",
    helper: "Who runs the branch, and the school year to start with.",
    fields: ["principal", "academics.createSession", "academics.sessionName", "academics.startDate", "academics.endDate"],
  },
  {
    id: "classes",
    label: "Classes",
    title: "Classes & subjects",
    helper: "Pick the classes, their sections and what each class studies. You can change all of this later in Classes.",
    fields: ["academics.classes", "academics.subjectNames"],
  },
  {
    id: "bell",
    label: "Bell",
    title: "Bell schedule",
    helper: "When periods start and end. Periods are time slots; subjects are chosen when you build the timetable.",
    fields: ["bell"],
  },
  {
    id: "review",
    label: "Review",
    title: "Review and create",
    helper: "Check everything once. Nothing is saved until you press Create school.",
    fields: [],
  },
];

/** Step index that owns a field path such as "school.code" or "academics.classes.3.sections". */
export function stepForField(field: string): number {
  return SETUP_STEPS.findIndex((step) => step.fields.some((prefix) => field === prefix || field.startsWith(`${prefix}.`)));
}

