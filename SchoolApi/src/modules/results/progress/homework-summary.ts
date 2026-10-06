import type { HomeworkCompletion } from '../../../generated/prisma/client';

export interface HomeworkTally {
  total: number;
  done: number;
  partial: number;
  notDone: number;
  unmarked: number;
}

/** Counts per status of a student's homework items. */
export function summarizeHomework(
  statuses: readonly (HomeworkCompletion | null)[],
): HomeworkTally {
  const tally: HomeworkTally = {
    total: statuses.length,
    done: 0,
    partial: 0,
    notDone: 0,
    unmarked: 0,
  };
  for (const status of statuses) {
    if (status === 'DONE') tally.done++;
    else if (status === 'PARTIAL') tally.partial++;
    else if (status === 'NOT_DONE') tally.notDone++;
    else tally.unmarked++;
  }
  return tally;
}

/** Default window: last 30 days; at most 366 days. */
export function homeworkRange(
  today: string,
  from?: string,
  to?: string,
): { from: string; to: string } | null {
  const end = to ?? today;
  const start = from ?? shiftDays(end, -30);
  if (start > end) return null;
  if (shiftDays(start, 366) < end) return null;
  return { from: start, to: end };
}

export function shiftDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
