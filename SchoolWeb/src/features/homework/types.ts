import type { Attachment } from "@/features/files/types";

export type HomeworkStatus = "ACTIVE" | "ARCHIVED";
export type SubmissionStatus = "SUBMITTED" | "LATE" | "GRADED" | "RETURNED";

export interface IdName {
  id: string;
  name: string;
}

export interface Homework {
  id: string;
  schoolId: string;
  branchId: string;
  classId: string;
  sectionId: string;
  className: string;
  sectionName: string;
  subject: IdName;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number | null;
  attachments: Attachment[];
  assignedBy: IdName;
  status: HomeworkStatus;
  submissionCount: number;
  gradedCount: number;
  createdAt: string;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  student: IdName;
  submittedAt: string;
  text: string | null;
  attachments: Attachment[];
  marks: number | null;
  grade: string | null;
  feedback: string | null;
  gradedBy: IdName | null;
  gradedAt: string | null;
  status: SubmissionStatus;
}

export interface CreateHomeworkInput {
  sectionId: string;
  subjectId: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks?: number;
  attachmentFileIds?: string[];
}

export interface UpdateHomeworkInput {
  title?: string;
  description?: string;
  dueDate?: string;
  maxMarks?: number | null;
  attachmentFileIds?: string[];
}

export interface SubmitHomeworkInput {
  text?: string;
  fileIds?: string[];
}

export interface GradeSubmissionInput {
  marks?: number;
  grade?: string;
  feedback?: string;
}
