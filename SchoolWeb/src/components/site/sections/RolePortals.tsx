"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/site/ui/SectionHeading";
import { Reveal } from "@/components/site/motion/Reveal";
import { RoleChips } from "@/components/site/roles/RoleChips";
import { RolePreview } from "@/components/site/roles/RolePreview";
import { RoleTabs } from "@/components/site/roles/RoleTabs";
import { useAutoAdvance } from "@/components/site/roles/useAutoAdvance";
import { ROLE_PORTALS, ROLE_PORTALS_COPY } from "@/lib/site/content";

const INTERVAL = 5000;

/**
 * "A portal for every role": pick a role and see the screen it lands on and
 * what it can do. It walks through the roles by itself while on screen,
 * pauses under the pointer, and stops the moment the reader picks one.
 * Reduced motion: no auto-advance at all.
 */
export function RolePortals() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px -20% 0px" });
  const reduced = useReducedMotion();
  const { active, pick, ticking, setPaused } = useAutoAdvance(
    ROLE_PORTALS.length,
    INTERVAL,
    inView && !reduced,
  );

  return (
    <section id="roles" className="overflow-hidden py-24 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={ROLE_PORTALS_COPY.eyebrow}
          title={ROLE_PORTALS_COPY.title}
          body={ROLE_PORTALS_COPY.body}
        />
        <Reveal className="mt-12 lg:mt-16">
          <div
            ref={ref}
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            className="grid gap-6 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[minmax(0,21rem)_minmax(0,1fr)]"
          >
            <div className="min-w-0">
              <RoleTabs active={active} ticking={ticking} interval={INTERVAL} onPick={pick} />
              <RoleChips active={active} onPick={pick} />
            </div>
            <RolePreview active={active} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
