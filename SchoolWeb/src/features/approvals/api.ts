import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { ApprovalRequest, DecideInput } from "./types";

export const approvalKeys = {
  all: ["approvals"] as const,
  list: (params: Query) => ["approvals", "list", params] as const,
  detail: (id: string) => ["approvals", "detail", id] as const,
};

const DECIDED_TOAST = { APPROVED: "Request approved", REJECTED: "Request rejected", RETURNED: "Request returned" };

export function useApprovals(params: Query) {
  return useQuery({
    queryKey: approvalKeys.list(params),
    queryFn: () => http.get<ApprovalRequest[]>("/approvals", params),
    placeholderData: keepPreviousData,
  });
}

export function useApproval(id: string | null) {
  return useQuery({
    queryKey: approvalKeys.detail(id ?? ""),
    queryFn: async () => (await http.get<ApprovalRequest>(`/approvals/${id}`)).data,
    enabled: !!id,
  });
}

export function useDecideApproval() {
  return useApiMutation({
    mutationFn: ({ id, input }: { id: string; input: DecideInput }) =>
      http.post<ApprovalRequest>(`/approvals/${id}/decide`, input),
    invalidate: [approvalKeys.all, ["dashboard"], ["notifications"]],
    success: (_, vars) => DECIDED_TOAST[vars.input.decision],
  });
}
