import type { Option } from "@/components/shared/OptionSelect";

export const RECORD_STATUS_OPTIONS: Option[] = [
  { id: "ACTIVE", name: "Active" },
  { id: "ARCHIVED", name: "Archived" },
];

export const USER_STATUS_OPTIONS: Option[] = [
  { id: "ACTIVE", name: "Active" },
  { id: "DISABLED", name: "Disabled" },
];

/** Large page for option lists (dropdowns); the API caps pageSize at 100. */
export const OPTIONS_PAGE = { page: 1, pageSize: 100 } as const;

export type RecordStatus = "ACTIVE" | "ARCHIVED";
