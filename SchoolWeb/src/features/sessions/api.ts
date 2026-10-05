import { useQuery } from "@tanstack/react-query";
import type { Option } from "@/components/shared/OptionSelect";
import { OPTIONS_PAGE } from "@/config/options";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type {
  AcademicSession,
  AcademicSessionInput,
  CalendarEvent,
  CalendarEventInput,
  Term,
  TermInput,
} from "./types";

export const sessionKeys = {
  all: ["sessions"] as const,
  list: (branchId: string | null) => ["sessions", "list", branchId] as const,
  terms: (sessionId: string) => ["sessions", "terms", sessionId] as const,
  calendar: ["calendar"] as const,
  calendarRange: (branchId: string | null, from: string, to: string) => ["calendar", branchId, from, to] as const,
};

export function useAcademicSessions(branchId: string | null) {
  return useQuery({
    queryKey: sessionKeys.list(branchId),
    queryFn: () => http.get<AcademicSession[]>("/sessions", { branchId, ...OPTIONS_PAGE }),
    enabled: !!branchId,
  });
}

/** Session options for a branch; the ACTIVE one (if any) is suggested as default. */
export function useSessionOptions(branchId: string | null) {
  const query = useAcademicSessions(branchId);
  const sessions = query.data?.data ?? [];
  const options: Option[] = sessions.map((session) => ({
    id: session.id,
    name: session.status === "ACTIVE" ? `${session.name} (active)` : session.name,
  }));
  const activeId = sessions.find((session) => session.status === "ACTIVE")?.id ?? sessions[0]?.id ?? null;
  return { sessions, options, activeId, isLoading: query.isLoading };
}

export function useSaveAcademicSession() {
  return useApiMutation({
    mutationFn: ({ id, input }: { id?: string; input: AcademicSessionInput }) =>
      id ? http.patch<AcademicSession>(`/sessions/${id}`, input) : http.post<AcademicSession>("/sessions", input),
    invalidate: [sessionKeys.all],
    success: (_, vars) => (vars.id ? "Session updated" : "Session created as draft"),
    toastError: false,
  });
}

export function useSessionTransition() {
  return useApiMutation({
    mutationFn: ({ id, action }: { id: string; action: "activate" | "close" }) => http.post(`/sessions/${id}/${action}`),
    invalidate: [sessionKeys.all],
    success: (_, vars) => (vars.action === "activate" ? "Session activated" : "Session closed"),
  });
}

export function useTerms(sessionId: string | null) {
  return useQuery({
    queryKey: sessionKeys.terms(sessionId ?? ""),
    queryFn: async () => (await http.get<Term[]>(`/sessions/${sessionId}/terms`)).data,
    enabled: !!sessionId,
  });
}

export function useSaveTerm(sessionId: string) {
  return useApiMutation({
    mutationFn: ({ id, input }: { id?: string; input: TermInput }) =>
      id ? http.patch<Term>(`/terms/${id}`, input) : http.post<Term>(`/sessions/${sessionId}/terms`, input),
    invalidate: [sessionKeys.terms(sessionId), sessionKeys.all],
    success: (_, vars) => (vars.id ? "Term updated" : "Term added"),
    toastError: false,
  });
}

export function useDeleteTerm(sessionId: string) {
  return useApiMutation({
    mutationFn: (id: string) => http.delete(`/terms/${id}`),
    invalidate: [sessionKeys.terms(sessionId), sessionKeys.all],
    success: "Term removed",
  });
}

export function useCalendarEvents(branchId: string | null, from: string, to: string) {
  return useQuery({
    queryKey: sessionKeys.calendarRange(branchId, from, to),
    queryFn: async () => (await http.get<CalendarEvent[]>("/calendar", { branchId, from, to })).data,
    enabled: !!branchId,
  });
}

export function useSaveCalendarEvent() {
  return useApiMutation({
    mutationFn: ({ id, input }: { id?: string; input: CalendarEventInput }) =>
      id ? http.patch<CalendarEvent>(`/calendar/${id}`, input) : http.post<CalendarEvent>("/calendar", input),
    invalidate: [sessionKeys.calendar],
    success: (_, vars) => (vars.id ? "Event updated" : "Event added"),
    toastError: false,
  });
}

export function useDeleteCalendarEvent() {
  return useApiMutation({
    mutationFn: (id: string) => http.delete(`/calendar/${id}`),
    invalidate: [sessionKeys.calendar],
    success: "Event deleted",
  });
}
