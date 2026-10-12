import type { Option } from "@/components/shared/OptionSelect";
import type { HrLetterType } from "./types";

export const HR_LETTER_TYPE_OPTIONS: (Option & { id: HrLetterType })[] = [
  { id: "EXPERIENCE", name: "Experience" },
  { id: "SALARY_CERTIFICATE", name: "Salary certificate" },
  { id: "RELIEVING", name: "Relieving" },
  { id: "CUSTOM", name: "Custom" },
];

export function hrLetterTypeLabel(type: string): string {
  return HR_LETTER_TYPE_OPTIONS.find((o) => o.id === type)?.name ?? type;
}
