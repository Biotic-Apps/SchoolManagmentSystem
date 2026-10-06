import { useState } from "react";
import { mondayOf, shiftWeek, weekLabel } from "./week-dates";

/** Week navigation; `weekOf` is the Monday of the shown week as "YYYY-MM-DD". */
export function useWeek() {
  const [current] = useState(() => mondayOf(new Date()));
  const [weekOf, setWeekOf] = useState(current);

  return {
    weekOf,
    label: weekLabel(weekOf),
    isThisWeek: weekOf === current,
    prev: () => setWeekOf((value) => shiftWeek(value, -1)),
    next: () => setWeekOf((value) => shiftWeek(value, 1)),
    thisWeek: () => setWeekOf(current),
  };
}

export type WeekNavState = ReturnType<typeof useWeek>;
