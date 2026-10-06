import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type {
  DecideEarlyLeave,
  Departure,
  DepartureInput,
  EarlyLeave,
  EarlyLeaveFilters,
  EarlyLeaveInput,
  PickupPerson,
  PickupPersonInput,
} from "./types";

export const pickupKeys = {
  all: ["pickup"] as const,
  persons: (studentId: string) => ["pickup", "persons", studentId] as const,
  earlyLeave: ["pickup", "early-leave"] as const,
  earlyLeaveList: (filters: EarlyLeaveFilters) => ["pickup", "early-leave", filters] as const,
  departures: ["pickup", "departures"] as const,
  departureList: (branchId: string | null, date: string) => ["pickup", "departures", branchId, date] as const,
};

export function usePickupPersons(studentId: string | null) {
  return useQuery({
    queryKey: pickupKeys.persons(studentId ?? ""),
    queryFn: async () => (await http.get<PickupPerson[]>(`/students/${studentId}/pickup-persons`)).data,
    enabled: !!studentId,
  });
}

export function useAddPickupPerson(studentId: string) {
  return useApiMutation({
    mutationFn: (input: PickupPersonInput) => http.post<PickupPerson>(`/students/${studentId}/pickup-persons`, input),
    invalidate: [pickupKeys.persons(studentId)],
    success: "Pending verification by the school",
    toastError: false,
  });
}

export function usePickupPersonAction() {
  return useApiMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: "verify" | "revoke"; reason?: string }) =>
      http.post<PickupPerson>(`/pickup-persons/${id}/${action}`, reason ? { reason } : undefined),
    invalidate: [["pickup", "persons"]],
    success: (_, vars) => (vars.action === "verify" ? "Pickup person verified" : "Pickup authorization revoked"),
  });
}

export function useEarlyLeaves(filters: EarlyLeaveFilters, enabled = true) {
  return useQuery({
    queryKey: pickupKeys.earlyLeaveList(filters),
    queryFn: async () => (await http.get<EarlyLeave[]>("/early-leave", { ...filters })).data,
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useCreateEarlyLeave() {
  return useApiMutation({
    mutationFn: (input: EarlyLeaveInput) => http.post<EarlyLeave>("/early-leave", input),
    invalidate: [pickupKeys.earlyLeave, ["dashboard"]],
    success: "Early leave requested",
    toastError: false,
  });
}

export function useDecideEarlyLeave() {
  return useApiMutation({
    mutationFn: ({ id, action, reason }: DecideEarlyLeave) =>
      http.post<EarlyLeave>(`/early-leave/${id}/${action}`, reason ? { reason } : undefined),
    invalidate: [pickupKeys.earlyLeave, ["dashboard"]],
    success: (_, vars) => (vars.action === "approve" ? "Early leave approved" : "Early leave rejected"),
  });
}

export function useDepartures(branchId: string | null, date: string) {
  return useQuery({
    queryKey: pickupKeys.departureList(branchId, date),
    queryFn: async () => (await http.get<Departure[]>("/departures", { branchId, date })).data,
    placeholderData: keepPreviousData,
    enabled: !!branchId,
  });
}

export function useRecordDeparture() {
  return useApiMutation({
    mutationFn: (input: DepartureInput) => http.post<Departure>("/departures", input),
    invalidate: [pickupKeys.departures, pickupKeys.earlyLeave],
    success: "Departure recorded — guardians notified",
    toastError: false,
  });
}
