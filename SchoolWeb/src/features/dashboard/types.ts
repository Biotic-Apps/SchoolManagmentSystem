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

export interface ParentHomeChild {
  id: string;
  name: string;
  photoUrl: string | null;
  admissionNo: string;
  className: string | null;
  sectionName: string | null;
  rollNo: number | null;
  branchName: string | null;
  branchPhone: string | null;
  classTeacher: { name: string; userId: string | null } | null;
}

export interface MonthAttendance {
  month: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
  halfDay: number;
  percent: number | null;
}

export interface ParentHomeFees {
  totalDueMinor: number;
  overdueMinor: number;
  currency: string;
  nextDue: { invoiceId: string; invoiceNo: string; dueDate: string; balanceMinor: number } | null;
  lastPayment: { amountMinor: number; paidOn: string; receiptNo?: string } | null;
  onlineGatewayEnabled: boolean;
  proofUploadEnabled: boolean;
}

export interface LatestResult {
  examId: string;
  examName: string;
  percent: number;
  grade: string;
  position: number | null;
  passed: boolean;
  publishedAt: string | null;
}

export interface ParentHomeEvent {
  id: string;
  kind: "ACTIVITY" | "EVENT" | "HOLIDAY" | "VACATION" | "DEADLINE";
  title: string;
  startDate: string;
  endDate: string | null;
}

export type ParentPeriod = TeacherSlot & { staff?: { id: string; name: string } };

/** GET /parent/home?studentId= — the parent dashboard of one verified child. */
export interface ParentHome {
  child: ParentHomeChild;
  attendance: { today: string; month: MonthAttendance };
  fees: ParentHomeFees | null;
  latestResult: LatestResult | null;
  homework: { dueCount: number; nextDueDate: string | null };
  todayPeriods: ParentPeriod[];
  diary: DiaryEntry[];
  notices: Notice[];
  meetings: Meeting[];
  events: ParentHomeEvent[];
  consentsPending: number;
}
