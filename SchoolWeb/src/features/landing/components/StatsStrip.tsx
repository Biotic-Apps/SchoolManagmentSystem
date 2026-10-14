import { LandingContainer } from "./LandingContainer";
import { Reveal } from "./Reveal";
import { ModuleMarquee } from "./stats/ModuleMarquee";
import { StatItem } from "./stats/StatItem";

const STATS = [
  { value: 25, suffix: "+", label: "Modules", detail: "From admissions to payroll" },
  { value: 7, suffix: "", label: "Roles", detail: "Each with its own menu" },
  { value: 2, suffix: "", label: "Apps", detail: "Web portal & Android" },
  { value: 100, suffix: "%", label: "Role-based access", detail: "Everyone sees only their part" },
];

/** Headline numbers that count up on scroll, then an endless strip of module names. */
export function StatsStrip() {
  return (
    <section aria-label="eSchool at a glance" className="relative py-10 sm:py-14">
      <LandingContainer>
        <Reveal>
          <dl className="grid grid-cols-2 rounded-card bg-white shadow-raised ring-1 ring-border lg:grid-cols-4">
            {STATS.map((stat, i) => (
              <StatItem key={stat.label} {...stat} index={i} />
            ))}
          </dl>
        </Reveal>
      </LandingContainer>
      <ModuleMarquee className="mt-10 sm:mt-14" />
    </section>
  );
}
