import type { Option } from "@/components/shared/OptionSelect";

export const CONCESSION_TYPE_OPTIONS: Option[] = [
  { id: "PERCENT", name: "Percentage" },
  { id: "FIXED", name: "Fixed amount" },
];

export const CONCESSION_STATUS_OPTIONS: Option[] = [
  { id: "PENDING", name: "Pending approval" },
  { id: "APPROVED", name: "Approved" },
  { id: "REJECTED", name: "Rejected" },
];
