import type { Option } from "@/components/shared/OptionSelect";

export const PROOF_METHOD_OPTIONS: Option[] = [
  { id: "BANK", name: "Bank transfer" },
  { id: "WALLET", name: "Mobile wallet" },
  { id: "OTHER", name: "Other" },
];

export const PROOF_STATUS_OPTIONS: Option[] = [
  { id: "SUBMITTED", name: "Submitted" },
  { id: "VERIFIED", name: "Verified" },
  { id: "REJECTED", name: "Rejected" },
];

export function proofMethodLabel(method: string): string {
  return PROOF_METHOD_OPTIONS.find((option) => option.id === method)?.name ?? method;
}
