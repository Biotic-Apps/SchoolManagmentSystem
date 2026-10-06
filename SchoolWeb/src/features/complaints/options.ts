import type { Option } from "@/components/shared/OptionSelect";
import type { StepperStep } from "@/components/shared/StatusStepper";
import type { ComplaintBox } from "./types";

export const COMPLAINT_CATEGORY_OPTIONS: Option[] = [
  { id: "ACADEMIC", name: "Academic" },
  { id: "STAFF_BEHAVIOUR", name: "Staff behaviour" },
  { id: "FACILITY", name: "Facility" },
  { id: "TRANSPORT", name: "Transport" },
  { id: "FEE", name: "Fee" },
  { id: "SAFETY", name: "Safety" },
  { id: "OTHER", name: "Other" },
];

export const COMPLAINT_STATUS_OPTIONS: Option[] = [
  { id: "SUBMITTED", name: "Submitted" },
  { id: "ASSIGNED", name: "Assigned" },
  { id: "IN_PROGRESS", name: "In progress" },
  { id: "ESCALATED", name: "Escalated" },
  { id: "RESOLVED", name: "Resolved" },
  { id: "REOPENED", name: "Reopened" },
  { id: "CLOSED", name: "Closed" },
];

export const UPDATE_STATUS_OPTIONS: Option[] = [
  { id: "IN_PROGRESS", name: "In progress" },
  { id: "RESOLVED", name: "Resolved" },
];

export const COMPLAINT_STEPS: StepperStep[] = [
  { id: "SUBMITTED", label: "Submitted" },
  { id: "ASSIGNED", label: "Assigned" },
  { id: "IN_PROGRESS", label: "In progress" },
  { id: "RESOLVED", label: "Resolved" },
  { id: "CLOSED", label: "Closed" },
];

export const BOX_LABEL: Record<ComplaintBox, string> = {
  mine: "My complaints",
  assigned: "Assigned to me",
  all: "All",
};

export function categoryLabel(id: string): string {
  return COMPLAINT_CATEGORY_OPTIONS.find((option) => option.id === id)?.name ?? id;
}
