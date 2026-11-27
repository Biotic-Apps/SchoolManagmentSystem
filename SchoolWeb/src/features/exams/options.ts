import type { Option } from "@/components/shared/OptionSelect";
import type { StepperStep } from "@/components/shared/StatusStepper";
import { EMPTY_VALUE } from "@/lib/format";
import type { ExamStatus, ExamType } from "./types";

export const EXAM_TYPE_OPTIONS: Option[] = [
  { id: "TERM", name: "Term exam" },
  { id: "MIDTERM", name: "Mid-term" },
  { id: "UNIT_TEST", name: "Unit test" },
  { id: "FINAL", name: "Final exam" },
];

export const EXAM_STEPS: StepperStep[] = [
  { id: "DRAFT", label: "Draft" },
  { id: "SCHEDULED", label: "Scheduled" },
  { id: "MARKS_OPEN", label: "Marks open" },
  { id: "MARKS_CLOSED", label: "Marks closed" },
  { id: "RESULTS_APPROVED", label: "Results approved" },
  { id: "PUBLISHED", label: "Published" },
];

export const EXAM_STATUS_OPTIONS: Option[] = EXAM_STEPS.map((step) => ({ id: step.id, name: step.label }));

const ORDER: ExamStatus[] = EXAM_STEPS.map((step) => step.id as ExamStatus);

/** True when the exam has reached (or passed) the given status. */
export function reached(status: ExamStatus, target: ExamStatus): boolean {
  return ORDER.indexOf(status) >= ORDER.indexOf(target);
}

export function examTypeLabel(type: ExamType | string): string {
  return EXAM_TYPE_OPTIONS.find((option) => option.id === type)?.name ?? type;
}

export function examStatusLabel(status: ExamStatus | string): string {
  return EXAM_STEPS.find((step) => step.id === status)?.label ?? status;
}

/** Decimal columns may arrive as strings; null stays null. */
export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Up to 2 decimals, truncated (never rounded up): grades use floor(percent),
 * so 79.99 must not read "80%" next to a B. Matches the report card PDF.
 */
export function formatPercent(value: unknown): string {
  const parsed = toNumber(value);
  if (parsed === null) return EMPTY_VALUE;
  const hundredths = Math.trunc(Math.round(parsed * 1e6) / 1e4);
  return `${hundredths / 100}%`;
}

export function formatMarks(value: unknown): string {
  const parsed = toNumber(value);
  return parsed === null ? EMPTY_VALUE : String(Math.round(parsed * 100) / 100);
}
