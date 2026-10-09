import { CalendarCheck } from "lucide-react";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { cn } from "@/lib/cn";
import type { AttendanceToday } from "../types";
import { TodayCard } from "./TodayCard";

const ITEMS: { key: keyof AttendanceToday; label: string; dot: string; bar: string }[] = [
  { key: "present", label: "Present", dot: "bg-success", bar: "bg-success" },
  { key: "absent", label: "Absent", dot: "bg-error", bar: "bg-error" },
  { key: "late", label: "Late", dot: "bg-[#c98a12]", bar: "bg-[#e0a43a]" },
  { key: "unmarked", label: "Unmarked", dot: "bg-border-strong", bar: "bg-border" },
];

export function AttendanceTodayCard({ counts, linked }: { counts: AttendanceToday; linked: boolean }) {
  const total = ITEMS.reduce((sum, item) => sum + counts[item.key], 0);

  return (
    <TodayCard title="Attendance today" icon={CalendarCheck} href={linked ? "/attendance" : null}>
      <div className="flex flex-col gap-4">
        {total > 0 && (
          <div aria-hidden className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-background">
            {ITEMS.map((item) =>
              counts[item.key] ? (
                <span
                  key={item.key}
                  className={cn("h-full origin-left animate-fade-in", item.bar)}
                  style={{ width: `${(counts[item.key] / total) * 100}%` }}
                />
              ) : null,
            )}
          </div>
        )}
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {ITEMS.map((item) => (
            <div key={item.key} className="flex flex-col gap-1 rounded-tile border border-border px-4 py-3">
              <dt className="flex items-center gap-2 text-caption text-fg-muted">
                <span aria-hidden className={cn("size-2 rounded-full", item.dot)} />
                {item.label}
              </dt>
              <dd className="text-[22px] font-semibold leading-7 tabular-nums text-fg">
                <AnimatedNumber value={counts[item.key]} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </TodayCard>
  );
}
