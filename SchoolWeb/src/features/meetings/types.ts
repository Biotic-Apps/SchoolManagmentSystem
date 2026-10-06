import type { PersonRef } from "@/features/people/types";

export type MeetingMode = "IN_PERSON" | "PHONE" | "VIDEO";
export type MeetingStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export interface MeetingSlot {
  id: string;
  staffUserId: string;
  staffName?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  mode: MeetingMode;
  location: string | null;
  status: string;
}

export interface SlotInput {
  date: string;
  startTime: string;
  endTime: string;
  mode: MeetingMode;
  location?: string;
}

export interface FollowUp {
  id: string;
  title: string;
  owner?: PersonRef | null;
  dueDate: string;
  status: "OPEN" | "DONE";
  meetingId?: string;
  student?: PersonRef | null;
}

export interface Meeting {
  id: string;
  student: PersonRef;
  guardian: PersonRef;
  staff: { userId: string; name: string };
  date: string;
  startTime: string;
  endTime: string;
  mode: MeetingMode;
  location: string | null;
  agenda: string;
  status: MeetingStatus;
  /** Staff only. */
  notes?: string | null;
  /** Parents see it only when shared. */
  summary: string | null;
  followUps: FollowUp[];
}

export interface ParentBookingInput {
  slotId: string;
  studentId: string;
  agenda: string;
}

export interface StaffMeetingInput {
  guardianId: string;
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
  mode: MeetingMode;
  agenda: string;
}

export interface CompleteMeetingInput {
  notes: string;
  shareSummaryWithParent: boolean;
  summary?: string;
  followUps?: { title: string; ownerUserId: string; dueDate: string }[];
}
