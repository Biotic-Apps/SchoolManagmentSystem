import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { feesKeys } from "./keys";
import type { FeeSummary, LedgerEntry } from "./types";

type LedgerResponse = LedgerEntry[] | { entries?: LedgerEntry[]; items?: LedgerEntry[] };

export function useStudentLedger(studentId: string | null) {
  return useQuery({
    queryKey: feesKeys.ledger(studentId),
    queryFn: async () => {
      const data = (await http.get<LedgerResponse>(`/students/${studentId}/ledger`)).data;
      if (Array.isArray(data)) return data;
      return data?.entries ?? data?.items ?? [];
    },
    enabled: !!studentId,
  });
}

export function useFeeSummary(studentId: string | null) {
  return useQuery({
    queryKey: feesKeys.summary(studentId),
    queryFn: async () => (await http.get<FeeSummary>(`/students/${studentId}/fee-summary`)).data,
    enabled: !!studentId,
  });
}
