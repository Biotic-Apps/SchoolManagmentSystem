import {
  BookOpen,
  CalendarCheck,
  CalendarX,
  CircleCheck,
  ClipboardX,
  DoorOpen,
  HeartPulse,
  MessageSquareWarning,
  NotebookPen,
  TimerOff,
  type LucideIcon,
} from "lucide-react";
import type { NavId } from "@/config/navigation";
import type { PendingCounts } from "./types";

export interface PendingDefinition {
  key: keyof PendingCounts;
  label: string;
  icon: LucideIcon;
  link: NavId;
  /** Tone of a non-zero count. */
  tone: "warning" | "error";
}

export const PENDING_TILES: PendingDefinition[] = [
  { key: "unmarkedAttendance", label: "Unmarked registers", icon: ClipboardX, link: "attendance", tone: "warning" },
  { key: "missingDiaries", label: "Missing diaries", icon: NotebookPen, link: "diary", tone: "warning" },
  { key: "pendingApprovals", label: "Pending approvals", icon: CircleCheck, link: "approvals", tone: "warning" },
  { key: "pendingLeave", label: "Leave requests", icon: CalendarCheck, link: "attendance", tone: "warning" },
  { key: "openComplaints", label: "Open complaints", icon: MessageSquareWarning, link: "complaints", tone: "warning" },
  { key: "overdueComplaints", label: "Overdue complaints", icon: TimerOff, link: "complaints", tone: "error" },
  { key: "delayedTopics", label: "Delayed topics", icon: BookOpen, link: "syllabus", tone: "warning" },
  { key: "todayIncidents", label: "Incidents today", icon: HeartPulse, link: "health", tone: "error" },
  { key: "earlyLeavesToday", label: "Early leaves today", icon: DoorOpen, link: "pickup", tone: "warning" },
  { key: "staffAbsentToday", label: "Staff absent", icon: CalendarX, link: "attendance", tone: "warning" },
];
