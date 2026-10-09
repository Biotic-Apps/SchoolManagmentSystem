import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { Leave, StaffLeaveInput, StudentLeaveInput } from "./types";

export const leaveKeys = {
  all: ["leave"] as const,
  list: (params: Query) => ["leave", "list", params] as const,
};

const INVALIDATE = [leaveKeys.all, ["attendance"], ["dashboard"]];

export type LeaveDecision = "approve" | "reject" | "cancel";

const DECISION_TOAST: Record<LeaveDecision, string> = {
  approve: "Leave approved",
  reject: "Leave rejected",
  cancel: "Leave request withdrawn",
};

export function useLeaveList(params: Query & { scope: "mine" | "review" }, enabled = true) {
  return useQuery({
    queryKey: leaveKeys.list(params),
    queryFn: async () => (await http.get<Leave[]>("/leave", params)).data,
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useRequestLeave() {
  return useApiMutation({
    mutationFn: async (input: StudentLeaveInput | StaffLeaveInput) => (await http.post<Leave>("/leave", input)).data,
    invalidate: INVALIDATE,
    success: "Leave request sent",
    toastError: false,
  });
}

export function useDecideLeave() {
  return useApiMutation({
    mutationFn: ({ id, action, comment }: { id: string; action: LeaveDecision; comment?: string }) =>
      http.post<Leave>(`/leave/${id}/${action}`, comment ? { comment } : {}),
    invalidate: INVALIDATE,
    success: (_, vars) => DECISION_TOAST[vars.action],
  });
}
