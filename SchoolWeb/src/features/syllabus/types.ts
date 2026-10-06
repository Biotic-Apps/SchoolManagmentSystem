export type ReviewStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "RETURNED";

export type TopicStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface BookItem {
  id?: string;
  subjectId: string | null;
  subjectName?: string | null;
  title: string;
  author: string | null;
  publisher: string | null;
  isbn: string | null;
  isMandatory: boolean;
  priceMinor: number | null;
}

export interface BookList {
  id: string;
  branchId: string;
  sessionId: string;
  classId: string;
  className: string;
  revision: number;
  status: ReviewStatus;
  items: BookItem[];
  approvedAt: string | null;
  comment: string | null;
}

export interface BookItemInput {
  subjectId?: string;
  title: string;
  author?: string;
  publisher?: string;
  isbn?: string;
  isMandatory: boolean;
  priceMinor?: number;
}

export interface BookListDraftInput {
  branchId: string;
  sessionId: string;
  items: BookItemInput[];
}

export interface Topic {
  id: string;
  title: string;
  order: number;
  targetDate: string | null;
  status: TopicStatus;
  completedOn: string | null;
  isDelayed: boolean;
  pendingReview: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  topics: Topic[];
}

export interface PlanProgress {
  total: number;
  completed: number;
  delayed: number;
  percent: number;
}

export interface SyllabusPlan {
  id: string;
  sectionId: string;
  subjectId: string;
  subjectName: string;
  sessionId: string;
  revision: number;
  status: ReviewStatus;
  chapters: Chapter[];
  progress: PlanProgress;
  comment?: string | null;
}

export interface PlanDraftInput {
  sectionId: string;
  subjectId: string;
  sessionId: string;
  chapters: { title: string; order: number; topics: { title: string; order: number; targetDate: string }[] }[];
}

export interface TopicProgressInput {
  status: TopicStatus;
  completedOn?: string;
  note?: string;
}

/** Probation-gated actions answer with PENDING_REVIEW instead of applying. */
export interface TopicProgressResult {
  status?: string;
  approvalId?: string;
}

export interface CoverageRow extends PlanProgress {
  sectionId: string;
  sectionName?: string | null;
  className?: string | null;
  subjectId: string;
  subjectName?: string | null;
}

export type ReviewAction = "submit" | "approve" | "return";
