import { useMemo } from "react";
import { usePeriods } from "./api";
import { periodRows } from "./grid";

/** Branch bell schedule; the editor remounts (editorKey) when saved periods change. */
export function useBellSchedule(branchId: string) {
  const query = usePeriods(branchId);
  const periods = useMemo(() => query.data ?? [], [query.data]);
  const rows = useMemo(() => periodRows(periods), [periods]);
  const editorKey = `${branchId}-${query.dataUpdatedAt}`;
  return { query, periods, rows, editorKey };
}
