import type { PersonRef } from "@/features/people/types";

export type ProgressCategory = "HOMEWORK" | "BEHAVIOUR" | "LEARNING" | "ACHIEVEMENT";

export interface ProgressNote {
  id: string;
  category: ProgressCategory;
  note: string;
  visibleToParent: boolean;
  author?: PersonRef | null;
  createdAt: string;
}

export interface ProgressNoteInput {
  category: ProgressCategory;
  note: string;
  visibleToParent: boolean;
}

export type HomeworkStatus = "DONE" | "PARTIAL" | "NOT_DONE";

export interface HomeworkStatusEntry {
  studentId: string;
  status: HomeworkStatus;
}

/** One homework item for a student (diary homework + teacher tick). Shape is read tolerantly. */
export interface HomeworkCompletionItem {
  id?: string;
  diaryEntryId?: string;
  date: string;
  subject?: PersonRef | null;
  subjectName?: string | null;
  homework?: string | null;
  status?: HomeworkStatus | null;
}
