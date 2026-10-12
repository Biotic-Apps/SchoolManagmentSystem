import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { templateKeys } from "./keys";
import type { ReportCardTemplate, ReportCardTemplateInput } from "./types";

const ALL = [templateKeys.all];

export function useReportCardTemplates(params: Query = {}) {
  return useQuery({
    queryKey: templateKeys.list(params),
    queryFn: async () => (await http.get<ReportCardTemplate[]>("/report-card-templates", params)).data ?? [],
    placeholderData: keepPreviousData,
  });
}

export function useReportCardTemplate(id: string | null) {
  return useQuery({
    queryKey: templateKeys.detail(id!),
    queryFn: async () => (await http.get<ReportCardTemplate>(`/report-card-templates/${id}`)).data,
    enabled: !!id,
  });
}

export function useSaveReportCardTemplate() {
  return useApiMutation({
    mutationFn: async ({ id, input }: { id?: string; input: ReportCardTemplateInput }) =>
      id
        ? (await http.patch<ReportCardTemplate>(`/report-card-templates/${id}`, input)).data
        : (await http.post<ReportCardTemplate>("/report-card-templates", input)).data,
    invalidate: ALL,
    success: (_, vars) => (vars.id ? "Template updated" : "Template created"),
    toastError: false,
  });
}

export function useDeleteReportCardTemplate() {
  return useApiMutation({
    mutationFn: async (id: string) => (await http.delete(`/report-card-templates/${id}`)).data,
    invalidate: ALL,
    success: "Template deleted",
  });
}

export function useSetDefaultTemplate() {
  return useApiMutation({
    mutationFn: async (id: string) =>
      (await http.post<ReportCardTemplate>(`/report-card-templates/${id}/set-default`)).data,
    invalidate: ALL,
    success: "Default template updated",
  });
}
