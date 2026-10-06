import { StatusBadge } from "@/components/shared/StatusBadge";
import type { TeacherRegister } from "../types";
import { TodayCard } from "./TodayCard";

type RegisterRow = TeacherRegister & { label: string };

export function TeacherRegistersCard({ registers, href }: { registers: RegisterRow[]; href: string | null }) {
  return (
    <TodayCard title="Attendance registers" href={href} linkLabel="Attendance">
      {registers.length === 0 ? (
        <p className="text-label text-fg-muted">No registers for you today.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {registers.map((register) => (
            <li key={register.sectionId} className="flex items-center justify-between gap-3">
              <span className="truncate text-label text-fg">{register.label}</span>
              <StatusBadge status={register.status} />
            </li>
          ))}
        </ul>
      )}
    </TodayCard>
  );
}
