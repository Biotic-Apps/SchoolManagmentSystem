import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { withRowFlash } from "@/lib/row-highlight";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { Complaint, ComplaintInput, ComplaintUpdateInput } from "./types";

export const complaintKeys = {
  all: ["complaints"] as const,
  list: (params: Query) => ["complaints", "list", params] as const,
  detail: (id: string) => ["complaints", "detail", id] as const,
};

const INVALIDATE = [complaintKeys.all, ["dashboard"]];

export type ComplaintAction = "escalate" | "close" | "reopen";

const ACTION_TOAST: Record<ComplaintAction, string> = {
  escalate: "Complaint escalated",
  close: "Complaint closed",
  reopen: "Complaint reopened",
};

export function useComplaints(params: Query, enabled = true) {
  return useQuery({
    queryKey: complaintKeys.list(params),
    queryFn: () => http.get<Complaint[]>("/complaints", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useComplaint(id: string | null) {
  return useQuery({
    queryKey: complaintKeys.detail(id ?? ""),
    queryFn: async () => (await http.get<Complaint>(`/complaints/${id}`)).data,
    enabled: !!id,
  });
}

export function useCreateComplaint() {
  return useApiMutation({
    mutationFn: withRowFlash(
      async (input: ComplaintInput) => (await http.post<Complaint>("/complaints", input)).data,
      (complaint) => complaint.id,
    ),
    invalidate: INVALIDATE,
    success: (created) => `Complaint ${created.ticketNo} filed`,
    toastError: false,
  });
}

export function useAssignComplaint(id: string) {
  return useApiMutation({
    mutationFn: (assigneeUserId: string) => http.post<Complaint>(`/complaints/${id}/assign`, { assigneeUserId }),
    invalidate: INVALIDATE,
    success: "Complaint assigned",
    toastError: false,
  });
}

export function useAddComplaintUpdate(id: string) {
  return useApiMutation({
    mutationFn: (input: ComplaintUpdateInput) => http.post<Complaint>(`/complaints/${id}/updates`, input),
    invalidate: INVALIDATE,
    success: "Update added",
    toastError: false,
  });
}

export function useComplaintAction(id: string) {
  return useApiMutation({
    mutationFn: ({ action, reason }: { action: ComplaintAction; reason?: string }) =>
      http.post<Complaint>(`/complaints/${id}/${action}`, reason ? { reason } : {}),
    invalidate: INVALIDATE,
    success: (_, vars) => ACTION_TOAST[vars.action],
    toastError: false,
  });
}
