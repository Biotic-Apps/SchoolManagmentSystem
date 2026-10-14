"use client";

import { useEffect, useRef } from "react";
import { Section } from "@/components/site/ui/Section";
import { SectionHeading } from "@/components/site/ui/SectionHeading";
import { Reveal } from "@/components/site/motion/Reveal";
import { HOW_COPY, HOW_IT_WORKS } from "@/lib/site/content";
import { gsap, prefersReducedMotion } from "@/lib/site/gsap";
import { refreshScrollTriggers } from "@/lib/site/scroll";

/**
 * Three steps with a rule that draws itself as the section scrolls through.
 *
 * The line is scrubbed rather than triggered so it tracks the reader's pace
 * instead of firing once and finishing without them.
 */
export function HowItWorks() {
  const lineRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const line = lineRef.current;
    const section = sectionRef.current;
    if (!line || !section) return;

    if (prefersReducedMotion()) {
      gsap.set(line, { scaleX: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        line,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            end: "bottom 62%",
            scrub: 0.6,
          },
        },
      );
    }, section);

    refreshScrollTriggers();

    return () => ctx.revert();
  }, []);

  return (
    <Section id="how-it-works">
      <SectionHeading
        eyebrow={HOW_COPY.eyebrow}
        title={HOW_COPY.title}
        body={HOW_COPY.body}
        align="center"
      />

      <div ref={sectionRef} className="relative mt-16">
        {/* The rule that fills in behind the step markers */}
        <div
          aria-hidden
          className="absolute inset-x-[16.6%] top-6 hidden h-px bg-line lg:block"
        >
          <div
            ref={lineRef}
            className="h-full origin-left bg-gradient-to-r from-brand-400 via-brand-500 to-accent-400"
          />
        </div>

        <ol className="relative grid gap-12 lg:grid-cols-3 lg:gap-10">
          {HOW_IT_WORKS.map((step, index) => (
            <Reveal as="li" key={step.step} delay={index * 0.12} className="lg:text-center">
              <span className="inline-grid size-11 place-items-center rounded-full bg-surface-sunken text-[0.8rem] font-bold tabular-nums text-brand-700 ring-1 ring-line">
                {step.step}
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{step.title}</h3>
              <p className="mx-auto mt-3 max-w-sm text-pretty text-[0.95rem] leading-relaxed text-muted">
                {step.body}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}
