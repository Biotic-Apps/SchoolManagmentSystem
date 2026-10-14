import type { LucideIcon } from "lucide-react";
import { Reveal } from "../Reveal";

interface SecurityCardProps {
  icon: LucideIcon;
  title: string;
  text: string;
  delay?: number;
}

/** One security promise: gradient icon tile, title, one line. Lifts on hover. */
export function SecurityCard({ icon: Icon, title, text, delay = 0 }: SecurityCardProps) {
  return (
    <Reveal as="li" delay={delay} className="h-full">
      <div className="group h-full rounded-card border border-border bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-raised">
        <span className="grid size-12 place-items-center rounded-tile bg-gradient-to-br from-[#7B68EE] to-[#A78BFA] text-white shadow-raised transition-transform duration-300 group-hover:scale-105">
          <Icon className="size-6" />
        </span>
        <h3 className="mt-5 text-card-title font-semibold text-fg">{title}</h3>
        <p className="mt-1.5 text-label text-fg-muted">{text}</p>
      </div>
    </Reveal>
  );
}
