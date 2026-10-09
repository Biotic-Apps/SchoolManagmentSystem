import type { PersonRef } from "@/features/people/types";

export type MeetingMode = "IN_PERSON" | "PHONE" | "VIDEO";
/** REQUESTED: a parent suggested a time; the teacher accepts (SCHEDULED) or declines (CANCELLED). */
export type MeetingStatus = "REQUESTED" | "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

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

/** One of the child's teachers (or the principal) a parent can meet. */
export interface MeetingTeacher {
  userId: string;
  name: string;
  /** e.g. "Class teacher", "Mathematics", "Principal". */
  roles: string[];
  openSlots: number;
}

/** Parent suggests a time when no open slot suits them (end defaults to +30 min). */
export interface ParentRequestInput {
  studentId: string;
  staffUserId: string;
  date: string;
  startTime: string;
  mode: MeetingMode;
  agenda: string;
}

/** Staff confirm a request; omitted fields keep the parent's suggestion. */
export interface AcceptMeetingInput {
  date: string;
  startTime: string;
  endTime: string;
  mode: MeetingMode;
  location?: string;
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
