import { useQuery } from "@tanstack/react-query";
import { hasErrorCode } from "@/lib/api-error";
import { http } from "@/lib/http";
import { examsKeys } from "./keys";
import type { ReportCard, StudentResult, StudentResultsHistory } from "./types";

const POLL_MS = 2000;

export function useSectionResults(examId: string, sectionId: string | null) {
  const params = { examId, sectionId };
  return useQuery({
    queryKey: examsKeys.results(params),
    queryFn: async () => (await http.get<StudentResult[]>("/results", params)).data ?? [],
    enabled: !!sectionId,
  });
}

/** One student's result for an exam (the list endpoint filtered by student). */
export function useStudentResult(examId: string | null, studentId: string | null) {
  const params = { examId, studentId };
  return useQuery({
    queryKey: examsKeys.results(params),
    queryFn: async () => {
      const rows = (await http.get<StudentResult[]>("/results", params)).data ?? [];
      return rows.find((row) => row.studentId === studentId) ?? null;
    },
    enabled: !!examId && !!studentId,
  });
}

/** All published results of a student plus the percent trend. */
export function useStudentResults(studentId: string | null) {
  return useQuery({
    queryKey: examsKeys.studentResults(studentId),
    queryFn: async () => {
      const data = (await http.get<StudentResultsHistory | StudentResult[]>(`/students/${studentId}/results`)).data;
      return normalizeHistory(data);
    },
    enabled: !!studentId,
  });
}

/** Report card PDF; null before one exists. Polls while it is rendering. */
export function useReportCard(studentId: string | null, examId: string | null, enabled = true) {
  return useQuery({
    queryKey: examsKeys.reportCard(studentId, examId),
    queryFn: async () => {
      try {
        return (await http.get<ReportCard | null>(`/students/${studentId}/report-cards`, { examId })).data ?? null;
      } catch (error) {
        if (hasErrorCode(error, "NOT_FOUND")) return null;
        throw error;
      }
    },
    enabled: enabled && !!studentId && !!examId,
    refetchInterval: (query) => (query.state.data?.status === "PENDING" ? POLL_MS : false),
  });
}

// The API may send a bare result list instead of { results, trend }.
function normalizeHistory(data: StudentResultsHistory | StudentResult[] | null | undefined): StudentResultsHistory {
  if (Array.isArray(data)) {
    return {
      results: data,
      trend: data.map((row) => ({ examId: row.examId, examName: row.examName ?? "", percent: row.percent })),
    };
  }
  const results = data?.results ?? [];
  const trend =
    data?.trend ??
    results.map((row) => ({ examId: row.examId, examName: row.examName ?? "", percent: row.percent }));
  return { results, trend };
}
