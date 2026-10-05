import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import type { ScopeValue } from "@/lib/scope";
import type { DashboardSummary } from "./types";

export function useDashboardSummary(scope: ScopeValue, enabled: boolean) {
  return useQuery({
    queryKey: ["dashboard", "summary", scope],
    queryFn: async () => (await http.get<DashboardSummary>("/dashboard/summary", { ...scope })).data,
    placeholderData: keepPreviousData,
    enabled,
  });
}
