import type { Option } from "@/components/shared/OptionSelect";
import type { BadgeTone } from "@/components/ui/Badge";
import type { HomeworkStatus, ProgressCategory } from "./types";

export const CATEGORY_OPTIONS: { id: ProgressCategory; name: string }[] = [
  { id: "HOMEWORK", name: "Homework" },
  { id: "BEHAVIOUR", name: "Behaviour" },
  { id: "LEARNING", name: "Learning" },
  { id: "ACHIEVEMENT", name: "Achievement" },
];

export const CATEGORY_TONE: Record<ProgressCategory, BadgeTone> = {
  HOMEWORK: "info",
  BEHAVIOUR: "warning",
  LEARNING: "primary",
  ACHIEVEMENT: "success",
};

export function categoryLabel(id: string): string {
  return CATEGORY_OPTIONS.find((option) => option.id === id)?.name ?? id;
}

export const HOMEWORK_STATUS_CHOICES: (Option & { id: HomeworkStatus })[] = [
  { id: "DONE", name: "Done" },
  { id: "PARTIAL", name: "Partial" },
  { id: "NOT_DONE", name: "Not done" },
];

export function homeworkStatusLabel(status: string): string {
  return HOMEWORK_STATUS_CHOICES.find((choice) => choice.id === status)?.name ?? status;
}
