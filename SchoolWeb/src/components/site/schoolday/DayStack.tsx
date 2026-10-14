import { SCHOOL_DAY } from "@/lib/site/content";
import { Reveal } from "@/components/site/motion/Reveal";
import { DayCard } from "./DayCard";
import { dayGradient, stopFor } from "./dayColors";

/** Phones and tablets: the same day as a vertical timeline, morning at the top. */
export function DayStack() {
  return (
    <ol className="relative space-y-6 lg:hidden">
      <span
        aria-hidden
        className="absolute bottom-6 left-[11px] top-6 w-1 rounded-full"
        style={{ backgroundImage: dayGradient("to bottom") }}
      />
      {SCHOOL_DAY.map((moment, i) => (
        <li key={moment.time} className="relative pl-10">
          <span
            aria-hidden
            className="absolute left-0 top-6 size-[26px] rounded-full border-[4px] border-white shadow-soft"
            style={{ backgroundColor: stopFor(i) }}
          />
          <Reveal delay={Math.min(i, 2) * 0.06}>
            <DayCard moment={moment} color={stopFor(i)} className="mx-auto max-w-xl sm:max-w-none" />
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
