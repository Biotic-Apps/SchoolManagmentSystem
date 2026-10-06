import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { ChildLinkRequest, ChildLinkStart, ChildLinkStarted, ContactChangeInput } from "./types";

export const childLinkKeys = {
  all: ["child-links"] as const,
  list: (params: Query) => ["child-links", "list", params] as const,
};

const INVALIDATE = [childLinkKeys.all, ["guardians"], ["students"], ["approvals"], ["dashboard"]];

export function useChildLinkRequests(params: Query, enabled = true) {
  return useQuery({
    queryKey: childLinkKeys.list(params),
    queryFn: () => http.get<ChildLinkRequest[]>("/child-links", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useDecideChildLink() {
  return useApiMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: "approve" | "reject"; reason?: string }) =>
      http.post(`/child-links/${id}/${action}`, reason ? { reason } : {}),
    invalidate: INVALIDATE,
    success: (_, vars) => (vars.action === "approve" ? "Child link approved" : "Child link rejected"),
    toastError: false,
  });
}

/** PARENT: step 1 — sends an OTP to the phone on the child's primary guardian record. */
export function useStartChildLink() {
  return useApiMutation({
    mutationFn: async (input: ChildLinkStart) => (await http.post<ChildLinkStarted>("/child-links/request", input)).data,
    toastError: false,
  });
}

/** PARENT: step 2 — the OTP turns the request into a CHILD_LINK approval. */
export function useVerifyChildLinkOtp() {
  return useApiMutation({
    mutationFn: ({ requestId, code }: { requestId: string; code: string }) =>
      http.post(`/child-links/${requestId}/otp`, { code }),
    invalidate: [childLinkKeys.all],
    success: "Request sent — the school will review it",
    toastError: false,
  });
}

export function useRequestContactChange() {
  return useApiMutation({
    mutationFn: (input: ContactChangeInput) => http.post("/guardians/me/contact-change", input),
    invalidate: [["approvals"]],
    success: "Change requested — it applies once the school approves it",
    toastError: false,
  });
}
