import { BookOpen, NotebookPen, Wallet } from "lucide-react";
import { cn } from "@/lib/site/cn";
import { Panel, PanelHead } from "../chrome/atoms";

const CHILDREN: Array<[string, string, string]> = [
  ["S", "Sara Khan", "Class 5-A"],
  ["A", "Ahmed Khan", "Class 7-B"],
  ["Z", "Zain Khan", "Class 2-C"],
];

const DIARY: Array<[string, string]> = [
  ["English", "Read pages 42-45 aloud; learn 10 new words."],
  ["Math", "Fractions worksheet, questions 1 to 12."],
  ["Science", "Bring a leaf for Friday's plant activity."],
];

const HOMEWORK: Array<[string, string, string, boolean]> = [
  ["Urdu", "Write an essay: Mera School", "Due Thu", false],
  ["Math", "Exercise 4.3, all parts", "Due Fri", false],
  ["Islamiat", "Learn Surah Al-Asr with translation", "Submitted", true],
];

function ChildSwitcher() {
  return (
    <div className="flex items-center gap-[0.45em] overflow-hidden">
      {CHILDREN.map(([initial, name, cls], i) => (
        <div
          key={name}
          className={cn(
            "flex shrink-0 items-center gap-[0.45em] rounded-full border py-[0.25em] pl-[0.25em] pr-[0.75em]",
            i === 0 ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white",
          )}
        >
          <span
            className={cn(
              "grid size-[2.3em] shrink-0 place-items-center rounded-full text-[0.72em] font-bold",
              i === 0 ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500",
            )}
          >
            {initial}
          </span>
          <span className="leading-tight">
            <span className={cn("block text-[0.78em] font-semibold", i === 0 ? "text-brand-800" : "text-slate-600")}>
              {name}
            </span>
            <span className="hidden text-[0.64em] text-slate-400 @xl:block">{cls}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function AttendanceRing() {
  const pct = 97;
  return (
    <Panel className="flex items-center gap-[0.8em] px-[0.85em] py-[0.7em]">
      <div
        className="grid size-[3.4em] shrink-0 place-items-center rounded-full"
        style={{ background: `conic-gradient(var(--color-brand-600) ${pct * 3.6}deg, var(--color-brand-100) 0)` }}
      >
        <span className="grid size-[2.6em] place-items-center rounded-full bg-white text-[0.82em] font-bold tabular-nums text-slate-900">
          {pct}%
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-[0.7em] font-medium uppercase tracking-[0.06em] text-slate-400">Attendance · Oct</p>
        <p className="truncate text-[0.88em] font-semibold text-slate-900">Present today · 8:02 AM</p>
        <p className="truncate text-[0.7em] text-slate-400">29 of 30 school days this month</p>
      </div>
    </Panel>
  );
}

function FeeDue() {
  return (
    <Panel className="flex items-center gap-[0.7em] border-amber-200 px-[0.85em] py-[0.7em]">
      <span className="grid size-[2.1em] shrink-0 place-items-center rounded-[0.6em] bg-amber-400 text-white">
        <Wallet className="size-[1.05em]" strokeWidth={2.1} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.7em] font-medium uppercase tracking-[0.06em] text-amber-700">Challan due 15 Oct</p>
        <p className="truncate text-[1.02em] font-bold tabular-nums text-slate-900">Rs 22,950</p>
        <p className="truncate text-[0.68em] text-slate-400">Family challan · FC-20391</p>
      </div>
      <span className="hidden shrink-0 rounded-[0.45em] bg-brand-600 px-[0.65em] py-[0.35em] text-[0.74em] font-semibold text-white @xl:inline">
        Upload proof
      </span>
    </Panel>
  );
}

function ListPanel({
  title,
  meta,
  icon: Icon,
  rows,
}: {
  title: string;
  meta: string;
  icon: typeof BookOpen;
  rows: Array<{ k: string; v: string; tag?: string; done?: boolean }>;
}) {
  return (
    <Panel>
      <PanelHead title={title} meta={meta} />
      <div className="divide-y divide-slate-100">
        {rows.map((r) => (
          <div key={r.k + r.v} className="flex items-start gap-[0.55em] px-[0.85em] py-[0.42em]">
            <Icon className="mt-[0.15em] size-[0.85em] shrink-0 text-brand-500" strokeWidth={2.2} />
            <div className="min-w-0 flex-1">
              <p className="text-[0.74em] font-semibold text-slate-800">{r.k}</p>
              <p className="truncate text-[0.74em] text-slate-500">{r.v}</p>
            </div>
            {r.tag ? (
              <span
                className={cn(
                  "shrink-0 rounded-full px-[0.5em] text-[0.66em] font-semibold",
                  r.done ? "bg-brand-50 text-brand-700" : "bg-amber-50 text-amber-700",
                )}
              >
                {r.tag}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function TeacherMessage() {
  return (
    <Panel>
      <PanelHead title="Messages" meta="9:41 AM" />
      <div className="flex gap-[0.55em] px-[0.85em] py-[0.55em]">
        <span className="grid size-[2.5em] shrink-0 place-items-center rounded-full bg-brand-100 text-[0.72em] font-bold text-brand-700">
          H
        </span>
        <div className="min-w-0">
          <p className="text-[0.76em] font-semibold text-slate-800">
            Ms. Hira Aslam <span className="font-normal text-slate-400">· Class teacher</span>
          </p>
          <p className="mt-[0.15em] rounded-[0.5em] rounded-tl-none bg-slate-100 px-[0.6em] py-[0.4em] text-[0.74em] text-slate-600">
            Sara did very well in today&apos;s spelling test. Please help her revise fractions this week.
          </p>
        </div>
      </div>
    </Panel>
  );
}

export function ParentScreen() {
  return (
    <div className="flex-1 space-y-[0.65em] overflow-hidden bg-slate-50 p-[0.85em]">
      <ChildSwitcher />
      <div className="grid gap-[0.65em] @2xl:grid-cols-2">
        <AttendanceRing />
        <FeeDue />
      </div>
      <div className="grid gap-[0.65em] @2xl:grid-cols-2">
        <ListPanel title="Today's diary" meta="Wed, 14 Oct" icon={NotebookPen} rows={DIARY.map(([k, v]) => ({ k, v }))} />
        <div className="space-y-[0.65em]">
          <ListPanel
            title="Homework"
            meta="This week"
            icon={BookOpen}
            rows={HOMEWORK.map(([k, v, tag, done]) => ({ k, v, tag, done }))}
          />
          <TeacherMessage />
        </div>
      </div>
    </div>
  );
}
