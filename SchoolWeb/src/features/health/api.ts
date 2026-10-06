import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { hasErrorCode } from "@/lib/api-error";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { HealthProfile, HealthProfileInput, IncidentDetail, IncidentFilters, IncidentInput } from "./types";

export const healthKeys = {
  all: ["health"] as const,
  profile: (studentId: string) => ["health", "profile", studentId] as const,
  incidents: ["health", "incidents"] as const,
  incidentList: (filters: IncidentFilters) => ["health", "incidents", filters] as const,
};

/** null when the student has no health profile yet (404). */
export function useHealthProfile(studentId: string) {
  return useQuery({
    queryKey: healthKeys.profile(studentId),
    queryFn: async () => {
      try {
        return (await http.get<HealthProfile | null>(`/students/${studentId}/health`)).data ?? null;
      } catch (error) {
        if (hasErrorCode(error, "NOT_FOUND")) return null;
        throw error;
      }
    },
  });
}

export function useSaveHealthProfile(studentId: string) {
  return useApiMutation({
    mutationFn: (input: HealthProfileInput) => http.put<HealthProfile>(`/students/${studentId}/health`, input),
    invalidate: [healthKeys.profile(studentId), ["health", "alerts"]],
    success: "Health profile saved",
    toastError: false,
  });
}

export function useRequestHealthChange(studentId: string) {
  return useApiMutation({
    mutationFn: (changes: Partial<HealthProfileInput>) =>
      http.post(`/students/${studentId}/health/change-requests`, { changes }),
    success: "Sent to the school office for verification",
    toastError: false,
  });
}

export function useIncidents(filters: IncidentFilters, enabled = true) {
  return useQuery({
    queryKey: healthKeys.incidentList(filters),
    queryFn: () => http.get<IncidentDetail[]>("/health/incidents", { ...filters }),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useReportIncident() {
  return useApiMutation({
    mutationFn: (input: IncidentInput) => http.post<IncidentDetail>("/health/incidents", input),
    invalidate: [healthKeys.incidents, ["dashboard"]],
    success: "Incident reported — guardians have been notified",
    toastError: false,
  });
}

export function useCloseIncident() {
  return useApiMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      http.post<IncidentDetail>(`/health/incidents/${id}/close`, { note }),
    invalidate: [healthKeys.incidents, ["dashboard"]],
    success: "Incident closed",
  });
}
