import type { Option } from "@/components/shared/OptionSelect";
import { EMPTY_VALUE } from "@/lib/format";

export const STUDENT_STATUS_OPTIONS: Option[] = [
  { id: "ACTIVE", name: "Active" },
  { id: "WITHDRAWN", name: "Withdrawn" },
  { id: "TRANSFERRED", name: "Transferred" },
  { id: "GRADUATED", name: "Graduated" },
];

export const TRANSFER_DIRECTION_OPTIONS: Option[] = [
  { id: "IN", name: "Incoming" },
  { id: "OUT", name: "Outgoing" },
];

export const TRANSFER_STATUS_OPTIONS: Option[] = [
  { id: "REQUESTED", name: "Requested" },
  { id: "ACCEPTED", name: "Accepted" },
  { id: "REJECTED", name: "Rejected" },
  { id: "CANCELLED", name: "Cancelled" },
];

/** "Class 5 A", or a dash when the student has no current placement. */
export function placementLabel(className: string | null | undefined, sectionName: string | null | undefined): string {
  const label = [className, sectionName].filter(Boolean).join(" ");
  return label || EMPTY_VALUE;
}
