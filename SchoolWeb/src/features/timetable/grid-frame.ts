import { formatTimeRange } from "@/lib/time";
import { dayColumns, numberedPeriods, periodTitle, type GridDay, type GridRow } from "./grid";
import type { Period } from "./types";

export type CellKind = "lesson" | "break" | "none";

export interface CellInfo {
  kind: CellKind;
  /** Set when this day's time differs from the row's (e.g. a shorter Friday). */
  time?: string;
  label?: string;
}

export interface GridFrame {
  days: GridDay[];
  rows: GridRow[];
  info: (day: number, periodIndex: number) => CellInfo;
}

/**
 * Rows = every period index used by any day; row titles and times come from the default schedule.
 * A day with its own schedule shows its own times; an index that day doesn't have is "none".
 */
export function gridFrame(defaults: Period[], dayPeriods: Record<string, Period[]> | undefined, workingDays: number[]): GridFrame {
  const base = numberedPeriods(defaults);
  const own: Record<number, Period[]> = {};
  for (const day of workingDays) {
    const rows = dayPeriods?.[String(day)];
    if (rows?.length) own[day] = numberedPeriods(rows);
  }
  const scheduleOf = (day: number) => own[day] ?? base;
  const find = (day: number, index: number) => scheduleOf(day).find((period) => period.index === index);

  const indexes = [...new Set([...base, ...Object.values(own).flat()].map((period) => period.index))].sort((a, b) => a - b);
  const rows: GridRow[] = indexes.map((index) => {
    const period = base.find((item) => item.index === index) ?? Object.values(own).flat().find((item: Period) => item.index === index)!;
    const allBreak = workingDays.every((day) => find(day, index)?.isBreak);
    return {
      periodIndex: index,
      title: periodTitle(period),
      time: formatTimeRange(period.startTime, period.endTime),
      isBreak: allBreak,
    };
  });

  return {
    days: dayColumns(workingDays),
    rows,
    info: (day, index) => {
      const period = find(day, index);
      if (!period) return { kind: "none" };
      const time = formatTimeRange(period.startTime, period.endTime);
      const row = rows.find((item) => item.periodIndex === index);
      const caption = row && row.time !== time ? time : undefined;
      if (period.isBreak) return { kind: "break", label: periodTitle(period), time: caption };
      return { kind: "lesson", time: caption, label: periodTitle(period) };
    },
  };
}
