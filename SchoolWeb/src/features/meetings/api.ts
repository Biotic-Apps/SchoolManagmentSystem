import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { http, type Query } from "@/lib/http";
import { useApiMutation } from "@/lib/use-api-mutation";
import type {
  CompleteMeetingInput,
  FollowUp,
  Meeting,
  MeetingSlot,
  ParentBookingInput,
  SlotInput,
  StaffMeetingInput,
} from "./types";

export const meetingKeys = {
  all: ["meetings"] as const,
  list: (params: Query) => ["meetings", "list", params] as const,
  slots: (params: Query) => ["meetings", "slots", params] as const,
  followUps: (params: Query) => ["meetings", "follow-ups", params] as const,
};

const INVALIDATE = [meetingKeys.all, ["dashboard"]];

export type MeetingBox = "upcoming" | "past";

export function useMeetings(params: Query, enabled = true) {
  return useQuery({
    queryKey: meetingKeys.list(params),
    queryFn: () => http.get<Meeting[]>("/meetings", params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** The API nests the owner as `staff: { userId, name }`; screens use the flat fields. */
type ApiSlot = MeetingSlot & { staff?: { userId: string; name: string } | null };

function toSlot(slot: ApiSlot): MeetingSlot {
  return { ...slot, staffUserId: slot.staffUserId ?? slot.staff?.userId ?? "", staffName: slot.staffName ?? slot.staff?.name ?? null };
}

export function useSlots(params: Query, enabled = true) {
  return useQuery({
    queryKey: meetingKeys.slots(params),
    queryFn: async () => (await http.get<ApiSlot[]>("/meetings/slots", params)).data.map(toSlot),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useCreateSlots() {
  return useApiMutation({
    mutationFn: (slots: SlotInput[]) => http.post<MeetingSlot[]>("/meetings/slots", { slots }),
    invalidate: [meetingKeys.all],
    success: (_, slots) => (slots.length === 1 ? "Slot added" : `${slots.length} slots added`),
    toastError: false,
  });
}

export function useDeleteSlot() {
  return useApiMutation({
    mutationFn: (id: string) => http.delete(`/meetings/slots/${id}`),
    invalidate: [meetingKeys.all],
    success: "Slot removed",
  });
}

export function useBookMeeting() {
  return useApiMutation({
    mutationFn: async (input: ParentBookingInput) => (await http.post<Meeting>("/meetings", input)).data,
    invalidate: INVALIDATE,
    success: "Meeting booked",
    toastError: false,
  });
}

export function useRequestMeeting() {
  return useApiMutation({
    mutationFn: async (input: StaffMeetingInput) => (await http.post<Meeting>("/meetings", input)).data,
    invalidate: INVALIDATE,
    success: "Meeting scheduled",
    toastError: false,
  });
}

export function useCancelMeeting() {
  return useApiMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      http.post<Meeting>(`/meetings/${id}/cancel`, reason ? { reason } : {}),
    invalidate: INVALIDATE,
    success: "Meeting cancelled",
    toastError: false,
  });
}

export function useMarkNoShow() {
  return useApiMutation({
    mutationFn: (id: string) => http.post<Meeting>(`/meetings/${id}/no-show`, {}),
    invalidate: INVALIDATE,
    success: "Marked as no-show",
  });
}

export function useCompleteMeeting(id: string) {
  return useApiMutation({
    mutationFn: (input: CompleteMeetingInput) => http.post<Meeting>(`/meetings/${id}/complete`, input),
    invalidate: INVALIDATE,
    success: "Meeting completed",
    toastError: false,
  });
}

export function useFollowUps(params: Query) {
  return useQuery({
    queryKey: meetingKeys.followUps(params),
    queryFn: async () => (await http.get<FollowUp[]>("/follow-ups", params)).data,
  });
}

export function useMarkFollowUpDone() {
  return useApiMutation({
    mutationFn: (id: string) => http.post<FollowUp>(`/follow-ups/${id}/done`, {}),
    invalidate: [meetingKeys.all],
    success: "Follow-up done",
  });
}
