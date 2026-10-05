import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { Section, SectionCreateInput, SectionUpdateInput } from "./types";

export const sectionKeys = {
  all: ["sections"] as const,
  list: (params: Query) => ["sections", "list", params] as const,
};

export function useSections(params: Query, enabled = true) {
  return useQuery({
    queryKey: sectionKeys.list(params),
    queryFn: () => http.get<Section[]>("/sections", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

type SaveSectionVars = { id: string; input: SectionUpdateInput } | { id?: undefined; input: SectionCreateInput };

export function useSaveSection() {
  return useApiMutation({
    mutationFn: ({ id, input }: SaveSectionVars) =>
      id ? http.patch<Section>(`/sections/${id}`, input) : http.post<Section>("/sections", input),
    invalidate: [sectionKeys.all, ["dashboard"]],
    success: (_, vars) => (vars.id ? "Section updated" : "Section created"),
    toastError: false,
  });
}

export function useArchiveSection() {
  return useApiMutation({
    mutationFn: (id: string) => http.post(`/sections/${id}/archive`),
    invalidate: [sectionKeys.all, ["dashboard"]],
    success: "Section archived",
  });
}
