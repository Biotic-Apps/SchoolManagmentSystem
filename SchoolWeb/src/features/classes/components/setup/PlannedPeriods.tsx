import { cn } from "@/lib/cn";
import type { PlannedLine } from "../../setup/planned-periods";

interface PlannedPeriodsProps {
  lines: PlannedLine[];
  /** Teaching periods in a week from the bell schedule; null when there is none yet. */
  total: number | null;
}

/** "Periods planned: 44 of 46 teaching periods per week" (one line per group); warning colour when over. */
export function PlannedPeriods({ lines, total }: PlannedPeriodsProps) {
  return (
    <div className="flex flex-col gap-0.5 text-label" aria-live="polite">
      {lines.map((line) => {
        const over = total !== null && line.planned > total;
        return (
          <p key={line.group ?? "all"} className={cn(over ? "font-medium text-warning" : "text-fg-muted")}>
            {line.group ? `${line.group}: ` : "Periods planned: "}
            <span className="font-semibold tabular-nums">{line.planned}</span>
            {total !== null ? ` of ${total} teaching periods per week` : " per week (add a bell schedule to compare)"}
            {over && " (more than the week has)"}
          </p>
        );
      })}
    </div>
  );
}
