import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { Transfer } from "./types";

export const transferKeys = {
  all: ["transfers"] as const,
  list: (params: Query) => ["transfers", "list", params] as const,
};

export function useTransfers(params: Query, enabled = true) {
  return useQuery({
    queryKey: transferKeys.list(params),
    queryFn: () => http.get<Transfer[]>("/transfers", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

const INVALIDATE = [transferKeys.all, ["students"], ["sections"]];

export function useAcceptTransfer() {
  return useApiMutation({
    mutationFn: ({ id, sectionId }: { id: string; sectionId: string }) =>
      http.post<Transfer>(`/transfers/${id}/accept`, { sectionId }),
    invalidate: INVALIDATE,
    success: "Transfer accepted — student placed",
    toastError: false,
  });
}

export function useCloseTransfer() {
  return useApiMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: "reject" | "cancel"; reason: string }) =>
      http.post<Transfer>(`/transfers/${id}/${action}`, { reason }),
    invalidate: INVALIDATE,
    success: (_, vars) => (vars.action === "reject" ? "Transfer rejected" : "Transfer cancelled"),
    toastError: false,
  });
}
