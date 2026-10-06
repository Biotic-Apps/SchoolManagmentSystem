import type { DiaryEntry } from "@/features/diary/types";
import type { Meeting } from "@/features/meetings/types";
import type { Notice } from "@/features/notices/types";
import type { TeacherSlot } from "@/features/timetable/types";

export interface AttendanceToday {
  present: number;
  absent: number;
  late: number;
  unmarked: number;
}

/** GET /dashboard/summary — counts; later phases add more keys (Phase 3: attendanceToday). */
export interface DashboardSummary {
  schools?: number;
  branches?: number;
  users?: number;
  activeSessions?: number;
  sections?: number;
  pendingApprovals?: number;
  students?: number;
  staff?: number;
  pendingAdmissions?: number;
  pendingChildLinks?: number;
  attendanceToday?: AttendanceToday;
  [key: string]: number | AttendanceToday | undefined;
}

/** GET /dashboard/pending — today's queues for principals / coordinators. */
export interface PendingCounts {
  unmarkedAttendance: number;
  missingDiaries: number;
  pendingApprovals: number;
  pendingLeave: number;
  openComplaints: number;
  overdueComplaints: number;
  delayedTopics: number;
  todayIncidents: number;
  earlyLeavesToday: number;
  staffAbsentToday: number;
}

/** Names are not in the contract; used when the API sends them. */
export interface TeacherRegister {
  sectionId: string;
  status: string;
  className?: string | null;
  sectionName?: string | null;
}

export interface PendingDiary {
  sectionId: string;
  subjectId: string;
  className?: string | null;
  sectionName?: string | null;
  subjectName?: string | null;
}

export interface TeacherToday {
  periods: TeacherSlot[];
  registers: TeacherRegister[];
  diariesPending: PendingDiary[];
  unreadMessages: number;
  assignedComplaints: number;
}

export interface ChildToday {
  attendance: { status: string } | null;
  diary: DiaryEntry[];
  notices: Notice[];
  consentsPending: number;
  nextMeeting: Meeting | null;
}
