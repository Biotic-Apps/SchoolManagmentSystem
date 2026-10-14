import type { Attachment } from "@/features/files/types";
import type { PersonRef } from "@/features/people/types";

export type DiaryStatus = "DRAFT" | "SUBMITTED" | "PUBLISHED" | "RETURNED" | "PENDING_REVIEW";

export interface DiaryEntry {
  id: string;
  sectionId: string;
  className: string;
  sectionName: string;
  subject: PersonRef;
  date: string;
  topics: string;
  homework: string | null;
  dueDate: string | null;
  attachments: Attachment[];
  status: DiaryStatus;
  revision: number;
  author: PersonRef;
  onBehalfOf: PersonRef | null;
  comment: string | null;
  /** Moderation / probation approval while SUBMITTED or PENDING_REVIEW. */
  approvalId?: string | null;
  publishedAt: string | null;
}

export interface DiaryInput {
  sectionId: string;
  subjectId: string;
  date: string;
  topics: string;
  homework?: string;
  dueDate?: string;
  attachmentFileIds?: string[];
  clientRequestId?: string;
}

/** Timetable slot (section + subject) with no PUBLISHED entry for the day. */
export interface MissingDiary {
  sectionId: string;
  className: string;
  sectionName: string;
  subject?: PersonRef | null;
  subjectId?: string;
  subjectName?: string;
  teacher?: PersonRef | null;
}
