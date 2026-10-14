"use client";

import { useEffect, useRef } from "react";
import { LandingContainer } from "./LandingContainer";
import { Reveal } from "./Reveal";
import { SectionHeader } from "./SectionHeader";
import { RoleCard, RoleChip } from "./roles/RoleCard";
import { RolePreview } from "./roles/RolePreview";
import { LANDING_ROLES } from "./roles/roleData";
import { useRoleRotation } from "./roles/useRoleRotation";

/** "A portal for every role": interactive role list (chips on mobile) + animated preview card. */
export function RolesSection() {
  const { index, select, setPaused, autoplay, running, intervalMs } = useRoleRotation(LANDING_ROLES.length);
  const chipsRef = useRef<HTMLDivElement>(null);
  const role = LANDING_ROLES[index]!;

  // Keep the active mobile chip in view (scrolls the chip row only, never the page).
  useEffect(() => {
    const row = chipsRef.current;
    const chip = row?.querySelector<HTMLElement>("[data-active]");
    if (!row || !chip) return;
    const left = chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2;
    row.scrollTo({ left, behavior: autoplay ? "smooth" : "auto" });
  }, [index, autoplay]);

  return (
    <section id="roles" className="relative bg-gradient-to-b from-white to-[#F7F5FF] py-20 sm:py-28">
      <LandingContainer>
        <SectionHeader
          eyebrow="Roles"
          title={<>One app, <span className="text-gradient">a portal for every role</span></>}
          description="Everyone signs in to the same eSchool and sees only their own portal, with just the tools their job needs."
        />

        <div
          className="mt-12 lg:mt-16 lg:grid lg:grid-cols-[minmax(0,360px)_1fr] lg:items-start lg:gap-8"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <Reveal from="left" className="hidden lg:block">
            <div className="flex flex-col gap-1.5 rounded-card border border-border bg-white/80 p-2 shadow-card">
              {LANDING_ROLES.map((r, i) => (
                <RoleCard
                  key={r.id}
                  role={r}
                  active={i === index}
                  showProgress={running}
                  intervalMs={intervalMs}
                  onSelect={() => select(i)}
                />
              ))}
            </div>
          </Reveal>

          <Reveal className="lg:hidden">
            <div
              ref={chipsRef}
              className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
            >
              {LANDING_ROLES.map((r, i) => (
                <RoleChip key={r.id} role={r} active={i === index} onSelect={() => select(i)} />
              ))}
            </div>
          </Reveal>

          <Reveal from="right" delay={120} className="mt-4 lg:mt-0">
            <RolePreview key={role.id} role={role} />
          </Reveal>
        </div>
      </LandingContainer>
    </section>
  );
}
