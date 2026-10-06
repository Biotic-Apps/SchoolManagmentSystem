import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { feesKeys } from "./keys";
import type { DueRow } from "./types";

export function useDues(params: Query, enabled = true) {
  return useQuery({
    queryKey: feesKeys.dues(params),
    queryFn: () => http.get<DueRow[]>("/dues", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useSendDueReminders() {
  return useApiMutation({
    mutationFn: (studentIds: string[]) => http.post<{ jobId?: string }>("/dues/reminders", { studentIds }),
    success: (_, ids) => `Reminders queued for ${ids.length} ${ids.length === 1 ? "student" : "students"}`,
  });
}
