import { Crest } from "./Crest";
import { Paper } from "./Paper";
import { DEMO_SCHOOL, DEMO_STUDENT } from "./data";

export const ID_SIZE = { w: 196, h: 306 } as const;

const BARS = "21132111231121321123".split("");

/** A portrait student ID card with photo, details and a barcode. */
export function IdCard() {
  const s = DEMO_STUDENT;
  return (
    <Paper
      width={ID_SIZE.w}
      height={ID_SIZE.h}
      label={`Sample student ID card for ${s.name}, ${s.className}`}
      className="rounded-[12px]"
    >
      <div className="flex h-full flex-col">
        <div className="relative h-[92px] bg-[linear-gradient(150deg,#7b68ee,#4c3d99)] px-3 pt-3 text-white">
          <div className="absolute -right-6 -top-8 size-24 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-1.5">
            <Crest size={20} className="ring-white/30" />
            <div>
              <p className="text-[8px] font-bold leading-tight">{DEMO_SCHOOL.name}</p>
              <p className="text-[5.5px] text-brand-100">Student identity card</p>
            </div>
          </div>
        </div>

        <div className="relative -mt-9 flex justify-center">
          <div className="flex size-[66px] items-center justify-center rounded-[14px] bg-[linear-gradient(160deg,#fce7f3,#ede9fe)] text-[20px] font-bold text-brand-700 ring-[3px] ring-white">
            AF
          </div>
        </div>

        <div className="mt-2 px-3 text-center">
          <p className="text-[11px] font-bold leading-tight">{s.name}</p>
          <p className="mt-0.5 inline-block rounded-full bg-brand-50 px-2 py-[1px] text-[6.5px] font-semibold text-brand-700">
            {s.className}
          </p>
        </div>

        <dl className="mx-3 mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[6px]">
          {[
            ["Adm no", s.admissionNo],
            ["Blood group", s.blood],
            ["Father", s.father],
            ["Valid till", s.validTill],
            ["Emergency", s.emergency],
            ["Campus", "Gulberg"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[5px] uppercase tracking-[0.08em] text-[#8b8fa3]">{k}</dt>
              <dd className="font-semibold">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex flex-col items-center bg-brand-50/70 pb-2 pt-1.5">
          <div className="flex h-[18px] items-end gap-[1px]">
            {BARS.map((n, i) => (
              <span key={i} style={{ width: Number(n) * 0.9 }} className="h-full bg-[#1f2037]" />
            ))}
          </div>
          <p className="mt-0.5 text-[5px] tracking-[0.2em] text-[#8b8fa3]">{s.admissionNo}</p>
        </div>
      </div>
    </Paper>
  );
}
