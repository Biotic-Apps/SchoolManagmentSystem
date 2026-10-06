import type { Option } from "@/components/shared/OptionSelect";

export const GENDER_OPTIONS: Option[] = [
  { id: "MALE", name: "Male" },
  { id: "FEMALE", name: "Female" },
  { id: "OTHER", name: "Other" },
];

export const RELATION_OPTIONS: Option[] = [
  { id: "FATHER", name: "Father" },
  { id: "MOTHER", name: "Mother" },
  { id: "GUARDIAN", name: "Guardian" },
  { id: "OTHER", name: "Other" },
];

export function optionName(options: Option[], id: string | null | undefined): string {
  return options.find((option) => option.id === id)?.name ?? id ?? "";
}
