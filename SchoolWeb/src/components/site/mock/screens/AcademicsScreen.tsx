import { cn } from "@/lib/site/cn";
import { Chips, Panel, PanelHead, Td, Th } from "../chrome/atoms";

const SUBJECTS = ["Eng", "Urdu", "Math", "Sci", "Isl", "SSt"] as const;

/** Marks out of 100 per subject, in SUBJECTS order. */
const MARKS: Array<[string, number[]]> = [
  ["Abdullah Rehman", [86, 78, 92, 88, 90, 81]],
  ["Aiman Fatima", [94, 89, 97, 93, 95, 90]],
  ["Ali Hassan", [62, 70, 58, 66, 74, 61]],
  ["Areeba Zahid", [88, 84, 79, 91, 87, 85]],
  ["Fatima Noor", [76, 81, 72, 78, 83, 74]],
  ["Hamza Iqbal", [71, 65, 84, 77, 79, 68]],
  ["Hania Sheikh", [91, 87, 88, 94, 92, 89]],
  ["Ibrahim Saeed", [55, 62, 49, 58, 66, 57]],
];

function grade(pct: number) {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}

const GRADE_TONE: Record<string, string> = {
  "A+": "bg-brand-600 text-white",
  A: "bg-brand-100 text-brand-800",
  B: "bg-sky-50 text-sky-700",
  C: "bg-amber-50 text-amber-700",
  D: "bg-rose-50 text-rose-600",
  F: "bg-rose-500 text-white",
};

function MarksGrid() {
  return (
    <Panel className="min-w-0 flex-1">
      <PanelHead title="Marks entry · Class 5-A · Mid-term" meta="Out of 100 per subject" />
      <table className="w-full table-fixed">
        <thead>
          <tr>
            <Th>Student</Th>
            {SUBJECTS.map((s, i) => (
              <Th key={s} align="right" className={cn("w-[4.6em]", i > 2 && "hidden @xl:table-cell")}>
                {s}
              </Th>
            ))}
            <Th align="right" className="hidden w-[5.8em] @2xl:table-cell">%</Th>
            <Th align="right" className="w-[6.4em]">Grade</Th>
          </tr>
        </thead>
        <tbody>
          {MARKS.map(([name, marks], row) => {
            const pct = Math.round(marks.reduce((a, b) => a + b, 0) / marks.length);
            const g = grade(pct);
            return (
              <tr key={name}>
                <Td strong>{name}</Td>
                {marks.map((m, i) => (
                  <Td
                    key={i}
                    align="right"
                    className={cn(
                      i > 2 && "hidden @xl:table-cell",
                      // The cell being typed into, as a teacher would see it.
                      row === 2 && i === 2 && "bg-brand-50 font-semibold text-brand-700 ring-1 ring-inset ring-brand-400",
                      m < 50 && "text-rose-600",
                    )}
                  >
                    {m}
                  </Td>
                ))}
                <Td align="right" strong className="hidden @2xl:table-cell">{pct}%</Td>
                <Td align="right">
                  <span className={cn("inline-block min-w-[2.2em] rounded-[0.3em] px-[0.35em] text-center text-[0.9em] font-bold", GRADE_TONE[g])}>
                    {g}
                  </span>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Panel>
  );
}

const SKILLS: Array<[string, string]> = [
  ["Punctuality", "Excellent"],
  ["Class participation", "Very good"],
  ["Neatness", "Excellent"],
  ["Teamwork", "Good"],
];

function ReportCard() {
  return (
    <Panel className="hidden w-[13em] shrink-0 @3xl:block">
      <div className="border-b border-slate-200 bg-brand-600 px-[0.85em] py-[0.55em] text-white">
        <p className="text-[0.66em] uppercase tracking-[0.1em] text-brand-100">Report card · Mid-term</p>
        <p className="truncate text-[0.88em] font-bold">Aiman Fatima</p>
        <p className="text-[0.68em] text-brand-100">Class 5-A · Roll 02 · Position 1st</p>
      </div>
      <div className="divide-y divide-slate-100">
        {SUBJECTS.map((s, i) => (
          <div key={s} className="flex justify-between px-[0.85em] py-[0.24em] text-[0.74em]">
            <span className="text-slate-600">{s}</span>
            <span className="tabular-nums font-semibold text-slate-900">{MARKS[1][1][i]}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 px-[0.85em] py-[0.45em]">
        <p className="mb-[0.25em] text-[0.66em] font-semibold uppercase tracking-[0.08em] text-slate-400">Skills</p>
        {SKILLS.map(([k, v]) => (
          <div key={k} className="flex justify-between text-[0.7em]">
            <span className="truncate text-slate-500">{k}</span>
            <span className="shrink-0 font-medium text-brand-700">{v}</span>
          </div>
        ))}
      </div>
      <div className="flex items-baseline justify-between border-t border-slate-200 px-[0.85em] py-[0.45em]">
        <span className="text-[0.78em] font-semibold text-slate-800">Total 558/600</span>
        <span className="rounded-[0.3em] bg-brand-600 px-[0.4em] text-[0.78em] font-bold text-white">A+</span>
      </div>
    </Panel>
  );
}

export function AcademicsScreen() {
  return (
    <div className="flex flex-1 flex-col gap-[0.65em] overflow-hidden bg-slate-50 p-[0.85em]">
      <div className="flex items-center gap-[0.45em] overflow-hidden">
        <Chips items={["Mid-term", "First term", "Final"]} />
        <span className="ml-auto shrink-0 rounded-[0.45em] bg-brand-600 px-[0.7em] py-[0.38em] text-[0.78em] font-semibold text-white">
          Print report cards
        </span>
      </div>
      <div className="flex min-h-0 gap-[0.7em]">
        <MarksGrid />
        <ReportCard />
      </div>
    </div>
  );
}
