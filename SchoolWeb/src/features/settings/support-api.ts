import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import { settingsKeys } from "./keys";
import { normaliseList } from "./list-response";
import type { FailedNotification, JobRun, SystemHealth } from "./support-types";
import type { TestMessageResult, TestMessageValues } from "./test-message-schema";

const supportKeys = ["settings", "support"] as const;

export function useSystemHealth(enabled: boolean) {
  return useQuery({
    queryKey: settingsKeys.health,
    queryFn: async () => (await http.get<SystemHealth>("/support/health")).data,
    enabled,
  });
}

export function useFailedNotifications(params: Query) {
  return useQuery({
    queryKey: settingsKeys.failedNotifications(params),
    queryFn: async () => normaliseList(await http.get<FailedNotification[]>("/support/notifications/failed", params)),
    placeholderData: keepPreviousData,
  });
}

export function useResendNotification() {
  return useApiMutation({
    mutationFn: async (id: string) => (await http.post(`/support/notifications/failed/${id}/resend`)).data,
    invalidate: [supportKeys],
    success: "Notification queued to resend",
  });
}

export function useResendAllNotifications() {
  return useApiMutation({
    mutationFn: async (body: Query) => (await http.post("/support/notifications/failed/resend-all", body)).data,
    invalidate: [supportKeys],
    success: "Failed notifications queued to resend",
  });
}

export function useSupportJobs(params: Query) {
  return useQuery({
    queryKey: settingsKeys.jobs(params),
    queryFn: async () => normaliseList(await http.get<JobRun[]>("/support/jobs", params)),
    placeholderData: keepPreviousData,
  });
}

export function useRetryJob() {
  return useApiMutation({
    mutationFn: async (id: string) => (await http.post(`/support/jobs/${id}/retry`)).data,
    invalidate: [supportKeys],
    success: "Job queued to retry",
  });
}

/** One synchronous message through the configured email/SMS provider (super admin). */
export function sendTestMessage(body: TestMessageValues) {
  return http.post<TestMessageResult>("/support/test-message", body);
}
