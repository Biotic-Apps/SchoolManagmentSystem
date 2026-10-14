import {
  DatabaseBackup,
  History,
  KeyRound,
  Lock,
  MonitorSmartphone,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/site/ui/Section";
import { SectionHeading } from "@/components/site/ui/SectionHeading";
import { Reveal } from "@/components/site/motion/Reveal";
import { TRUST_COPY, TRUST_POINTS } from "@/lib/site/content";
import { cn } from "@/lib/site/cn";

const ICONS: Record<(typeof TRUST_POINTS)[number]["icon"], LucideIcon> = {
  ShieldCheck,
  KeyRound,
  DatabaseBackup,
  History,
  MonitorSmartphone,
  Lock,
};

/** Why a school can trust it with children's records — what a principal asks first. */
export function Trust() {
  return (
    <Section id="security" tone="sunken">
      <SectionHeading
        eyebrow={TRUST_COPY.eyebrow}
        title={TRUST_COPY.title}
        body={TRUST_COPY.body}
      />

      {/* Columns split by hairlines rather than six more cards. On large
          screens each row of three rules between its columns only. */}
      <div className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-0 lg:gap-y-14">
        {TRUST_POINTS.map((point, index) => {
          const Icon = ICONS[point.icon] ?? ShieldCheck;
          const column = index % 3;
          return (
            <Reveal
              key={point.title}
              delay={column * 0.1}
              className={cn(
                "lg:px-8",
                column === 0 && "lg:pl-0",
                column < 2 && "lg:border-r lg:border-line",
                column === 2 && "lg:pr-0",
              )}
            >
              <Icon className="size-5 text-brand-600" strokeWidth={2} />
              <h3 className="mt-5 text-[1.05rem] font-semibold tracking-tight">{point.title}</h3>
              <p className="mt-3 text-pretty text-[0.95rem] leading-[1.65] text-muted">
                {point.body}
              </p>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
