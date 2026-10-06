import { useQuery } from "@tanstack/react-query";
import { hasErrorCode } from "@/lib/api-error";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { IdCard } from "./types";

const POLL_MS = 2000;

export const idCardKey = (studentId: string) => ["students", "id-card", studentId] as const;

/** Latest ID card; null before the first one is generated. Polls while a job is rendering. */
export function useIdCard(studentId: string) {
  return useQuery({
    queryKey: idCardKey(studentId),
    queryFn: async () => {
      try {
        return (await http.get<IdCard | null>(`/students/${studentId}/id-card`)).data;
      } catch (error) {
        if (hasErrorCode(error, "NOT_FOUND")) return null;
        throw error;
      }
    },
    refetchInterval: (query) => (query.state.data?.status === "PENDING" ? POLL_MS : false),
  });
}

export function useGenerateIdCard(studentId: string) {
  return useApiMutation({
    mutationFn: () => http.post<{ jobId: string }>(`/students/${studentId}/id-card`),
    invalidate: [idCardKey(studentId)],
    success: "ID card is being generated",
  });
}
