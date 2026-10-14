import {
  CalendarCheck,
  ClipboardCheck,
  GraduationCap,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/site/cn";
import { Panel, PanelHead, Pill, Td, Th, type PillTone } from "../chrome/atoms";

const KPIS: Array<{ label: string; value: string; note: string; up: boolean; icon: LucideIcon; tone: string }> = [
  { label: "Students", value: "1,248", note: "+36 this session", up: true, icon: GraduationCap, tone: "bg-brand-500" },
  { label: "Attendance today", value: "96%", note: "1,198 present", up: true, icon: CalendarCheck, tone: "bg-tile-indigo" },
  { label: "Fee collected", value: "Rs 24,60,000", note: "82% of October", up: true, icon: Wallet, tone: "bg-tile-blue" },
  { label: "Pending approvals", value: "14", note: "6 admissions · 8 work", up: false, icon: ClipboardCheck, tone: "bg-tile-rose" },
];

/** Daily attendance %, Monday to Saturday over two weeks. */
const ATTENDANCE = [94, 95, 93, 97, 96, 91, 95, 96, 94, 97, 98, 96];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const RECENT: Array<[string, string, string, string, PillTone]> = [
  ["9:41 AM", "Admission form — Hamza Tariq, Class 3", "Online", "Pending", "warn"],
  ["9:28 AM", "Attendance marked — Class 5-A (38/40)", "Ms. Hira", "Synced", "ok"],
  ["9:12 AM", "Fee received — FC-10482, Rs 8,500", "Accountant", "Verified", "ok"],
  ["8:57 AM", "Homework — Grade 7 Science, Ch. 4", "Mr. Bilal", "Review", "info"],
  ["8:40 AM", "Complaint — school van late, Route 3", "Parent", "Open", "danger"],
  ["8:15 AM", "Daily diary published — Class 2-B", "Ms. Noor", "Published", "ok"],
];

const EVENTS: Array<[string, string, string]> = [
  ["17 Oct", "Parent–teacher meeting", "Classes 1–5 · 10:00 AM"],
  ["21 Oct", "Mid-term exams begin", "All classes · 8:00 AM"],
  ["28 Oct", "Science exhibition", "Main hall · 11:30 AM"],
  ["2 Nov", "Fee due date — November", "All families"],
];

function Kpis() {
  return (
    <div className="-mb-px -mr-px grid grid-cols-2 overflow-hidden rounded-[0.55em] border border-slate-200 bg-white @4xl:grid-cols-4">
      {KPIS.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div key={kpi.label} className="flex min-w-0 items-center gap-[0.6em] border-b border-r border-slate-200 px-[0.75em] py-[0.6em]">
            <span className={cn("hidden size-[2.1em] shrink-0 place-items-center rounded-[0.6em] text-white @lg:grid", kpi.tone)}>
              <Icon className="size-[1.1em]" strokeWidth={2.1} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[0.7em] font-medium uppercase tracking-[0.06em] text-slate-400">{kpi.label}</p>
              <p className="mt-[0.1em] truncate text-[1.05em] font-bold tabular-nums text-slate-900">{kpi.value}</p>
              <p className={cn("mt-[0.05em] truncate text-[0.7em] font-semibold", kpi.up ? "text-brand-600" : "text-rose-500")}>
                {kpi.note}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AttendanceChart() {
  return (
    <Panel className="flex flex-col">
      <PanelHead title="Student attendance" meta="Last two weeks · % present" />
      <div className="flex flex-1 flex-col px-[0.85em] pb-[0.6em] pt-[0.75em]">
        <div className="flex min-h-[6.2em] flex-1 items-end gap-[0.42em]">
          {ATTENDANCE.map((pct, i) => (
            <div
              key={i}
              className={cn("flex-1 rounded-t-[0.15em]", i === ATTENDANCE.length - 1 ? "bg-brand-600" : "bg-brand-300")}
              // Scaled from an 85% floor so the real day-to-day swing is visible.
              style={{ height: `${((pct - 85) / 15) * 100}%` }}
            />
          ))}
        </div>
        <div className="mt-[0.35em] flex justify-between border-t border-slate-100 pt-[0.3em] text-[0.68em] text-slate-400">
          {DAYS.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function Events() {
  return (
    <Panel>
      <PanelHead title="Upcoming events" meta="Session 2026–27" />
      <div className="divide-y divide-slate-100">
        {EVENTS.map(([date, title, meta]) => (
          <div key={title} className="flex items-center gap-[0.6em] px-[0.85em] py-[0.45em]">
            <span className="w-[3.4em] shrink-0 rounded-[0.35em] bg-brand-50 py-[0.2em] text-center text-[0.72em] font-bold text-brand-700">
              {date}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[0.8em] font-semibold text-slate-800">{title}</p>
              <p className="truncate text-[0.68em] text-slate-400">{meta}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function DashboardScreen() {
  return (
    <div className="flex-1 space-y-[0.7em] overflow-hidden bg-slate-50 p-[0.85em]">
      <Kpis />

      {/* Charts need width to say anything; on a narrow frame they step aside
          so the activity list can be read instead. */}
      <div className="hidden grid-cols-[1.45fr_1fr] gap-[0.7em] @3xl:grid">
        <AttendanceChart />
        <Events />
      </div>

      <Panel>
        <PanelHead title="Recent activity" meta="Today · Main Campus" />
        <table className="w-full table-fixed">
          <thead>
            <tr>
              <Th className="w-[8em]">Time</Th>
              <Th>Activity</Th>
              <Th className="hidden w-[11em] @3xl:table-cell">By</Th>
              <Th align="right" className="w-[11em]">Status</Th>
            </tr>
          </thead>
          <tbody>
            {RECENT.map(([time, what, by, status, tone], i) => (
              <tr key={what} className={i === 0 ? "bg-brand-50/40" : undefined}>
                <Td muted>{time}</Td>
                <Td strong>{what}</Td>
                <Td muted className="hidden @3xl:table-cell">{by}</Td>
                <Td align="right">
                  <Pill tone={tone}>{status}</Pill>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
