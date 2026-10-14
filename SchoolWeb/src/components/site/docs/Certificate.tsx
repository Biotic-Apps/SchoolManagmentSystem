import { Star } from "lucide-react";
import { Crest } from "./Crest";
import { Paper } from "./Paper";
import { CERTIFICATE, DEMO_SCHOOL, DEMO_STUDENT } from "./data";

export const CERT_SIZE = { w: 420, h: 300 } as const;

const TAIL = "h-[34px] w-[13px] origin-top [clip-path:polygon(0_0,100%_0,100%_100%,50%_78%,0_100%)]";

/** The purple rosette with two ribbon tails, pinned near the certificate's corner. */
function Seal() {
  return (
    <div className="absolute bottom-[30px] right-8 flex flex-col items-center">
      <div className="absolute top-[38px] flex gap-1">
        <span className={`${TAIL} rotate-[14deg] bg-brand-700`} />
        <span className={`${TAIL} -rotate-[14deg] bg-brand-500`} />
      </div>
      <div className="relative flex size-[52px] items-center justify-center rounded-full bg-[conic-gradient(#7b68ee,#4c3d99,#7b68ee,#4c3d99,#7b68ee)] shadow-[0_3px_8px_-2px_rgb(42_31_107/0.5)]">
        <div className="flex size-[40px] flex-col items-center justify-center rounded-full border border-dashed border-white/60 bg-brand-600 text-white">
          <Star className="size-3 fill-white" strokeWidth={0} />
          <span className="mt-[1px] text-[4.5px] font-bold uppercase tracking-[0.12em]">First</span>
        </div>
      </div>
    </div>
  );
}

/** A certificate of achievement with a double border and a ribbon seal. */
export function Certificate() {
  return (
    <Paper
      width={CERT_SIZE.w}
      height={CERT_SIZE.h}
      label={`Sample ${CERTIFICATE.title} awarded to ${DEMO_STUDENT.name}`}
    >
      <div className="absolute inset-0 bg-[#fffcf5]/70" />
      <div className="absolute -left-10 -top-10 size-28 rounded-full bg-brand-100/60" />
      <div className="absolute -bottom-12 -left-6 size-24 rounded-full bg-accent-100/60" />
      <div className="absolute inset-2.5 rounded-[2px] border-2 border-brand-500" />
      <div className="absolute inset-[15px] rounded-[1px] border border-brand-200" />

      <div className="relative flex h-full flex-col items-center px-12 pt-7 text-center">
        <Crest size={26} />
        <p className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.2em] text-brand-700">
          {DEMO_SCHOOL.name}
        </p>
        <p className="mt-2.5 font-serif text-[21px] font-semibold leading-tight tracking-[-0.01em] text-brand-900">
          {CERTIFICATE.title}
        </p>
        <span className="mt-1.5 h-px w-24 bg-[linear-gradient(90deg,transparent,#7b68ee,transparent)]" />
        <p className="mt-2.5 text-[7px] text-[#5b6070]">{CERTIFICATE.lead}</p>
        <p className="mt-1 font-[cursive] text-[22px] leading-tight text-brand-800">{DEMO_STUDENT.name}</p>
        <p className="mt-0.5 text-[6.5px] text-[#8b8fa3]">
          {DEMO_STUDENT.className}, {DEMO_SCHOOL.session}
        </p>
        <p className="mt-2 max-w-[250px] text-[7.5px] leading-[1.5]">{CERTIFICATE.reason}</p>

        <div className="mb-7 mt-auto flex w-full items-end justify-between pr-16 text-[5.5px] text-[#8b8fa3]">
          <div className="w-[34%]">
            <p className="text-[7px] font-semibold text-[#1f2037]">{CERTIFICATE.date}</p>
            <p className="mt-0.5 border-t border-[#1f2037]/40 pt-0.5">Date</p>
          </div>
          <div className="w-[34%]">
            <p className="font-[cursive] text-[11px] leading-none text-brand-800">S. Rehman</p>
            <p className="mt-0.5 border-t border-[#1f2037]/40 pt-0.5">Principal</p>
          </div>
        </div>
      </div>
      <Seal />
    </Paper>
  );
}
