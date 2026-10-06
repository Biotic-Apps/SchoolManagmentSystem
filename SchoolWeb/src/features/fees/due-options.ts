import type { Option } from "@/components/shared/OptionSelect";

export const MIN_DAYS_OPTIONS: Option[] = [
  { id: "0", name: "Any overdue" },
  { id: "30", name: "Over 30 days" },
  { id: "60", name: "Over 60 days" },
  { id: "90", name: "Over 90 days" },
];
