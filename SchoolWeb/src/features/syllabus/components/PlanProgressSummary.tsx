import { ProgressBar } from "@/components/shared/ProgressBar";
import { coverageTone } from "../options";
import type { PlanProgress } from "../types";

/** Overall progress bar with completed / total and the delayed count. */
export function PlanProgressSummary({ progress, label }: { progress: PlanProgress; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <ProgressBar percent={progress.percent} label={label} tone={coverageTone(progress.percent)} />
      <p className="text-caption text-fg-muted">
        {progress.completed} of {progress.total} topics completed
        {progress.delayed > 0 && <span className="text-warning"> · {progress.delayed} delayed</span>}
      </p>
    </div>
  );
}
