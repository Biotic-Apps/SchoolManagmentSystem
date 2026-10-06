import { useQuery } from "@tanstack/react-query";
import { OPTIONS_PAGE } from "@/config/options";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { feesKeys } from "./keys";
import type { FeeHead, FeeHeadKind, FeePlan, FeePlanInput } from "./types";

export interface FeeHeadInput {
  schoolId: string;
  code: string;
  name: string;
  kind: FeeHeadKind;
  refundable: boolean;
}

export function useFeeHeads(schoolId: string | null) {
  return useQuery({
    queryKey: feesKeys.heads(schoolId),
    queryFn: async () => (await http.get<FeeHead[]>("/fee-heads", { schoolId, ...OPTIONS_PAGE })).data,
    enabled: !!schoolId,
  });
}

export function useCreateFeeHead() {
  return useApiMutation({
    mutationFn: async (input: FeeHeadInput) => (await http.post<FeeHead>("/fee-heads", input)).data,
    invalidate: [feesKeys.all],
    success: "Fee head added",
    toastError: false,
  });
}

export function useFeePlans(branchId: string | null, sessionId: string | null) {
  const params = { branchId, sessionId };
  return useQuery({
    queryKey: feesKeys.plans(params),
    queryFn: async () => (await http.get<FeePlan[]>("/fee-plans", { ...params, ...OPTIONS_PAGE })).data,
    enabled: !!branchId && !!sessionId,
  });
}

export function useSaveFeePlan() {
  return useApiMutation({
    mutationFn: async ({ id, input }: { id?: string; input: FeePlanInput }) =>
      (id ? await http.patch<FeePlan>(`/fee-plans/${id}`, input) : await http.post<FeePlan>("/fee-plans", input)).data,
    invalidate: [feesKeys.all, ["approvals"]],
    success: (_, vars) => (vars.id ? "Fee plan updated" : "Fee plan created"),
    toastError: false,
  });
}

export function useApproveFeePlan() {
  return useApiMutation({
    mutationFn: (id: string) => http.post(`/fee-plans/${id}/approve`),
    invalidate: [feesKeys.all, ["approvals"]],
    success: "Fee plan approved",
  });
}
