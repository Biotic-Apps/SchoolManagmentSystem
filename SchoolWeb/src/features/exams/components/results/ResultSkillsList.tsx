import { SectionHeading } from "@/components/shared/SectionHeading";
import { SKILL_DOMAINS, type StudentSkill } from "../../skill-types";

/** Rated behaviour & skills of a published result, grouped by domain. */
export function ResultSkillsList({ skills }: { skills: StudentSkill[] }) {
  if (skills.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <SectionHeading title="Behaviour & skills" />
      <div className="grid gap-4 sm:grid-cols-2">
        {SKILL_DOMAINS.map((domain) => {
          const list = skills.filter((skill) => skill.domain === domain.id);
          if (list.length === 0) return null;
          return (
            <div key={domain.id} className="flex flex-col gap-1.5">
              <span className="text-label font-semibold text-fg">{domain.name}</span>
              <ul className="flex flex-col divide-y divide-border rounded-card border border-border">
                {list.map((skill) => (
                  <li key={skill.name} className="flex items-center justify-between gap-3 px-3 py-2 text-label">
                    <span className="text-fg">{skill.name}</span>
                    <span className="flex items-center gap-2 text-fg-muted">
                      {skill.label}
                      <span className="inline-flex min-w-7 justify-center rounded-input bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">
                        {skill.code}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
