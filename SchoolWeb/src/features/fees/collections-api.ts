import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { feesKeys } from "./keys";
import type { DailyCollection } from "./types";

export interface CloseDayInput {
  branchId: string;
  date: string;
  cashCountedMinor: number;
  note?: string;
}

export function useDailyCollection(branchId: string | null, date: string) {
  return useQuery({
    queryKey: feesKeys.collections(branchId, date),
    queryFn: async () => (await http.get<DailyCollection>("/collections/daily", { branchId, date })).data,
    enabled: !!branchId,
  });
}

export function useCloseDay() {
  return useApiMutation({
    mutationFn: (input: CloseDayInput) => http.post("/collections/daily/close", input),
    invalidate: [feesKeys.all, ["dashboard"]],
    success: "Day closed",
    toastError: false,
  });
}
