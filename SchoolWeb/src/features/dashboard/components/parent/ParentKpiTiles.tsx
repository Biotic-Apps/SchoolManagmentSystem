import { CalendarCheck, NotebookPen, Trophy, Wallet } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/format";
import type { ParentHome } from "../../types";
import type { ParentLinks } from "../../use-parent-home";
import { ChallanButton } from "./ChallanButton";
import { KpiTile } from "./KpiTile";

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
};

function AttendanceTile({ data, href }: { data: ParentHome; href: string | null }) {
  const m = data.attendance.month;
  const tone = m.percent === null ? "neutral" : m.percent >= 90 ? "success" : m.percent >= 75 ? "warning" : "error";
  return (
    <KpiTile
      label="Attendance this month"
      icon={CalendarCheck}
      tone={tone}
      href={href}
      value={m.percent === null ? "—" : `${m.percent}%`}
      hint={
        m.percent === null
          ? "No days marked yet this month"
          : `${m.present} present · ${m.absent} absent · ${m.late} late${m.leave ? ` · ${m.leave} leave` : ""}`
      }
    />
  );
}

function FeeTile({ fees, href }: { fees: NonNullable<ParentHome["fees"]>; href: string | null }) {
  const due = fees.totalDueMinor;
  const overdue = fees.overdueMinor > 0;
  const next = fees.nextDue;
  return (
    <KpiTile
      label={overdue ? "Fee overdue" : "Fee due"}
      icon={Wallet}
      tone={due === 0 ? "success" : overdue ? "error" : "warning"}
      href={href}
      value={due === 0 ? "All paid" : formatMoney(due, fees.currency)}
      hint={
        next
          ? `${next.invoiceNo} due ${formatDate(next.dueDate)}`
          : fees.lastPayment
            ? `Last paid ${formatDate(fees.lastPayment.paidOn)}`
            : "Nothing to pay right now"
      }
      footer={next?.invoiceId ? <ChallanButton invoiceId={next.invoiceId} /> : undefined}
    />
  );
}

function ResultTile({ data, href }: { data: ParentHome; href: string | null }) {
  const r = data.latestResult;
  return (
    <KpiTile
      label={r ? r.examName : "Latest result"}
      icon={Trophy}
      tone={!r ? "neutral" : r.passed ? "info" : "error"}
      href={href}
      value={r ? `${r.percent}%` : "—"}
      hint={
        r
          ? [`Grade ${r.grade}`, r.position ? `${ordinal(r.position)} in class` : null].filter(Boolean).join(" · ")
          : "Shown once the school publishes a result"
      }
    />
  );
}

function HomeworkTile({ data, href }: { data: ParentHome; href: string | null }) {
  const h = data.homework;
  return (
    <KpiTile
      label="Homework due"
      icon={NotebookPen}
      tone={h.dueCount > 0 ? "primary" : "neutral"}
      href={href}
      value={h.dueCount}
      hint={h.nextDueDate ? `Next due ${formatDate(h.nextDueDate)}` : "Nothing due right now"}
    />
  );
}

/** Attendance, fees, latest result and homework at a glance. */
export function ParentKpiTiles({ data, links }: { data: ParentHome; links: ParentLinks }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <AttendanceTile data={data} href={links.attendance} />
      {data.fees && <FeeTile fees={data.fees} href={links.fees} />}
      <ResultTile data={data} href={links.exams} />
      <HomeworkTile data={data} href={links.diary} />
    </div>
  );
}
