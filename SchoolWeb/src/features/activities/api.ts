import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { withRowFlash } from "@/lib/row-highlight";
import { useApiMutation } from "@/lib/use-api-mutation";
import type {
  Activity,
  ActivityInput,
  ConsentList,
  ConsentStatus,
  MyActivity,
  Participant,
} from "./types";

export const activityKeys = {
  all: ["activities"] as const,
  list: (params: Query) => ["activities", "list", params] as const,
  detail: (id: string) => ["activities", "detail", id] as const,
  consents: (id: string) => ["activities", "consents", id] as const,
  participants: (id: string) => ["activities", "participants", id] as const,
  mine: (studentId: string) => ["activities", "mine", studentId] as const,
};

export function useActivities(params: Query, enabled = true) {
  return useQuery({
    queryKey: activityKeys.list(params),
    queryFn: async () => (await http.get<Activity[]>("/activities", { pageSize: 100, ...params })).data,
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useActivity(id: string | null) {
  return useQuery({
    queryKey: activityKeys.detail(id ?? ""),
    queryFn: async () => (await http.get<Activity>(`/activities/${id}`)).data,
    enabled: !!id,
  });
}

export function useSaveActivity() {
  return useApiMutation({
    mutationFn: withRowFlash(
      async ({ id, input }: { id?: string; input: ActivityInput }) =>
        (id ? await http.patch<Activity>(`/activities/${id}`, input) : await http.post<Activity>("/activities", input)).data,
      (row, vars) => vars.id ?? row.id,
    ),
    invalidate: [activityKeys.all],
    success: (_, vars) => (vars.id ? "Activity updated" : "Activity proposed"),
    toastError: false,
  });
}

export function useDecideActivity() {
  return useApiMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: "approve" | "reject"; reason?: string }) =>
      http.post<Activity>(`/activities/${id}/${action}`, reason ? { reason } : {}),
    invalidate: [activityKeys.all, ["approvals"]],
    success: (_, vars) => (vars.action === "approve" ? "Activity approved and announced" : "Activity rejected"),
  });
}

export type ActivityStatusChange = "ONGOING" | "COMPLETED" | "CANCELLED";

export function useChangeActivityStatus() {
  return useApiMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: ActivityStatusChange; reason?: string }) =>
      http.post<Activity>(`/activities/${id}/status`, { status, reason }),
    invalidate: [activityKeys.all],
    success: "Activity status updated",
  });
}

export function useActivityConsents(id: string | null, enabled = true) {
  return useQuery({
    queryKey: activityKeys.consents(id ?? ""),
    queryFn: async () => (await http.get<ConsentList>(`/activities/${id}/consents`)).data,
    enabled: enabled && !!id,
  });
}

export function useParticipants(id: string | null) {
  return useQuery({
    queryKey: activityKeys.participants(id ?? ""),
    queryFn: async () => (await http.get<Participant[]>(`/activities/${id}/participants`)).data,
    enabled: !!id,
  });
}

export type ParticipantInput = Omit<Participant, "name">;

/** 409 when a student without GRANTED consent is included. */
export function useSaveParticipants(id: string) {
  return useApiMutation({
    mutationFn: (participants: ParticipantInput[]) => http.put(`/activities/${id}/participants`, { participants }),
    invalidate: [activityKeys.participants(id)],
    success: "Participants saved",
  });
}

/** GET /activities/mine answers { upcoming, consentPending }; the screen wants one list. */
interface MyActivitiesResponse {
  upcoming: MyActivity[];
  consentPending: MyActivity[];
}

function mergeMine(data: MyActivitiesResponse | MyActivity[]): MyActivity[] {
  if (Array.isArray(data)) return data;
  const byId = new Map<string, MyActivity>();
  for (const item of [...(data.consentPending ?? []), ...(data.upcoming ?? [])]) byId.set(item.id, item);
  return [...byId.values()];
}

export function useMyActivities(studentId: string | null) {
  return useQuery({
    queryKey: activityKeys.mine(studentId ?? ""),
    queryFn: async () => mergeMine((await http.get<MyActivitiesResponse>("/activities/mine", { studentId })).data),
    enabled: !!studentId,
  });
}

export function useRespondConsent() {
  return useApiMutation({
    mutationFn: ({ id, ...body }: { id: string; studentId: string; decision: Exclude<ConsentStatus, "PENDING">; note?: string }) =>
      http.post(`/activities/${id}/consents`, body),
    invalidate: [activityKeys.all, ["dashboard"]],
    success: (_, vars) => (vars.decision === "GRANTED" ? "Consent given" : "Consent declined"),
  });
}
