import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { hrLetterKeys } from "./keys";
import type { GenerateHrLetterInput, HrLetter, HrLetterTemplate } from "./types";

// ── Templates ──

export function useHrLetterTemplates(params: Query, enabled = true) {
  return useQuery({
    queryKey: hrLetterKeys.templates(params),
    queryFn: () => http.get<HrLetterTemplate[]>("/hr-letter-templates", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useCreateHrLetterTemplate() {
  return useApiMutation({
    mutationFn: async (input: { schoolId: string; type: string; title: string; bodyTemplate: string }) =>
      (await http.post<HrLetterTemplate>("/hr-letter-templates", input)).data,
    invalidate: [hrLetterKeys.all],
    success: "Template created",
    toastError: false,
  });
}

export function useUpdateHrLetterTemplate(id: string) {
  return useApiMutation({
    mutationFn: async (input: { title?: string; bodyTemplate?: string; status?: string }) =>
      (await http.patch<HrLetterTemplate>(`/hr-letter-templates/${id}`, input)).data,
    invalidate: [hrLetterKeys.all],
    success: "Template updated",
    toastError: false,
  });
}

export function useDeleteHrLetterTemplate(id: string) {
  return useApiMutation({
    mutationFn: () => http.delete(`/hr-letter-templates/${id}`),
    invalidate: [hrLetterKeys.all],
    success: "Template archived",
  });
}

// ── Staff letters ──

export function useStaffHrLetters(staffId: string) {
  return useQuery({
    queryKey: hrLetterKeys.staffLetters(staffId),
    queryFn: async () => (await http.get<HrLetter[]>(`/staff/${staffId}/hr-letters`)).data,
    enabled: !!staffId,
  });
}

export function useGenerateHrLetter(staffId: string) {
  return useApiMutation({
    mutationFn: async (input: GenerateHrLetterInput) =>
      (await http.post<HrLetter>(`/staff/${staffId}/hr-letters`, input)).data,
    invalidate: [hrLetterKeys.all, hrLetterKeys.staffLetters(staffId)],
    success: "Letter generated",
    toastError: false,
  });
}
