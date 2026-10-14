import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "@/lib/site/cn";

type StepCardProps = {
  index: number;
  step: number;
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
};

export function StepCard({
  index,
  step,
  icon: Icon,
  label,
  children,
}: StepCardProps) {
  const active = step === index;
  const done = step > index;
  return (
    <div
      className={cn(
        "card-surface relative flex h-full min-w-0 flex-col p-5 transition-[box-shadow,border-color,opacity,transform] duration-500 sm:p-6",
        active && "border-brand-300 shadow-[var(--shadow-lift)]",
        step < index && "opacity-60",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-full text-[0.72rem] font-bold tabular-nums transition-colors duration-500",
            done || active
              ? "bg-brand-600 text-white"
              : "bg-surface-sunken text-faint",
          )}
        >
          {done ? <Check className="size-3.5" strokeWidth={3} /> : index}
        </span>
        <span className="flex min-w-0 items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-faint">
          <Icon className="size-3.5 shrink-0" strokeWidth={2.2} />
          <span className="leading-snug">{label}</span>
        </span>
      </div>
      <div className="mt-5 flex-1">{children}</div>
    </div>
  );
}
