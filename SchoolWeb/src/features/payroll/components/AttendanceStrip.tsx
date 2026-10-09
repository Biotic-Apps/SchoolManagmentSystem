import { cn } from "@/lib/cn";
import { hoursText } from "../options";
import type { AttendanceSummary, OvertimeSummary } from "../types";

interface Cell {
  label: string;
  value: string;
  tone?: "warning" | "error" | "success";
}

const TONE = { warning: "text-warning", error: "text-error", success: "text-success" };

/** The month's day counts that drive attendance deductions and overtime. */
export function AttendanceStrip({ attendance, overtime }: { attendance: AttendanceSummary; overtime: OvertimeSummary | null }) {
  const cells: Cell[] = [
    { label: "Working days", value: String(attendance.payDays) },
    { label: "Present", value: String(attendance.present) },
    { label: "Late", value: String(attendance.late), tone: attendance.late ? "warning" : undefined },
    { label: "Absent", value: String(attendance.absent + attendance.halfDays / 2), tone: attendance.absent || attendance.halfDays ? "error" : undefined },
    { label: "Paid leave", value: String(attendance.paidLeave) },
    { label: "Unpaid leave", value: String(attendance.unpaidLeave), tone: attendance.unpaidLeave ? "error" : undefined },
    { label: "Overtime", value: overtime && overtime.minutes ? hoursText(overtime.minutes) : "0 h", tone: overtime?.minutes ? "success" : undefined },
  ];
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-label font-semibold text-fg">Attendance this month</h3>
      <dl className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {cells.map((cell) => (
          <div key={cell.label} className="flex flex-col gap-0.5 rounded-lg border border-border px-3 py-2">
            <dt className="text-caption text-fg-muted">{cell.label}</dt>
            <dd className={cn("text-body font-semibold text-fg", cell.tone && TONE[cell.tone])}>{cell.value}</dd>
          </div>
        ))}
      </dl>
      {overtime && overtime.pendingMinutes > 0 && (
        <p className="text-caption text-fg-muted">
          {hoursText(overtime.pendingMinutes)} more overtime is waiting for approval and is not paid yet.
        </p>
      )}
      {attendance.unmarked > 0 && (
        <p className="text-caption text-fg-muted">
          {attendance.unmarked} {attendance.unmarked === 1 ? "day has" : "days have"} no attendance mark; unmarked days are not deducted.
        </p>
      )}
    </section>
  );
}
