import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";

export type ExamPrintKind = "REPORT_CARDS" | "DATE_SHEET" | "AWARD_LIST";

export interface ExamPrintInput {
  kind: ExamPrintKind;
  sectionId?: string;
  classId?: string;
  subjectId?: string;
  /** REPORT_CARDS only: override the default template. */
  templateId?: string;
}

/** Queues a bulk exam PDF; poll the returned job for its file. */
export function useExamPrint(examId: string) {
  return useApiMutation({
    mutationFn: async (input: ExamPrintInput) =>
      (await http.post<{ jobId: string }>(`/exams/${examId}/print`, input)).data,
  });
}
