import { useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { normalizeCatalog } from "./catalog";
import type { ReportJob, ReportRequest } from "./types";

export const reportKeys = {
  all: ["reports"] as const,
  catalog: ["reports", "catalog"] as const,
  job: (jobId: string) => ["reports", "job", jobId] as const,
  examOptions: (branchId: string | null) => ["reports", "exam-options", branchId] as const,
};

export function useReportCatalog() {
  return useQuery({
    queryKey: reportKeys.catalog,
    queryFn: async () => normalizeCatalog((await http.get<unknown>("/reports/catalog")).data),
  });
}

export function useGenerateReport() {
  return useApiMutation({
    mutationFn: async (input: ReportRequest) => (await http.post<{ jobId?: string; id?: string }>("/reports", input)).data,
    toastError: false,
  });
}

export function useReportJobStatus(jobId: string, refetchInterval: (job: ReportJob | undefined) => number | false) {
  return useQuery({
    queryKey: reportKeys.job(jobId),
    queryFn: async () => (await http.get<ReportJob>(`/reports/${jobId}`)).data,
    refetchInterval: (query) => refetchInterval(query.state.data),
    retry: 1,
  });
}
