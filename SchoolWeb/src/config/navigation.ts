// Shared navigation contract — must stay identical to docs/navigation.md (ids, labels, permissions).
import {
  Award,
  BadgeDollarSign,
  Banknote,
  BookCheck,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ChartColumn,
  CircleCheck,
  CircleUser,
  ClipboardList,
  Clock,
  DoorOpen,
  FileCheck,
  GraduationCap,
  HeartPulse,
  IdCard,
  Layers,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  MessageSquareWarning,
  NotebookPen,
  Package,
  Receipt,
  School,
  Settings,
  ShieldCheck,
  TrendingUp,
  Trophy,
  UserCog,
  Users,
  Wallet,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import type { RoleKey } from "./roles";

export type NavId =
  | "dashboard" | "schools" | "branches" | "users" | "roles" | "sessions" | "classes"
  | "admissions" | "students" | "guardians" | "staff" | "timetable" | "diary" | "homework"
  | "activities" | "notices" | "attendance" | "exams" | "progress" | "fees" | "payroll"
  | "expenses" | "inventory" | "accounts" | "health" | "pickup" | "messages" | "meetings" | "complaints"
  | "certificates" | "approvals" | "reports" | "my_salary" | "settings" | "profile";

export interface NavItem {
  id: NavId;
  label: string;
  permission: string;
  icon: LucideIcon;
  route: string;
}

function item(id: NavId, label: string, permission: string, icon: LucideIcon): NavItem {
  return { id, label, permission, icon, route: `/${id.replace(/_/g, "-")}` };
}

export const NAV_CATALOGUE: readonly NavItem[] = [
  item("dashboard", "Dashboard", "dashboard.view", LayoutDashboard),
  item("schools", "Schools", "schools.view", School),
  item("branches", "Branches", "branches.view", Building2),
  item("users", "Principals & Admin Users", "users.view", UserCog),
  item("roles", "Roles & Permissions", "roles.view", ShieldCheck),
  item("sessions", "Sessions & Calendar", "sessions.view", CalendarDays),
  item("classes", "Classes, Sections & Subjects", "classes.view", Layers),
  item("admissions", "Admissions", "admissions.view", ClipboardList),
  item("students", "Students", "students.view", GraduationCap),
  item("guardians", "Parents & Guardians", "guardians.view", Users),
  item("staff", "Teachers & Helpers", "staff.view", IdCard),
  item("timetable", "Timetable", "timetable.view", Clock),
  item("diary", "Daily Diary & Homework", "diary.view", NotebookPen),
  item("homework", "Homework Submissions", "homework.view", BookCheck),
  item("activities", "Activities & Events", "activities.view", Trophy),
  item("notices", "Notices", "notices.view", Megaphone),
  item("attendance", "Attendance & Leave", "attendance.view", CalendarCheck),
  item("exams", "Exams & Results", "exams.view", FileCheck),
  item("progress", "Student Progress", "progress.view", TrendingUp),
  item("fees", "Fees & Dues", "fees.view", Wallet),
  item("payroll", "Salary & Payroll", "payroll.view", Banknote),
  item("expenses", "Expenses & Vendors", "expenses.view", Receipt),
  item("inventory", "Inventory & Purchasing", "inventory.view", Package),
  item("accounts", "Accounts", "expenses.view", BadgeDollarSign),
  item("health", "Health & Safety", "health.view", HeartPulse),
  item("pickup", "Pickup & Departure", "pickup.view", DoorOpen),
  item("messages", "Messages", "messages.view", MessageSquare),
  item("meetings", "Meetings & Appointments", "meetings.view", CalendarClock),
  item("complaints", "Complaints", "complaints.view", MessageSquareWarning),
  item("certificates", "Certificates", "certificates.view", Award),
  item("approvals", "Approvals", "approvals.view", CircleCheck),
  item("reports", "Reports & History", "reports.view", ChartColumn),
  item("my_salary", "My Attendance, Leave & Salary", "self.payroll.view", WalletCards),
  item("settings", "Settings & Backups", "settings.view", Settings),
  item("profile", "Profile & Security", "profile.view", CircleUser),
];

const NAV_BY_ID = new Map(NAV_CATALOGUE.map((entry) => [entry.id, entry]));

export function navItem(id: NavId): NavItem {
  return NAV_BY_ID.get(id)!;
}

export function findNavByRoute(segment: string): NavItem | undefined {
  return NAV_CATALOGUE.find((entry) => entry.route === `/${segment}`);
}

const SUPERVISOR_MENU: readonly NavId[] = [
  "dashboard", "classes", "students", "staff", "timetable", "attendance", "diary", "homework",
  "activities", "exams", "progress", "health", "pickup", "messages", "meetings", "complaints",
  "approvals", "my_salary", "profile",
];

export const ROLE_MENUS: Record<RoleKey, readonly NavId[]> = {
  SUPER_ADMIN: [
    "dashboard", "schools", "branches", "users", "roles", "sessions", "classes", "students",
    "admissions", "guardians", "staff", "timetable", "diary", "homework", "activities", "notices",
    "attendance", "exams", "fees", "payroll", "expenses", "inventory", "accounts", "health", "pickup",
    "complaints", "certificates", "approvals", "reports", "settings", "profile",
  ],
  PRINCIPAL: [
    "dashboard", "branches", "classes", "students", "admissions", "guardians", "staff", "timetable",
    "attendance", "diary", "homework", "activities", "notices", "exams", "fees", "payroll",
    "expenses", "inventory", "accounts", "health", "pickup", "messages", "meetings", "complaints",
    "certificates", "approvals", "reports", "settings", "profile",
  ],
  // Owner decision 2026-10-09: coordinators manage branch payroll too.
  COORDINATOR: [...SUPERVISOR_MENU.slice(0, -2), "payroll", "my_salary", "profile"],
  HEAD_TEACHER: SUPERVISOR_MENU,
  TEACHER: [
    "dashboard", "classes", "timetable", "attendance", "diary", "homework", "activities", "exams",
    "progress", "messages", "meetings", "complaints", "my_salary", "profile",
  ],
  HELPER: ["dashboard", "classes", "attendance", "diary", "activities", "complaints", "my_salary", "profile"],
  ACCOUNTANT: [
    "dashboard", "students", "fees", "payroll", "expenses", "inventory", "accounts", "complaints", "reports",
    "my_salary", "profile",
  ],
  PARENT: [
    "dashboard", "students", "diary", "homework", "attendance", "progress", "timetable", "fees",
    "certificates", "messages", "meetings", "complaints", "profile",
  ],
};

const LABEL_OVERRIDES: Partial<Record<RoleKey, Partial<Record<NavId, string>>>> = {
  PRINCIPAL: { branches: "Branch & Calendar", settings: "Settings" },
  TEACHER: { classes: "My Classes & Students" },
  PARENT: {
    dashboard: "Home",
    students: "Child Profile",
    homework: "Homework",
    progress: "Progress & Results",
    timetable: "Timetable, Calendar & Activities",
    fees: "Fees, Dues & Receipts",
    messages: "Messages, Notices & Requests",
  },
};

export function labelFor(role: string | null | undefined, id: NavId): string {
  const overrides = role ? LABEL_OVERRIDES[role as RoleKey] : undefined;
  return overrides?.[id] ?? navItem(id).label;
}
