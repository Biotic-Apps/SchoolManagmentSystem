import { PhoneCall } from "lucide-react";
import { COMPARE_COPY as COPY } from "@/lib/site/content";
import { HAND, SceneTile } from "./SceneTile";

const MARKS = ["P", "P", "A", "P", "L", "P", "P", "A", "P", "P", "P", "P", "A", "P", "P", "P", "L", "P"];

/** The paper school day: a crossed-out register, a torn slip, a carbon receipt, a phone. */
export function PaperSide() {
  const { register, diary, receipt, call } = COPY.paper;
  return (
    <div className="grid size-full gap-3 bg-[#f6efdc] p-4 text-[#3b3427] sm:grid-cols-2 sm:gap-4 sm:p-6">
      <SceneTile tone="paper" className="-rotate-1">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-[#8a7a5a]">{register.title}</p>
        <div className="mt-2 grid grid-cols-9 gap-1 border-t border-[#c9b98f] pt-2" style={HAND}>
          {MARKS.map((mark, index) => (
            <span key={index} className={mark === "A" ? "text-red-700" : index === 6 ? "line-through" : ""}>
              {mark}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[0.78rem] text-[#8a7a5a]" style={HAND}>{register.note}</p>
      </SceneTile>

      <SceneTile tone="paper" className="rotate-[1.5deg] bg-[#fffbea]">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-[#8a7a5a]">{diary.title}</p>
        <p className="mt-2 text-[0.95rem] leading-snug text-[#24408e]" style={HAND}>{diary.text}</p>
      </SceneTile>

      <SceneTile tone="paper" className="rotate-[-1.5deg]">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-[#8a7a5a]">{receipt.title}</p>
        <p className="mt-2 text-[0.92rem] text-[#3b3427]/80" style={HAND}>{receipt.text}</p>
        <span className="mt-2 inline-block rotate-[-4deg] rounded border border-dashed border-[#9b4a3a] px-2 py-0.5 text-[0.68rem] font-semibold uppercase text-[#9b4a3a]">
          {receipt.stamp}
        </span>
      </SceneTile>

      <SceneTile tone="paper" className="rotate-1">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-[#8a7a5a]">{call.title}</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#3b3427] text-[#f6efdc]">
            <PhoneCall className="size-4" />
          </span>
          <p className="text-[0.9rem]" style={HAND}>{call.text}</p>
        </div>
      </SceneTile>
    </div>
  );
}
