import type { UploadedFile } from "@/features/files/types";
import type { PersonRef } from "@/features/people/types";

export type DocumentOwnerType = "STUDENT" | "GUARDIAN" | "STAFF" | "APPLICATION";

export type DocType =
  | "BIRTH_CERTIFICATE"
  | "B_FORM"
  | "CNIC"
  | "PHOTO"
  | "PREVIOUS_RESULT"
  | "LEAVING_CERTIFICATE"
  | "MEDICAL"
  | "OTHER";

export type DocumentStatus = "UPLOADED" | "VERIFIED" | "REJECTED";

/** phase2-contract §3 */
export interface SchoolDocument {
  id: string;
  ownerType: DocumentOwnerType;
  ownerId: string;
  docType: DocType;
  file: UploadedFile;
  status: DocumentStatus;
  note: string | null;
  verifiedBy: PersonRef | null;
  verifiedAt: string | null;
}

export interface DocumentInput {
  docType: DocType;
  fileId: string;
  note?: string;
}
