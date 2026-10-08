import { invalid } from '../../../core/common/errors/errors';
import type { BellRowInput } from './bell-schedule';

export interface BellDayPlan {
  periodMinutes?: number;
  periodsPerDay?: number;
  breakMinutes?: number;
}

/** The wizard's `bellSchedule` object (academics-timetable-contract §5.1). */
export interface BellPlan {
  startTime?: string;
  periodMinutes?: number;
  periodsPerDay?: number;
  /** 0 = no break. */
  breakAfter?: number;
  breakMinutes?: number;
  /** Shorter Friday; `breakAfter` is reused. */
  friday?: BellDayPlan | null;
}

export const DEFAULT_BELL = {
  startTime: '08:00',
  periodMinutes: 40,
  periodsPerDay: 8,
  breakAfter: 4,
  breakMinutes: 30,
  friday: { periodMinutes: 35, periodsPerDay: 6, breakMinutes: 15 },
} as const;

const FRIDAY = 5;
const DAY_END = 23 * 60 + 59;

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};
const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

interface DayShape {
  start: number;
  periodMinutes: number;
  periodsPerDay: number;
  breakAfter: number;
  breakMinutes: number;
}

function generateDay(shape: DayShape, field: string): BellRowInput[] {
  const rows: BellRowInput[] = [];
  let at = shape.start;
  const push = (minutes: number, isBreak: boolean) => {
    if (at + minutes > DAY_END) {
      const message = `${field} ends after 23:59`;
      throw invalid(message, [message]);
    }
    rows.push({
      index: rows.length + 1,
      startTime: toTime(at),
      endTime: toTime(at + minutes),
      isBreak,
      label: isBreak ? 'Break' : null,
    });
    at += minutes;
  };
  for (let p = 1; p <= shape.periodsPerDay; p++) {
    push(shape.periodMinutes, false);
    const breakHere =
      shape.breakAfter === p &&
      p < shape.periodsPerDay &&
      shape.breakMinutes > 0;
    if (breakHere) push(shape.breakMinutes, true);
  }
  return rows;
}

/**
 * Default schedule (day 0) plus a Friday variant when asked for and Friday is
 * a working day. Shared by school setup and the bell-schedule preview.
 */
export function generateBellSchedule(
  plan: BellPlan = {},
  workingDays: readonly number[] = [1, 2, 3, 4, 5, 6],
  field = 'bellSchedule',
): { default: BellRowInput[]; days: Record<string, BellRowInput[]> } {
  const base: DayShape = {
    start: toMinutes(plan.startTime ?? DEFAULT_BELL.startTime),
    periodMinutes: plan.periodMinutes ?? DEFAULT_BELL.periodMinutes,
    periodsPerDay: plan.periodsPerDay ?? DEFAULT_BELL.periodsPerDay,
    breakAfter: plan.breakAfter ?? DEFAULT_BELL.breakAfter,
    breakMinutes: plan.breakMinutes ?? DEFAULT_BELL.breakMinutes,
  };
  if (base.breakAfter >= base.periodsPerDay) {
    const message = `${field}.breakAfter must be less than periodsPerDay`;
    throw invalid(message, [message]);
  }
  const days: Record<string, BellRowInput[]> = {};
  if (plan.friday && workingDays.includes(FRIDAY)) {
    days[String(FRIDAY)] = generateDay(
      {
        ...base,
        periodMinutes: plan.friday.periodMinutes ?? base.periodMinutes,
        periodsPerDay: plan.friday.periodsPerDay ?? base.periodsPerDay,
        breakMinutes: plan.friday.breakMinutes ?? base.breakMinutes,
      },
      `${field}.friday`,
    );
  }
  return { default: generateDay(base, field), days };
}
