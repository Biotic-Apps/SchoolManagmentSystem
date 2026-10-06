import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface StepperStep {
  id: string;
  label: string;
}

interface StatusStepperProps {
  steps: StepperStep[];
  /** Id of the step reached; earlier steps show as done. */
  current: string;
  /** Set when the flow ended off the happy path (e.g. "Rejected"); the current step shows as failed. */
  failedLabel?: string | null;
  className?: string;
}

/** Progress through a status workflow (admissions, plans, transfers). */
export function StatusStepper({ steps, current, failedLabel, className }: StatusStepperProps) {
  const currentIndex = Math.max(0, steps.findIndex((step) => step.id === current));
  const lastIndex = steps.length - 1;

  return (
    <ol className={cn("flex flex-wrap gap-y-3", className)} aria-label="Progress">
      {steps.map((step, index) => {
        const failed = index === currentIndex && !!failedLabel;
        const done = !failed && (index < currentIndex || (index === lastIndex && currentIndex === lastIndex));
        const active = index === currentIndex && !done && !failed;
        return (
          <li
            key={step.id}
            aria-current={index === currentIndex ? "step" : undefined}
            className="flex min-w-24 flex-1 flex-col gap-1.5"
          >
            <div className="flex items-center">
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border text-caption font-semibold",
                  done && "border-success bg-success text-on-primary",
                  active && "border-primary bg-primary text-on-primary",
                  failed && "border-error bg-error text-on-primary",
                  !done && !active && !failed && "border-border bg-surface text-fg-muted",
                )}
              >
                {done ? <Check className="size-3.5" /> : failed ? <X className="size-3.5" /> : index + 1}
              </span>
              {index < lastIndex && (
                <span aria-hidden className={cn("mx-2 h-px flex-1", index < currentIndex ? "bg-success" : "bg-border")} />
              )}
            </div>
            <span className={cn("pr-2 text-caption font-medium", index === currentIndex ? "text-fg" : "text-fg-muted")}>
              {failed ? failedLabel : step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
