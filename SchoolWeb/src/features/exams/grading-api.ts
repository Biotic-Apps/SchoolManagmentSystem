import { useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { examsKeys } from "./keys";
import type { GradingScheme, GradingSchemeInput } from "./types";

const SCHEMES_KEY = ["exams", "schemes"];

export function useGradingSchemes(params: Query, enabled = true) {
  return useQuery({
    queryKey: examsKeys.schemes(params),
    queryFn: async () => (await http.get<GradingScheme[]>("/grading-schemes", params)).data ?? [],
    enabled,
  });
}

/** PATCH is refused (409) once an exam using the scheme is RESULTS_APPROVED. */
export function useSaveGradingScheme() {
  return useApiMutation({
    mutationFn: async ({ id, input }: { id?: string; input: GradingSchemeInput }) =>
      id
        ? (await http.patch<GradingScheme>(`/grading-schemes/${id}`, input)).data
        : (await http.post<GradingScheme>("/grading-schemes", input)).data,
    invalidate: [SCHEMES_KEY],
    success: (_, vars) => (vars.id ? "Grading scheme updated" : "Grading scheme created"),
    toastError: false,
  });
}

export function useApproveGradingScheme() {
  return useApiMutation({
    mutationFn: (id: string) => http.post(`/grading-schemes/${id}/approve`),
    invalidate: [SCHEMES_KEY],
    success: "Grading scheme approved",
  });
}
