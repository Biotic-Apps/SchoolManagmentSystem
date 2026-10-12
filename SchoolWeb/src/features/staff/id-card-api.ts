import { useQuery } from "@tanstack/react-query";
import { hasErrorCode } from "@/lib/api-error";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { StaffIdCard } from "./types";

const POLL_MS = 2000;

export const staffIdCardKey = (staffId: string) => ["staff", "id-card", staffId] as const;

/** Latest ID card; null before the first one is generated. Polls while a job is rendering. */
export function useStaffIdCard(staffId: string) {
  return useQuery({
    queryKey: staffIdCardKey(staffId),
    queryFn: async () => {
      try {
        return (await http.get<StaffIdCard | null>(`/staff/${staffId}/id-card`)).data;
      } catch (error) {
        if (hasErrorCode(error, "NOT_FOUND")) return null;
        throw error;
      }
    },
    refetchInterval: (query) => (query.state.data?.status === "PENDING" ? POLL_MS : false),
  });
}

export function useGenerateStaffIdCard(staffId: string) {
  return useApiMutation({
    mutationFn: () => http.post<{ jobId: string }>(`/staff/${staffId}/id-card`),
    invalidate: [staffIdCardKey(staffId)],
    success: "ID card is being generated",
  });
}
