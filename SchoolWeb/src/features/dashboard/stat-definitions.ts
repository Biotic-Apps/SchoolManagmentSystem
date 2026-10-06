import {
  Building2,
  CalendarDays,
  CircleCheck,
  ClipboardList,
  GraduationCap,
  IdCard,
  Layers,
  Link2,
  School,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import type { NavId } from "@/config/navigation";
import type { DashboardSummary } from "./types";

export interface StatDefinition {
  key: keyof DashboardSummary & string;
  label: string;
  icon: LucideIcon;
  permission: string;
  link: NavId;
}

export const DASHBOARD_STATS: StatDefinition[] = [
  { key: "schools", label: "Schools", icon: School, permission: "schools.view", link: "schools" },
  { key: "branches", label: "Branches", icon: Building2, permission: "branches.view", link: "branches" },
  { key: "users", label: "Admin users", icon: UserCog, permission: "users.view", link: "users" },
  { key: "activeSessions", label: "Active sessions", icon: CalendarDays, permission: "sessions.view", link: "sessions" },
  { key: "sections", label: "Sections", icon: Layers, permission: "classes.view", link: "classes" },
  { key: "students", label: "Students", icon: GraduationCap, permission: "students.view", link: "students" },
  { key: "staff", label: "Teachers & helpers", icon: IdCard, permission: "staff.view", link: "staff" },
  { key: "pendingAdmissions", label: "Pending admissions", icon: ClipboardList, permission: "admissions.view", link: "admissions" },
  { key: "pendingChildLinks", label: "Child link requests", icon: Link2, permission: "guardians.view", link: "guardians" },
  { key: "pendingApprovals", label: "Pending approvals", icon: CircleCheck, permission: "approvals.view", link: "approvals" },
];
