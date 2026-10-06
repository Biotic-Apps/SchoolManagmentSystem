import type { Option } from "@/components/shared/OptionSelect";
import type { StepperStep } from "@/components/shared/StatusStepper";
import type { CertificateType } from "./types";

export const CERTIFICATE_TYPE_OPTIONS: (Option & { id: CertificateType })[] = [
  { id: "SCHOOL_LEAVING", name: "School leaving" },
  { id: "TRANSFER", name: "Transfer" },
  { id: "CHARACTER", name: "Character" },
  { id: "ATTENDANCE", name: "Attendance" },
  { id: "ACHIEVEMENT", name: "Achievement" },
];

export const CERTIFICATE_STATUS_OPTIONS: Option[] = [
  { id: "REQUESTED", name: "Requested" },
  { id: "APPROVED", name: "Approved" },
  { id: "ISSUED", name: "Issued" },
  { id: "REJECTED", name: "Rejected" },
];

export const CERTIFICATE_STEPS: StepperStep[] = [
  { id: "REQUESTED", label: "Requested" },
  { id: "APPROVED", label: "Approved" },
  { id: "ISSUED", label: "Issued" },
];

/** Types that need fee and inventory clearance before approval. */
export const CLEARANCE_TYPES: CertificateType[] = ["SCHOOL_LEAVING", "TRANSFER"];

export function certificateTypeLabel(type: string): string {
  return CERTIFICATE_TYPE_OPTIONS.find((option) => option.id === type)?.name ?? type;
}
