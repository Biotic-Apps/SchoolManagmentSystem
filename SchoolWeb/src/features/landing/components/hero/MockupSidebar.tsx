import { BookOpen, CalendarCheck, GraduationCap, LayoutDashboard, MessageSquare, Wallet } from "lucide-react";
import { cn } from "@/lib/cn";

const ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: GraduationCap, label: "Students" },
  { icon: CalendarCheck, label: "Attendance" },
  { icon: BookOpen, label: "Diary" },
  { icon: Wallet, label: "Fees" },
  { icon: MessageSquare, label: "Messages" },
];

/** Narrow app sidebar for the mockup, hidden on phones so the content stays readable. */
export function MockupSidebar() {
  return (
    <div className="hidden w-[132px] shrink-0 flex-col gap-1 border-r border-border/70 bg-white p-2.5 sm:flex">
      <div className="mb-2 flex items-center gap-2 px-1.5 py-1">
        <span className="grid size-6 place-items-center rounded-md bg-primary text-[11px] font-bold text-white">e</span>
        <span className="text-[13px] font-semibold text-fg">eSchool</span>
      </div>
      {ITEMS.map(({ icon: Icon, label, active }) => (
        <div
          key={label}
          className={cn(
            "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11.5px] font-medium",
            active ? "bg-primary text-white shadow-[0_4px_10px_-4px_rgb(123_104_238/0.6)]" : "text-fg-muted",
          )}
        >
          <Icon className="size-3.5 shrink-0" />
          {label}
        </div>
      ))}
    </div>
  );
}
