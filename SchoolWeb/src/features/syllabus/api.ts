import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { toast } from "@/lib/toast";
import { useApiMutation } from "@/lib/use-api-mutation";
import type {
  BookList,
  BookListDraftInput,
  CoverageRow,
  PlanDraftInput,
  ReviewAction,
  SyllabusPlan,
  TopicProgressInput,
  TopicProgressResult,
} from "./types";

export const syllabusKeys = {
  all: ["syllabus"] as const,
  bookLists: (params: Query) => ["syllabus", "book-lists", params] as const,
  revisions: (id: string) => ["syllabus", "revisions", id] as const,
  plans: (params: Query) => ["syllabus", "plans", params] as const,
  coverage: (params: Query) => ["syllabus", "coverage", params] as const,
};

const REVIEW_TOAST: Record<ReviewAction, string> = {
  submit: "Submitted for approval",
  approve: "Approved",
  return: "Returned for changes",
};

export function useBookLists(params: Query, enabled = true) {
  return useQuery({
    queryKey: syllabusKeys.bookLists(params),
    queryFn: async () => (await http.get<BookList[]>("/book-lists", { pageSize: 100, ...params })).data,
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useBookListRevisions(id: string | null) {
  return useQuery({
    queryKey: syllabusKeys.revisions(id ?? ""),
    queryFn: async () => (await http.get<BookList[]>(`/book-lists/${id}/revisions`)).data,
    enabled: !!id,
  });
}

export function useSaveBookListDraft(classId: string) {
  return useApiMutation({
    mutationFn: (input: BookListDraftInput) => http.put<BookList>(`/book-lists/${classId}/draft`, input),
    invalidate: [syllabusKeys.all],
    success: "Book list draft saved",
    toastError: false,
  });
}

export function useReviewBookList() {
  return useApiMutation({
    mutationFn: ({ id, action, comment }: { id: string; action: ReviewAction; comment?: string }) =>
      http.post<BookList>(`/book-lists/${id}/${action}`, comment ? { comment } : {}),
    invalidate: [syllabusKeys.all, ["approvals"]],
    success: (_, vars) => REVIEW_TOAST[vars.action],
  });
}

export function useSyllabusPlans(params: Query, enabled = true) {
  return useQuery({
    queryKey: syllabusKeys.plans(params),
    queryFn: async () => (await http.get<SyllabusPlan[]>("/syllabus-plans", { pageSize: 100, ...params })).data,
    enabled,
  });
}

export function useSavePlanDraft() {
  return useApiMutation({
    mutationFn: (input: PlanDraftInput) => http.put<SyllabusPlan>("/syllabus-plans/draft", input),
    invalidate: [syllabusKeys.all],
    success: "Syllabus plan draft saved",
    toastError: false,
  });
}

export function useReviewPlan() {
  return useApiMutation({
    mutationFn: ({ id, action, comment }: { id: string; action: ReviewAction; comment?: string }) =>
      http.post<SyllabusPlan>(`/syllabus-plans/${id}/${action}`, comment ? { comment } : {}),
    invalidate: [syllabusKeys.all, ["approvals"]],
    success: (_, vars) => REVIEW_TOAST[vars.action],
  });
}

/** Probation: the API holds the change as PENDING_REVIEW and returns { status, approvalId }. */
export function useTopicProgress() {
  return useApiMutation({
    mutationFn: async ({ topicId, input }: { topicId: string; input: TopicProgressInput }) =>
      (await http.post<TopicProgressResult>(`/syllabus-topics/${topicId}/progress`, input)).data,
    invalidate: [syllabusKeys.all],
    toastError: false,
  });
}

export function notifyProgressResult(result: TopicProgressResult | null | undefined) {
  if (result?.status === "PENDING_REVIEW") toast.info("Sent for review — it applies once your reviewer approves it");
  else toast.success("Progress updated");
}

export function useCoverage(params: Query, enabled = true) {
  return useQuery({
    queryKey: syllabusKeys.coverage(params),
    queryFn: async () => (await http.get<CoverageRow[]>("/syllabus/coverage", params)).data,
    placeholderData: keepPreviousData,
    enabled,
  });
}
