import { cn } from "@/lib/cn";
import { Reveal } from "../Reveal";
import type { LandingStep } from "./stepData";

/** Numbered badge + card. Mobile: badge left of the card; lg: badge above it, on the connector line. */
export function StepCard({ step, number, className }: { step: LandingStep; number: number; className?: string }) {
  const Icon = step.icon;
  return (
    <Reveal as="li" delay={200 + number * 150} className={cn("relative flex gap-4 lg:flex-col lg:items-center lg:gap-6", className)}>
      <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full bg-white shadow-raised ring-4 ring-[#F7F5FF]">
        <span className="text-gradient text-[22px] font-extrabold leading-none">{String(number).padStart(2, "0")}</span>
      </span>
      <article
        className={cn(
          "group flex-1 rounded-card border border-border bg-white p-5 shadow-card lg:w-full lg:text-center",
          "transition-[box-shadow,translate] duration-300 hover:shadow-card-hover motion-safe:hover:-translate-y-1",
        )}
      >
        <span
          className={cn(
            "grid size-11 place-items-center rounded-tile bg-gradient-to-br text-white shadow-card lg:mx-auto",
            step.gradient,
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <h3 className="mt-4 text-card-title font-bold text-fg">{step.title}</h3>
        <p className="mt-2 text-label text-fg-muted">{step.description}</p>
      </article>
    </Reveal>
  );
}
