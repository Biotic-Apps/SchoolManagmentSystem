import {
  Award,
  BookOpen,
  Bus,
  CalendarClock,
  CalendarCheck,
  ClipboardList,
  FileText,
  HandCoins,
  HeartPulse,
  MessageCircle,
  MessageSquareWarning,
  Package,
  PenLine,
  Receipt,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

const MODULES: { icon: LucideIcon; label: string }[] = [
  { icon: UserPlus, label: "Admissions" },
  { icon: CalendarCheck, label: "Attendance" },
  { icon: BookOpen, label: "Diary" },
  { icon: PenLine, label: "Homework" },
  { icon: CalendarClock, label: "Timetable" },
  { icon: ClipboardList, label: "Exams" },
  { icon: FileText, label: "Report cards" },
  { icon: Wallet, label: "Fees" },
  { icon: HandCoins, label: "Payroll" },
  { icon: Receipt, label: "Expenses" },
  { icon: Package, label: "Inventory" },
  { icon: Award, label: "Certificates" },
  { icon: HeartPulse, label: "Health" },
  { icon: Bus, label: "Pickup" },
  { icon: Users, label: "Meetings" },
  { icon: MessageSquareWarning, label: "Complaints" },
  { icon: MessageCircle, label: "Messaging" },
];

function ModuleRow({ hidden }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 gap-3 pr-3">
      {MODULES.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white py-2 pl-2 pr-4 text-label font-medium text-fg shadow-xs ring-1 ring-border"
        >
          <span className="grid size-7 place-items-center rounded-full bg-selected text-primary">
            <Icon aria-hidden className="size-3.5" />
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}

/** Endless, edge-faded scroll of module chips. The row renders twice so the -50% loop is seamless. */
export function ModuleMarquee({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]",
        className,
      )}
    >
      <p className="sr-only">Modules include {MODULES.map((m) => m.label).join(", ")}.</p>
      <div className="animate-marquee flex w-max py-1 hover:[animation-play-state:paused]">
        <ModuleRow hidden />
        <ModuleRow hidden />
      </div>
    </div>
  );
}
