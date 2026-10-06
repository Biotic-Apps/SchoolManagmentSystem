import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { examsKeys } from "./keys";
import type { CompletenessRow, Exam, ExamInput, ExamStatusInput, SchedulePaperInput } from "./types";

const ALL = [examsKeys.all];

export function useExams(params: Query, enabled = true) {
  return useQuery({
    queryKey: examsKeys.list(params),
    queryFn: () => http.get<Exam[]>("/exams", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useExam(id: string | null) {
  return useQuery({
    queryKey: examsKeys.detail(id),
    queryFn: async () => (await http.get<Exam>(`/exams/${id}`)).data,
    enabled: !!id,
  });
}

export function useSaveExam() {
  return useApiMutation({
    mutationFn: async ({ id, input }: { id?: string; input: ExamInput }) =>
      id ? (await http.patch<Exam>(`/exams/${id}`, input)).data : (await http.post<Exam>("/exams", input)).data,
    invalidate: ALL,
    success: (_, vars) => (vars.id ? "Exam updated" : "Exam created"),
    toastError: false,
  });
}

/** 409 with clash details when a class sits two papers at once or a room is double booked. */
export function useSaveSchedule(examId: string) {
  return useApiMutation({
    mutationFn: async (papers: SchedulePaperInput[]) =>
      (await http.put<Exam>(`/exams/${examId}/schedule`, { papers })).data,
    invalidate: ALL,
    success: "Schedule saved",
    toastError: false,
  });
}

export function useExamStatus(examId: string) {
  return useApiMutation({
    mutationFn: (input: ExamStatusInput) => http.post<Exam>(`/exams/${examId}/status`, input),
    invalidate: ALL,
    success: (_, vars) => (vars.status === "MARKS_OPEN" ? "Marks entry opened" : "Marks entry closed"),
  });
}

export function useComputeResults(examId: string) {
  return useApiMutation({
    mutationFn: async () => (await http.post<{ jobId: string }>(`/exams/${examId}/compute`)).data,
    invalidate: ALL,
  });
}

/** Sends the results for principal approval (RESULT_PUBLISH); 409 lists sheets not yet accepted. */
export function useApproveResults(examId: string) {
  return useApiMutation({
    mutationFn: async () => (await http.post<{ approvalId?: string }>(`/exams/${examId}/approve-results`)).data,
    invalidate: [...ALL, ["approvals"]],
    success: "Results sent for approval",
    toastError: false,
  });
}

export function usePublishExam(examId: string) {
  return useApiMutation({
    mutationFn: () => http.post<Exam>(`/exams/${examId}/publish`),
    invalidate: ALL,
    success: "Results published to parents",
  });
}

export function useCompleteness(examId: string, branchId: string | null, enabled = true) {
  return useQuery({
    queryKey: examsKeys.completeness(examId, branchId),
    queryFn: async () =>
      (await http.get<CompletenessRow[]>(`/exams/${examId}/completeness`, { branchId })).data ?? [],
    enabled,
  });
}
