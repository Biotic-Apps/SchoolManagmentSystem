import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import type { AttendanceToday } from "../types";
import { TodayCard } from "./TodayCard";

const ITEMS: { key: keyof AttendanceToday; label: string; className: string }[] = [
  { key: "present", label: "Present", className: "bg-success-soft text-success" },
  { key: "absent", label: "Absent", className: "bg-error-soft text-error" },
  { key: "late", label: "Late", className: "bg-warning-soft text-warning" },
  { key: "unmarked", label: "Unmarked", className: "bg-background text-fg-muted" },
];

export function AttendanceTodayCard({ counts, linked }: { counts: AttendanceToday; linked: boolean }) {
  return (
    <TodayCard title="Attendance today" href={linked ? "/attendance" : null}>
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {ITEMS.map((item) => (
          <div key={item.key} className={cn("flex flex-col gap-0.5 rounded-input px-4 py-3", item.className)}>
            <dt className="text-caption">{item.label}</dt>
            <dd className="text-card-title font-semibold tabular-nums">{formatNumber(counts[item.key])}</dd>
          </div>
        ))}
      </dl>
    </TodayCard>
  );
}
