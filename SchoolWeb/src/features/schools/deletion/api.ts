import { useMutation, useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { SchoolDeletionPreview, SchoolDeletionStatus } from "./types";

const POLL_MS = 1000;

export const deletionKeys = {
  preview: (id: string) => ["schools", "deletion-preview", id] as const,
  status: (id: string) => ["schools", "deletion-status", id] as const,
};

export function useDeletionPreview(id: string | null) {
  return useQuery({
    queryKey: deletionKeys.preview(id ?? ""),
    queryFn: async () => (await http.get<SchoolDeletionPreview>(`/schools/${id}/deletion-preview`)).data,
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
  });
}

/** Polls while the background deletion runs; stops once it is deleted or failed. */
export function useDeletionStatus(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: deletionKeys.status(id ?? ""),
    queryFn: async () => (await http.get<SchoolDeletionStatus>(`/schools/${id}/deletion-status`)).data,
    enabled: !!id && enabled,
    gcTime: 0,
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      return state === "DELETED" || state === "FAILED" ? false : POLL_MS;
    },
  });
}

export function useRequestDeletion() {
  return useMutation({
    mutationFn: async ({ id, confirmCode }: { id: string; confirmCode: string }) =>
      (await http.delete<SchoolDeletionStatus>(`/schools/${id}`, { confirmCode })).data,
  });
}
