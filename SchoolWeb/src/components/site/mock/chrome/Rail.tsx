import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  LayoutGrid,
  MessageSquare,
  NotebookPen,
  Settings,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/site/cn";
import { BRAND_PREFIX, BRAND_SUFFIX } from "@/lib/brand";
import type { ScreenVariant } from "../types";

type NavItem = { label: string; icon: LucideIcon; key: string };

/** The school-side menu, as a principal sees it. */
const STAFF_NAV: NavItem[] = [
  { label: "Dashboard", icon: LayoutGrid, key: "dashboard" },
  { label: "Admissions", icon: UserPlus, key: "admissions" },
  { label: "Students", icon: GraduationCap, key: "students" },
  { label: "Attendance", icon: CalendarCheck, key: "attendance" },
  { label: "Timetable", icon: ClipboardList, key: "timetable" },
  { label: "Daily diary", icon: NotebookPen, key: "diary" },
  { label: "Exams & Results", icon: Award, key: "academics" },
  { label: "Fees", icon: Wallet, key: "fees" },
  { label: "Staff & Payroll", icon: Briefcase, key: "staff" },
  { label: "Reports", icon: BarChart3, key: "reports" },
  { label: "Settings", icon: Settings, key: "settings" },
];

/** The parent portal menu — a deliberately shorter list. */
const PARENT_NAV: NavItem[] = [
  { label: "Home", icon: LayoutGrid, key: "parent" },
  { label: "Attendance", icon: CalendarCheck, key: "p-attendance" },
  { label: "Diary", icon: NotebookPen, key: "p-diary" },
  { label: "Homework", icon: BookOpen, key: "p-homework" },
  { label: "Results", icon: Award, key: "p-results" },
  { label: "Fee challans", icon: Wallet, key: "p-fees" },
  { label: "Messages", icon: MessageSquare, key: "p-messages" },
  { label: "Complaints", icon: Users, key: "p-complaints" },
];

const USERS: Record<"staff" | "parent", { initial: string; name: string; role: string }> = {
  staff: { initial: "S", name: "Sana Malik", role: "Principal · Main Campus" },
  parent: { initial: "A", name: "Ayesha Khan", role: "Parent" },
};

export function Rail({ variant }: { variant: ScreenVariant }) {
  const isParent = variant === "parent";
  const nav = isParent ? PARENT_NAV : STAFF_NAV;
  const user = USERS[isParent ? "parent" : "staff"];

  return (
    // The rail is the first thing to go on a narrow frame: it costs a third of
    // the width and carries the least information.
    <aside className="hidden w-[10.5em] shrink-0 flex-col border-r border-slate-200 bg-white @2xl:flex">
      <div className="flex items-center gap-[0.5em] border-b border-slate-200 px-[0.85em] py-[0.75em]">
        <span className="grid size-[1.6em] place-items-center rounded-[0.4em] bg-gradient-to-br from-brand-500 to-brand-700">
          <GraduationCap className="size-[0.95em] text-white" strokeWidth={2.3} />
        </span>
        <span className="text-[0.95em] font-bold tracking-tight text-slate-900">
          <span className="text-brand-600">{BRAND_PREFIX}</span>
          {BRAND_SUFFIX}
        </span>
      </div>

      <nav className="flex-1 space-y-[0.1em] px-[0.5em] py-[0.6em]">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === variant;
          return (
            <div
              key={item.key}
              className={cn(
                "flex items-center gap-[0.55em] rounded-[0.4em] px-[0.55em] py-[0.42em]",
                isActive ? "bg-brand-600 font-semibold text-white" : "text-slate-500",
              )}
            >
              <Icon className="size-[0.95em] shrink-0" strokeWidth={2} />
              <span className="truncate text-[0.86em]">{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 px-[0.75em] py-[0.7em]">
        <div className="flex items-center gap-[0.5em]">
          <span className="grid size-[2.3em] shrink-0 place-items-center rounded-full bg-brand-100 text-[0.7em] font-bold text-brand-700">
            {user.initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[0.78em] font-semibold text-slate-800">{user.name}</p>
            <p className="truncate text-[0.68em] text-slate-400">{user.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
