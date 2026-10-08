import { cellKey } from "./grid";
import type { Conflict, ConflictSeverity } from "./types";

export interface CellMark {
  severity: ConflictSeverity;
  message: string;
}

/** Older APIs send no severity: everything blocks publishing then. */
export const severityOf = (conflict: Conflict): ConflictSeverity => conflict.severity ?? "error";

/** Conflicts per grid cell; an error outranks warnings, messages are joined for the tooltip. */
export function conflictMarks(conflicts: Conflict[]): Map<string, CellMark> {
  const marks = new Map<string, CellMark>();
  for (const conflict of conflicts) {
    if (!conflict.day || !conflict.periodIndex) continue;
    const key = cellKey(conflict.day, conflict.periodIndex);
    const current = marks.get(key);
    const severity = current?.severity === "error" ? "error" : severityOf(conflict);
    marks.set(key, { severity, message: current ? `${current.message} · ${conflict.message}` : conflict.message });
  }
  return marks;
}
