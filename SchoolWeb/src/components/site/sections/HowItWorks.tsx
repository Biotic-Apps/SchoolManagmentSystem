"use client";

import { useRef } from "react";
import { Section } from "@/components/site/ui/Section";
import { SectionHeading } from "@/components/site/ui/SectionHeading";
import { TimelineStep } from "@/components/site/how/TimelineStep";
import { SetupChecklist } from "@/components/site/how/SetupChecklist";
import { ImportTable } from "@/components/site/how/ImportTable";
import { RoleFan } from "@/components/site/how/RoleFan";
import { useTimelineScroll } from "@/components/site/how/useTimelineScroll";
import { HOW_COPY, HOW_IT_WORKS } from "@/lib/site/content";

const VISUALS = [
  <SetupChecklist key="setup" />,
  <ImportTable key="import" />,
  <RoleFan key="roles" />,
];

/**
 * Three steps on a vertical timeline. The centre line fills with the brand
 * gradient as the reader scrolls; each node pops as the fill reaches it and
 * its card swings in from its own side. On phones the line moves to the left
 * gutter and every card sits to its right.
 */
export function HowItWorks() {
  const listRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  useTimelineScroll(listRef, fillRef);

  return (
    <Section id="how-it-works" className="overflow-hidden">
      <SectionHeading
        eyebrow={HOW_COPY.eyebrow}
        title={HOW_COPY.title}
        body={HOW_COPY.body}
        align="center"
      />

      <div className="relative mx-auto mt-16 max-w-5xl lg:mt-20">
        {/* Track and fill. Stops at the first and last node centres. */}
        <div
          aria-hidden
          className="absolute bottom-12 left-6 top-12 w-[3px] -translate-x-1/2 rounded-full bg-line-strong/70 lg:left-1/2"
        >
          <div
            ref={fillRef}
            className="h-full origin-top rounded-full bg-gradient-to-b from-brand-500 via-brand-400 to-accent-500 shadow-[0_0_14px_rgb(123_104_238/0.55)]"
          />
        </div>

        <ol ref={listRef} className="relative space-y-12 lg:space-y-0">
          {HOW_IT_WORKS.map((step, index) => (
            <TimelineStep
              key={step.step}
              index={index}
              step={step.step}
              title={step.title}
              body={step.body}
              visual={VISUALS[index]}
            />
          ))}
        </ol>
      </div>
    </Section>
  );
}
