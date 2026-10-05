export type FilePurpose = "SCHOOL_LOGO" | "DOCUMENT" | "ATTACHMENT";

export interface UploadedFile {
  id: string;
  url: string;
  mime: string;
  size: number;
}

/** security.md §6 allow-list for images. */
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const IMAGE_MAX_MB = 5;
