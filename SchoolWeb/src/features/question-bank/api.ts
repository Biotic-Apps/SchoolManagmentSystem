import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { withRowFlash } from "@/lib/row-highlight";
import { useApiMutation } from "@/lib/use-api-mutation";
import type {
  ExamPaper,
  GenerateExamPaperInput,
  Question,
  QuestionInput,
} from "./types";

// ── Questions ───────────────────────────────────────────────────────────

export const questionKeys = {
  all: ["questions"] as const,
  list: (params: Query) => ["questions", "list", params] as const,
  detail: (id: string) => ["questions", "detail", id] as const,
};

export function useQuestions(params: Query, enabled = true) {
  return useQuery({
    queryKey: questionKeys.list(params),
    queryFn: async () => (await http.get<Question[]>("/questions", params)).data,
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useQuestion(id: string | null) {
  return useQuery({
    queryKey: questionKeys.detail(id ?? ""),
    queryFn: async () => (await http.get<Question>(`/questions/${id}`)).data,
    enabled: !!id,
  });
}

export function useSaveQuestion() {
  return useApiMutation({
    mutationFn: withRowFlash(
      async ({ id, input }: { id?: string; input: QuestionInput }) =>
        (id
          ? await http.patch<Question>(`/questions/${id}`, input)
          : await http.post<Question>("/questions", input)
        ).data,
      (row, vars) => vars.id ?? row.id,
    ),
    invalidate: [questionKeys.all],
    success: (_, vars) => (vars.id ? "Question updated" : "Question added"),
    toastError: false,
  });
}

export function useDeleteQuestion() {
  return useApiMutation({
    mutationFn: async (id: string) =>
      (await http.delete<Question>(`/questions/${id}`)).data,
    invalidate: [questionKeys.all],
    success: "Question archived",
  });
}

// ── Exam Papers ─────────────────────────────────────────────────────────

export const examPaperKeys = {
  all: ["exam-papers"] as const,
  list: (params: Query) => ["exam-papers", "list", params] as const,
  detail: (id: string) => ["exam-papers", "detail", id] as const,
};

export function useExamPapers(params: Query, enabled = true) {
  return useQuery({
    queryKey: examPaperKeys.list(params),
    queryFn: async () => (await http.get<ExamPaper[]>("/exam-papers", params)).data,
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useExamPaper(id: string | null) {
  return useQuery({
    queryKey: examPaperKeys.detail(id ?? ""),
    queryFn: async () => (await http.get<ExamPaper>(`/exam-papers/${id}`)).data,
    enabled: !!id,
  });
}

export function useGenerateExamPaper() {
  return useApiMutation({
    mutationFn: async (input: GenerateExamPaperInput) =>
      (await http.post<ExamPaper>("/exam-papers/generate", input)).data,
    invalidate: [examPaperKeys.all],
    success: "Exam paper generated",
    toastError: false,
  });
}

export function useUpdateExamPaper() {
  return useApiMutation({
    mutationFn: async ({ id, input }: { id: string; input: Record<string, unknown> }) =>
      (await http.patch<ExamPaper>(`/exam-papers/${id}`, input)).data,
    invalidate: [examPaperKeys.all],
    success: "Exam paper updated",
  });
}
