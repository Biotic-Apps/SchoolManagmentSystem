import { addMinutes } from "./time-math";

/** "8 periods of 40 minutes from 8:00, a 30-minute break after period 4" (contract §5.1). */
export interface BellSettings {
  startTime: string;
  periodMinutes: number;
  periodsPerDay: number;
  /** 0 = no break. */
  breakAfter: number;
  breakMinutes: number;
}

export interface BellRow {
  startTime: string;
  endTime: string;
  isBreak: boolean;
  label: string;
}

export const DEFAULT_BELL: BellSettings = { startTime: "08:00", periodMinutes: 40, periodsPerDay: 8, breakAfter: 4, breakMinutes: 30 };
export const DEFAULT_FRIDAY: Pick<BellSettings, "periodMinutes" | "periodsPerDay" | "breakMinutes"> = {
  periodMinutes: 35,
  periodsPerDay: 6,
  breakMinutes: 15,
};

/** Rows in order: teaching periods with one break after period `breakAfter`. */
export function generateBell({ startTime, periodMinutes, periodsPerDay, breakAfter, breakMinutes }: BellSettings): BellRow[] {
  const rows: BellRow[] = [];
  let time = startTime;
  for (let period = 1; period <= periodsPerDay; period += 1) {
    const endTime = addMinutes(time, periodMinutes);
    rows.push({ startTime: time, endTime, isBreak: false, label: "" });
    time = endTime;
    if (period === breakAfter && breakMinutes > 0 && period < periodsPerDay) {
      const breakEnd = addMinutes(time, breakMinutes);
      rows.push({ startTime: time, endTime: breakEnd, isBreak: true, label: "Break" });
      time = breakEnd;
    }
  }
  return rows;
}
