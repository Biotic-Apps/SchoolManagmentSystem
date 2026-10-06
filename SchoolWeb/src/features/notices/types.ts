import type { Attachment } from "@/features/files/types";
import type { PersonRef } from "@/features/people/types";

export type NoticeStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "EXPIRED";

export interface NoticeAudience {
  schoolWide?: boolean;
  branchIds?: string[];
  classIds?: string[];
  sectionIds?: string[];
  staffOnly?: boolean;
  guardianIds?: string[];
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  audience: NoticeAudience;
  attachments: Attachment[];
  expiresOn: string | null;
  pinned: boolean;
  status: NoticeStatus;
  author: PersonRef | null;
  publishedAt: string | null;
  createdAt: string;
  /** Recipient view: whether the caller has opened it. */
  read?: boolean;
}

export interface NoticeInput {
  title: string;
  body: string;
  audience: NoticeAudience;
  attachmentFileIds?: string[];
  expiresOn?: string;
  pinned?: boolean;
}

export interface NoticeReads {
  total: number;
  read: number;
}
