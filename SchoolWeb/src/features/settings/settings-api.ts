import { useQuery } from "@tanstack/react-query";
import { brandingKeys } from "@/features/branding/api";
import { http, request } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { settingsKeys } from "./keys";
import type { NotificationSettings, PolicySettings, SchoolSettings, SchoolSettingsInput } from "./types";

export function useSchoolSettings(schoolId: string) {
  return useQuery({
    queryKey: settingsKeys.school(schoolId),
    queryFn: async () => (await http.get<SchoolSettings>(`/settings/school/${schoolId}`)).data,
  });
}

export function useSaveSchoolSettings(schoolId: string) {
  return useApiMutation({
    mutationFn: async (input: SchoolSettingsInput) =>
      (await http.patch<SchoolSettings | null>(`/settings/school/${schoolId}`, input)).data,
    invalidate: [settingsKeys.school(schoolId), brandingKeys.all],
    success: "School settings saved",
    toastError: false,
  });
}

export function useNotificationSettings(schoolId: string) {
  return useQuery({
    queryKey: settingsKeys.notifications(schoolId),
    queryFn: async () => (await http.get<NotificationSettings>("/settings/notifications", { schoolId })).data,
  });
}

export function useSaveNotificationSettings(schoolId: string) {
  return useApiMutation({
    mutationFn: async (input: NotificationSettings) =>
      (await request<NotificationSettings | null>("/settings/notifications", { method: "PATCH", body: input, query: { schoolId } }))
        .data,
    invalidate: [settingsKeys.notifications(schoolId)],
    success: "Notification settings saved",
    toastError: false,
  });
}

export function usePolicySettings(schoolId: string) {
  return useQuery({
    queryKey: settingsKeys.policies(schoolId),
    queryFn: async () => (await http.get<PolicySettings>("/settings/policies", { schoolId })).data,
  });
}

export function useSavePolicySettings(schoolId: string) {
  return useApiMutation({
    mutationFn: async (input: PolicySettings) =>
      (await request<PolicySettings | null>("/settings/policies", { method: "PATCH", body: input, query: { schoolId } })).data,
    invalidate: [settingsKeys.policies(schoolId)],
    success: "Policies saved",
    toastError: false,
  });
}
