import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Option } from "@/components/shared/OptionSelect";
import { OPTIONS_PAGE } from "@/config/options";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { examsKeys } from "./keys";
import type { Exam, PromotionOverrideInput, PromotionRow } from "./types";

const PROMOTIONS = ["exams", "promotions"];

export interface SuggestPromotionsInput {
  branchId: string;
  fromSessionId: string;
  toSessionId: string;
  examIds: string[];
}

export interface ConfirmPromotionsInput {
  branchId: string;
  fromSessionId: string;
  classId?: string;
}

export interface ApplyPromotionsInput {
  branchId: string;
  fromSessionId: string;
  effectiveDate: string;
}

export interface JobStarted {
  jobId?: string | null;
}

/** Published exams of a session, the basis for suggestions. */
export function usePublishedExamOptions(branchId: string | null, sessionId: string | null) {
  const params = { ...OPTIONS_PAGE, branchId, sessionId, status: "PUBLISHED" };
  const query = useQuery({
    queryKey: ["exams", "promotion-exams", params] as const,
    queryFn: async () => (await http.get<Exam[]>("/exams", params)).data,
    enabled: !!branchId && !!sessionId,
  });
  const options: Option[] = (query.data ?? []).map((exam) => ({ id: exam.id, name: exam.name }));
  return { options, isLoading: !!branchId && !!sessionId && query.isLoading };
}

export function usePromotions(params: Query, enabled: boolean) {
  return useQuery({
    queryKey: examsKeys.promotions(params),
    queryFn: async () => (await http.get<PromotionRow[]>("/promotions", params)).data,
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useSuggestPromotions() {
  return useApiMutation({
    mutationFn: async (input: SuggestPromotionsInput) =>
      (await http.post<JobStarted>("/promotions/suggest", input)).data,
    invalidate: [PROMOTIONS],
    toastError: false,
  });
}

export function useOverridePromotion(id: string) {
  return useApiMutation({
    mutationFn: async (input: PromotionOverrideInput) =>
      (await http.patch<PromotionRow>(`/promotions/${id}`, input)).data,
    invalidate: [PROMOTIONS],
    success: "Decision updated",
    toastError: false,
  });
}

export function useConfirmPromotions() {
  return useApiMutation({
    mutationFn: async (input: ConfirmPromotionsInput) => (await http.post<unknown>("/promotions/confirm", input)).data,
    invalidate: [PROMOTIONS, ["approvals"]],
    success: "Promotions sent for approval",
    toastError: false,
  });
}

export function useApplyPromotions() {
  return useApiMutation({
    mutationFn: async (input: ApplyPromotionsInput) =>
      (await http.post<JobStarted>("/promotions/apply", input)).data,
    invalidate: [PROMOTIONS, ["students"], ["enrollments"]],
    toastError: false,
  });
}
