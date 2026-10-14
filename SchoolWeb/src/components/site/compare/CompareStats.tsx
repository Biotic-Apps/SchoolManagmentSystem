import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/motion/Reveal";
import { COMPARE_COPY as COPY } from "@/lib/site/content";

/** Four before/after pairs under the slider, labelled as examples. */
export function CompareStats() {
  return (
    <div className="mt-8">
      <ul className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
        {COPY.stats.map((stat, index) => (
          <Reveal
            as="li"
            key={stat.label}
            delay={index * 0.07}
            className="rounded-panel bg-surface p-4 ring-1 ring-line shadow-soft"
          >
            <p className="text-[0.78rem] font-medium text-muted">{stat.label}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[0.9rem] text-faint line-through decoration-faint/60">
                <span className="sr-only">{COPY.paperShort}: </span>
                {stat.paper}
              </span>
              <ArrowRight aria-hidden className="size-3.5 text-faint" />
              <span className="text-[1.2rem] font-semibold tracking-tight text-brand-700">
                <span className="sr-only">{COPY.eschoolShort}: </span>
                {stat.eschool}
              </span>
            </div>
          </Reveal>
        ))}
      </ul>
      <p className="mt-4 text-center text-[0.78rem] text-faint">{COPY.statsNote}</p>
    </div>
  );
}
