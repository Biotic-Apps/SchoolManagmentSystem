import { Crest } from "./Crest";
import { Paper } from "./Paper";
import { CHALLAN, DEMO_SCHOOL, DEMO_STUDENT, rs } from "./data";

export const CHALLAN_SIZE = { w: 456, h: 300 } as const;

const BARS = "3121132112311213".split("");

/** One of the three copies printed side by side on the challan. */
function Copy({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col px-2.5 pb-2 pt-2.5">
      <div className="flex items-center gap-1.5">
        <Crest size={16} />
        <div className="min-w-0">
          <p className="truncate text-[7px] font-bold text-brand-900">{DEMO_SCHOOL.name}</p>
          <p className="text-[5px] text-[#8b8fa3]">{DEMO_SCHOOL.campus}</p>
        </div>
      </div>
      <p className="mt-1.5 rounded-[2px] bg-brand-500 py-[2px] text-center text-[6px] font-semibold uppercase tracking-[0.14em] text-white">
        {title}
      </p>

      <dl className="mt-1.5 space-y-[1.5px] text-[5.5px]">
        {[
          ["Challan no", CHALLAN.number],
          ["Family ID", CHALLAN.family],
          ["Parent", DEMO_STUDENT.father],
          ["Fee month", CHALLAN.month],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-1">
            <dt className="text-[#8b8fa3]">{k}</dt>
            <dd className="font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      <table className="mt-1.5 w-full border-collapse text-[5.5px]">
        <thead>
          <tr className="border-y border-[#d9d2f7] text-left text-brand-700">
            <th className="py-[2px] font-semibold">Student</th>
            <th className="font-semibold">Class</th>
            <th className="text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {CHALLAN.children.map((c) => (
            <tr key={c.name} className="border-b border-[#e9e5fb]">
              <td className="py-[2.5px]">{c.name}</td>
              <td>{c.className}</td>
              <td className="text-right font-semibold">{rs(c.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-1.5 flex items-center justify-between rounded-[2px] bg-brand-50 px-1.5 py-1 text-brand-900">
        <span className="text-[6px] font-semibold">Total payable</span>
        <span className="text-[8px] font-bold">{rs(CHALLAN.total)}</span>
      </div>
      <p className="mt-1 text-[5.5px]">
        <span className="text-[#8b8fa3]">Due date </span>
        <span className="font-bold text-accent-600">{CHALLAN.due}</span>
      </p>
      <p className="mt-[1px] text-[5px] text-[#8b8fa3]">{CHALLAN.bank}</p>

      <div className="mt-auto flex items-end justify-between pt-1">
        <div className="flex h-[14px] items-end gap-[1px]">
          {BARS.map((n, i) => (
            <span key={i} style={{ width: Number(n) * 0.8 }} className="h-full bg-[#1f2037]" />
          ))}
        </div>
        <div className="w-[42%] border-t border-[#1f2037]/40 pt-[1px] text-center text-[5px] text-[#8b8fa3]">
          Bank stamp
        </div>
      </div>
    </div>
  );
}

/** A family fee challan: one sheet, three tear-off copies. */
export function FeeChallan() {
  return (
    <Paper
      width={CHALLAN_SIZE.w}
      height={CHALLAN_SIZE.h}
      label={`Sample family fee challan for three children, total ${rs(CHALLAN.total)}, due ${CHALLAN.due}`}
    >
      <div className="grid h-full grid-cols-3">
        {CHALLAN.copies.map((t, i) => (
          <div key={t} className={i > 0 ? "border-l border-dashed border-[#c4b5fd]" : undefined}>
            <Copy title={t} />
          </div>
        ))}
      </div>
    </Paper>
  );
}
