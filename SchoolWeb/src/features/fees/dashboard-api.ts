import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { feesKeys } from "./keys";
import type { FinanceDashboard } from "./types";

export function useFinanceDashboard(branchId: string | null, month: string) {
  return useQuery({
    queryKey: feesKeys.dashboard(branchId, month),
    queryFn: async () => (await http.get<FinanceDashboard>("/dashboard/finance", { branchId, month })).data,
    enabled: !!branchId,
  });
}
