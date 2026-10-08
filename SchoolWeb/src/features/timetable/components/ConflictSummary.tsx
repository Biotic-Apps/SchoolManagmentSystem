import { InlineNotice } from "@/components/shared/InlineNotice";
import { severityOf } from "../conflict-marks";
import { conflictLabel, dayName } from "../options";
import type { Conflict } from "../types";

function where(conflict: Conflict): string {
  return conflict.day ? `${dayName(conflict.day)}: ` : "";
}

/** Live list of clashes: errors block publishing, warnings don't. Cells are marked in the grid as well. */
export function ConflictSummary({ conflicts }: { conflicts: Conflict[] }) {
  if (conflicts.length === 0) return null;
  const errors = conflicts.filter((conflict) => severityOf(conflict) === "error");
  const warnings = conflicts.filter((conflict) => severityOf(conflict) === "warning");
  return (
    <InlineNotice tone={errors.length ? "error" : "warning"}>
      <details>
        <summary className="cursor-pointer font-medium">
          {errors.length > 0 && `${errors.length} to fix before publishing`}
          {errors.length > 0 && warnings.length > 0 && " · "}
          {warnings.length > 0 && `${warnings.length} warning${warnings.length === 1 ? "" : "s"}`}
          <span className="font-normal"> (show)</span>
        </summary>
        <ul className="mt-1 flex list-disc flex-col gap-1 pl-4">
          {[...errors, ...warnings].map((conflict, index) => (
            <li key={`${conflict.type}-${conflict.day}-${conflict.periodIndex}-${index}`}>
              <span className="font-medium">{where(conflict)}</span>
              {conflict.message || conflictLabel(conflict.type)}
            </li>
          ))}
        </ul>
      </details>
    </InlineNotice>
  );
}
