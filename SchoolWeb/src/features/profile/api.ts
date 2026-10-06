import { useQuery } from "@tanstack/react-query";
import type { DeviceSession, SessionUser } from "@/features/auth/types";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type { NotificationPreference, ProfileInput } from "./types";

export const profileKeys = {
  devices: ["auth", "sessions"] as const,
  preferences: ["notifications", "preferences"] as const,
};

export async function updateMe(input: ProfileInput): Promise<SessionUser> {
  return (await http.patch<SessionUser>("/me", input)).data;
}

export function useDeviceSessions() {
  return useQuery({
    queryKey: profileKeys.devices,
    queryFn: async () => (await http.get<DeviceSession[]>("/auth/sessions")).data,
  });
}

export function useRevokeDeviceSession() {
  return useApiMutation({
    mutationFn: (id: string) => http.delete(`/auth/sessions/${id}`),
    invalidate: [profileKeys.devices],
    success: "Device signed out",
  });
}

export function useLogoutAll() {
  return useApiMutation({
    mutationFn: () => http.post("/auth/logout-all"),
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: profileKeys.preferences,
    queryFn: async () => (await http.get<NotificationPreference[]>("/notifications/preferences")).data,
  });
}

export function useSaveNotificationPreferences() {
  return useApiMutation({
    mutationFn: (preferences: NotificationPreference[]) =>
      http.put<NotificationPreference[]>("/notifications/preferences", preferences),
    invalidate: [profileKeys.preferences],
    success: "Notification preferences saved",
  });
}
