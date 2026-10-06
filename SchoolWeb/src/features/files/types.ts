export type FilePurpose = "SCHOOL_LOGO" | "DOCUMENT" | "ATTACHMENT" | "STUDENT_PHOTO" | "STAFF_PHOTO";

export interface UploadedFile {
  id: string;
  url: string;
  mime: string;
  size: number;
}

/** security.md §6 allow-list for images. */
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const IMAGE_MAX_MB = 5;

/** Documents: images, PDF or Word (phase1-contract Deviations › Files). */
export const DOCUMENT_TYPES = [
  ...IMAGE_TYPES,
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const DOCUMENT_MAX_MB = 10;
