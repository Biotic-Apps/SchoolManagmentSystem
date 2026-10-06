import type { Option } from "@/components/shared/OptionSelect";
import { humanize } from "@/lib/format";
import type { DocType, DocumentOwnerType } from "./types";

const DOC_TYPES: DocType[] = [
  "BIRTH_CERTIFICATE",
  "B_FORM",
  "CNIC",
  "PHOTO",
  "PREVIOUS_RESULT",
  "LEAVING_CERTIFICATE",
  "MEDICAL",
  "OTHER",
];

const LABELS: Partial<Record<DocType, string>> = { B_FORM: "B-Form", CNIC: "CNIC" };

export function docTypeLabel(type: string): string {
  return LABELS[type as DocType] ?? humanize(type);
}

export const DOC_TYPE_OPTIONS: Option[] = DOC_TYPES.map((id) => ({ id, name: docTypeLabel(id) }));

/** Module whose edit permission covers verifying an owner's documents (contract §3). */
export function verifyPermission(ownerType: DocumentOwnerType): string {
  return ownerType === "STAFF" ? "staff.edit" : "students.edit";
}

export function editPermission(ownerType: DocumentOwnerType): string {
  if (ownerType === "STAFF") return "staff.edit";
  if (ownerType === "GUARDIAN") return "guardians.edit";
  if (ownerType === "APPLICATION") return "admissions.edit";
  return "students.edit";
}
