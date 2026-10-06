import { useMemo, useState } from "react";
import { ApiError } from "@/lib/api-error";
import { conflictKeys, type GridRow } from "./grid";
import { conflictLabel, dayName } from "./options";
import type { Conflict } from "./types";

/** Publish answers 409 CONFLICT with `details.conflicts`; anything else is not a conflict list. */
export function conflictsFromError(error: unknown): Conflict[] | null {
  if (!(error instanceof ApiError) || error.code !== "CONFLICT") return null;
  const details = error.details as { conflicts?: unknown } | Conflict[] | undefined;
  const list = Array.isArray(details) ? details : details?.conflicts;
  return Array.isArray(list) ? (list as Conflict[]) : null;
}

export interface ConflictItem {
  id: string;
  where: string;
  type: string;
  message: string;
}

export function useConflicts(rows: GridRow[]) {
  const [list, setList] = useState<Conflict[] | null>(null);
  const keys = useMemo(() => conflictKeys(list ?? []), [list]);
  const items: ConflictItem[] = useMemo(
    () =>
      (list ?? []).map((conflict, index) => {
        const row = rows.find((item) => item.periodIndex === conflict.periodIndex);
        return {
          id: `${conflict.type}-${conflict.day}-${conflict.periodIndex}-${index}`,
          where: `${dayName(conflict.day)} · Period ${conflict.periodIndex}${row ? ` (${row.time})` : ""}`,
          type: conflictLabel(conflict.type),
          message: conflict.message,
        };
      }),
    [list, rows],
  );

  return {
    checked: list !== null,
    items,
    keys,
    set: setList,
    clear: () => setList(null),
    /** Returns true when the error carried a conflict list. */
    fromError: (error: unknown) => {
      const conflicts = conflictsFromError(error);
      if (conflicts) setList(conflicts);
      return !!conflicts;
    },
  };
}

export type ConflictsState = ReturnType<typeof useConflicts>;
