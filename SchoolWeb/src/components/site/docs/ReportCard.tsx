import { Crest } from "./Crest";
import { Paper } from "./Paper";
import {
  DEMO_SCHOOL,
  DEMO_STUDENT,
  REPORT_REMARKS,
  REPORT_SKILLS,
  REPORT_SUBJECTS,
  REPORT_SUMMARY,
} from "./data";

export const REPORT_SIZE = { w: 300, h: 424 } as const;

function Stars({ count }: { count: number }) {
  return (
    <span className="flex gap-[2px]">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < count ? "size-[5px] rounded-full bg-brand-500" : "size-[5px] rounded-full bg-brand-100"} />
      ))}
    </span>
  );
}

/** A term report card: marks table, skills, remarks and signature lines. */
export function ReportCard() {
  const s = DEMO_STUDENT;
  return (
    <Paper
      width={REPORT_SIZE.w}
      height={REPORT_SIZE.h}
      label={`Sample report card for ${s.name}, ${s.className}, ${REPORT_SUMMARY.percent}, grade ${REPORT_SUMMARY.grade}`}
    >
      <div className="flex h-full flex-col px-4 pb-3 pt-3.5 text-[6.5px] leading-[1.35]">
        <header className="flex items-center gap-2 border-b-2 border-brand-500 pb-2">
          <Crest size={24} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold tracking-[-0.01em] text-brand-900">{DEMO_SCHOOL.name}</p>
            <p className="text-[#8b8fa3]">{DEMO_SCHOOL.campus}</p>
          </div>
          <div className="text-right">
            <p className="text-[7.5px] font-semibold uppercase tracking-[0.12em] text-brand-600">Report card</p>
            <p className="text-[#8b8fa3]">First Term, {DEMO_SCHOOL.session.replace("Session ", "")}</p>
          </div>
        </header>

        <dl className="mt-2 grid grid-cols-3 gap-x-2 gap-y-1 rounded-[3px] bg-brand-50/70 px-2 py-1.5">
          {[
            ["Student", s.name],
            ["Class", s.className],
            ["Roll no", s.rollNo],
            ["Father", s.father],
            ["Adm no", s.admissionNo],
            ["Position", REPORT_SUMMARY.position],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[5.5px] uppercase tracking-[0.08em] text-[#8b8fa3]">{k}</dt>
              <dd className="font-semibold text-[#1f2037]">{v}</dd>
            </div>
          ))}
        </dl>

        <table className="mt-2 w-full border-collapse">
          <thead>
            <tr className="bg-brand-500 text-left text-white">
              <th className="px-1.5 py-[3px] font-semibold">Subject</th>
              <th className="px-1 text-right font-semibold">Total</th>
              <th className="px-1 text-right font-semibold">Obtained</th>
              <th className="px-1.5 text-right font-semibold">Grade</th>
            </tr>
          </thead>
          <tbody>
            {REPORT_SUBJECTS.map((r) => (
              <tr key={r.name} className="border-b border-[#e9e5fb] odd:bg-white even:bg-[#faf9ff]">
                <td className="px-1.5 py-[2.5px]">{r.name}</td>
                <td className="px-1 text-right text-[#8b8fa3]">{r.total}</td>
                <td className="px-1 text-right font-semibold">{r.marks}</td>
                <td className="px-1.5 text-right font-bold text-brand-700">{r.grade}</td>
              </tr>
            ))}
            <tr className="bg-brand-50 font-bold text-brand-900">
              <td className="px-1.5 py-[3px]">Total</td>
              <td className="px-1 text-right">{REPORT_SUMMARY.total}</td>
              <td className="px-1 text-right">{REPORT_SUMMARY.obtained}</td>
              <td className="px-1.5 text-right">{REPORT_SUMMARY.percent}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-[3px] border border-[#e9e5fb] p-1.5">
            <p className="mb-1 font-semibold uppercase tracking-[0.08em] text-brand-600">Skills</p>
            {REPORT_SKILLS.map((k) => (
              <div key={k.name} className="flex items-center justify-between py-[1.5px]">
                <span>{k.name}</span>
                <Stars count={k.stars} />
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-center rounded-[3px] bg-[linear-gradient(150deg,#7b68ee,#4c3d99)] text-white">
            <p className="text-[5.5px] uppercase tracking-[0.14em] text-brand-100">Overall grade</p>
            <p className="text-[22px] font-bold leading-none">{REPORT_SUMMARY.grade}</p>
            <p className="mt-0.5 text-brand-100">{REPORT_SUMMARY.percent} · Position {REPORT_SUMMARY.position}</p>
          </div>
        </div>

        <div className="mt-2 rounded-[3px] border border-dashed border-brand-200 px-1.5 py-1">
          <p className="font-semibold uppercase tracking-[0.08em] text-brand-600">Teacher&apos;s remarks</p>
          <p className="mt-0.5 italic text-[#5b6070]">{REPORT_REMARKS}</p>
        </div>

        <footer className="mt-auto flex items-end justify-between pt-2">
          {[
            ["Class teacher", "N. Batool"],
            ["Principal", "S. Rehman"],
          ].map(([who, sig]) => (
            <div key={who} className="w-[38%] text-center">
              <p className="font-[cursive] text-[10px] leading-none text-brand-800">{sig}</p>
              <p className="mt-0.5 border-t border-[#1f2037]/40 pt-0.5 text-[#8b8fa3]">{who}</p>
            </div>
          ))}
        </footer>
      </div>
    </Paper>
  );
}
