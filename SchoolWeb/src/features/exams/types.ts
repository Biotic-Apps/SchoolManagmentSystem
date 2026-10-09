import type { PersonRef } from "@/features/people/types";
import type { StudentSkill } from "./skill-types";

// phase4-contract §A.

export type ExamStatus = "DRAFT" | "SCHEDULED" | "MARKS_OPEN" | "MARKS_CLOSED" | "RESULTS_APPROVED" | "PUBLISHED";
export type ExamType = "TERM" | "MIDTERM" | "UNIT_TEST" | "FINAL";
export type MarkSheetStatus = "NOT_ENTERED" | "DRAFT" | "SUBMITTED" | "ACCEPTED" | "RETURNED";
export type PromotionDecision = "PROMOTE" | "REPEAT" | "CONDITIONAL" | "GRADUATE";

export interface GradeBand {
  grade: string;
  minPercent: number;
  maxPercent: number;
  remark?: string | null;
  gradePoint?: number | null;
}

export interface GradingScheme {
  id: string;
  schoolId: string;
  sessionId: string;
  name: string;
  passPercent: number;
  bands: GradeBand[];
  status?: "DRAFT" | "APPROVED" | string;
  approvedAt?: string | null;
  /** Set when an exam using it is RESULTS_APPROVED, so it can no longer change. */
  locked?: boolean;
}

export interface GradingSchemeInput {
  schoolId: string;
  sessionId: string;
  name: string;
  passPercent: number;
  bands: GradeBand[];
}

export interface ExamPaper {
  id?: string;
  classId: string;
  className?: string;
  subjectId: string;
  subjectName?: string;
  /** The API sends the subject as { id, name }. */
  subject?: PersonRef;
  date: string;
  startTime: string;
  endTime: string;
  maxMarks: number;
  passMarks: number;
  roomId?: string | null;
  roomName?: string | null;
}

export interface Exam {
  id: string;
  branchId: string;
  sessionId: string;
  termId: string | null;
  name: string;
  type: ExamType;
  gradingSchemeId: string;
  gradingScheme?: PersonRef | null;
  weightPercent: number | null;
  classIds: string[];
  classes?: PersonRef[];
  status: ExamStatus;
  papers?: ExamPaper[];
  approvalId?: string | null;
  computedAt?: string | null;
  publishedAt?: string | null;
}

export interface ExamInput {
  branchId: string;
  sessionId: string;
  termId?: string;
  name: string;
  type: ExamType;
  gradingSchemeId: string;
  weightPercent?: number;
  classIds: string[];
}

export interface MarkRow {
  studentId: string;
  name: string;
  rollNo: string | number | null;
  marks: number | null;
  absent: boolean;
  remark: string | null;
}

export interface MarkSheet {
  id: string;
  examId: string;
  paper: { classId: string; className: string; subject: PersonRef; maxMarks: number; passMarks: number; date: string };
  sectionId: string;
  sectionName: string;
  status: MarkSheetStatus;
  teacher: PersonRef | null;
  entered: number;
  total: number;
  comment: string | null;
  rows?: MarkRow[];
}

export interface MarkRowInput {
  studentId: string;
  marks: number | null;
  absent: boolean;
  remark?: string;
}

export interface CompletenessRow {
  classId?: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectId?: string;
  subjectName: string;
  sheetId?: string;
  status: MarkSheetStatus;
  entered: number;
  total: number;
}

export interface SubjectResult {
  subjectId: string;
  name: string;
  marks: number | null;
  maxMarks: number;
  absent: boolean;
  grade: string | null;
  passed: boolean;
}

export interface StudentResult {
  studentId: string;
  name: string;
  rollNo: string | number | null;
  examId: string;
  examName?: string;
  subjects: SubjectResult[];
  totalMarks: number;
  maxTotal: number;
  percent: number;
  grade: string | null;
  /** Rank in the section; null when the branch turns positions off. */
  position: number | null;
  sectionSize?: number;
  /** Rank across all sections of the class. */
  classPosition?: number | null;
  classSize?: number;
  passed: boolean;
  remarks: string | null;
  teacherRemark: string | null;
  /** Published results only: rated behaviour & skills. */
  skills?: StudentSkill[];
}

export interface ExamStatusInput {
  status: "MARKS_OPEN" | "MARKS_CLOSED";
}

export interface SchedulePaperInput {
  classId: string;
  subjectId: string;
  date: string;
  startTime: string;
  endTime: string;
  maxMarks: number;
  passMarks: number;
  roomId?: string;
}

export interface StudentResultsHistory {
  results: StudentResult[];
  trend: { examId: string; examName: string; percent: number; date?: string | null }[];
}

export interface ReportCard {
  status: "PENDING" | "READY" | "FAILED";
  fileUrl: string | null;
  generatedAt: string | null;
}

export interface PromotionRow {
  id: string;
  student: PersonRef & { admissionNo?: string; rollNo?: string | number | null };
  fromClass: PersonRef;
  fromSection: PersonRef | null;
  toClass: PersonRef | null;
  toSection: PersonRef | null;
  percent: number | null;
  suggested: PromotionDecision;
  decision: PromotionDecision;
  reason: string | null;
  status: "SUGGESTED" | "CONFIRMED" | "APPLIED";
}

/** Probation-gated (P) actions answer this instead of applying. */
export interface ProbationResult {
  status: "PENDING_REVIEW";
  approvalId: string;
}

export interface PromotionOverrideInput {
  decision: PromotionDecision;
  toSectionId?: string;
  reason?: string;
}
