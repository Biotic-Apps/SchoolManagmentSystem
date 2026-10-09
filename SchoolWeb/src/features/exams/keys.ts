import type { Query } from "@/lib/http";

export const examsKeys = {
  all: ["exams"] as const,
  schemes: (params: Query) => ["exams", "schemes", params] as const,
  list: (params: Query) => ["exams", "list", params] as const,
  detail: (id: string | null) => ["exams", "detail", id] as const,
  markSheets: (examId: string, params: Query) => ["exams", "mark-sheets", examId, params] as const,
  markSheet: (id: string | null) => ["exams", "mark-sheet", id] as const,
  completeness: (examId: string, branchId: string | null) => ["exams", "completeness", examId, branchId] as const,
  results: (params: Query) => ["exams", "results", params] as const,
  studentResults: (studentId: string | null) => ["exams", "student-results", studentId] as const,
  reportCard: (studentId: string | null, examId: string | null) => ["exams", "report-card", studentId, examId] as const,
  promotions: (params: Query) => ["exams", "promotions", params] as const,
  skillConfig: (branchId: string | null) => ["exams", "skill-config", branchId] as const,
  skillGrid: (examId: string, sectionId: string | null) => ["exams", "skill-grid", examId, sectionId] as const,
};
