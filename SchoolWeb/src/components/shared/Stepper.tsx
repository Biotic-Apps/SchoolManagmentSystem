import { Check } from "lucide-react";
import { focusRing } from "@/components/ui/styles";
import { cn } from "@/lib/cn";

export interface WizardStepItem {
  id: string;
  label: string;
}

interface StepperProps {
  steps: WizardStepItem[];
  /** Index of the step on screen. */
  current: number;
  /** Steps up to this index can be clicked to revisit. */
  reachable?: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

/**
 * Numbered progress for multi-step forms: equal-width columns, label under each circle and
 * even connectors between them. Done steps show a tick and can be revisited. Keep labels short.
 */
export function Stepper({ steps, current, reachable = current, onStepClick, className }: StepperProps) {
  const lastIndex = steps.length - 1;
  return (
    <ol className={cn("grid", className)} style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }} aria-label="Steps">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const clickable = !!onStepClick && index !== current && index <= reachable;
        const content = (
          <>
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full border text-caption font-semibold transition-colors",
                done && "border-primary bg-selected text-on-selected",
                active && "border-primary bg-primary text-on-primary",
                !done && !active && "border-border-strong bg-surface text-fg-muted",
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
            </span>
            <span className={cn("max-w-full truncate text-caption font-medium", active ? "text-fg" : "text-fg-muted")}>
              {step.label}
            </span>
          </>
        );
        const itemClass = "relative z-10 flex flex-col items-center gap-1.5 rounded-input px-1 py-0.5";
        return (
          <li key={step.id} aria-current={active ? "step" : undefined} className="relative flex justify-center">
            {index < lastIndex && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-[17px] left-[calc(50%+22px)] right-[calc(-50%+22px)] h-px",
                  done ? "bg-primary" : "bg-border-strong",
                )}
              />
            )}
            {clickable ? (
              <button
                type="button"
                onClick={() => onStepClick(index)}
                className={cn(itemClass, "hover:text-fg", focusRing)}
                aria-label={`Go to step ${index + 1}: ${step.label}`}
              >
                {content}
              </button>
            ) : (
              <span className={itemClass}>{content}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
