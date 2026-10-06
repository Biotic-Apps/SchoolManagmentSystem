import type { FeeFrequency } from '../../../generated/prisma/client';
import { dayInPeriod, monthsBetween } from '../../finance-core/period';
import type { PlanItem } from '../shared/plan-snapshot';

/** Billing calendar of a session: its start month and term start months. */
export interface BillingCalendar {
  sessionStart: string;
  termStarts: string[];
}

export const DEFAULT_DUE_DAY = 10;

const quarterly = (period: string, sessionStart: string): boolean => {
  const months = monthsBetween(sessionStart, period);
  return months >= 0 && months % 3 === 0;
};

/**
 * Whether an item of `frequency` is billed in `period`:
 * MONTHLY every month; QUARTERLY in the session start month and every 3 months
 * after; TERM in months a term starts (no terms → quarterly); YEARLY in the
 * session start month; ONCE always (the caller drops heads already billed).
 */
export function isDueInPeriod(
  frequency: FeeFrequency,
  period: string,
  calendar: BillingCalendar,
): boolean {
  switch (frequency) {
    case 'MONTHLY':
    case 'ONCE':
      return true;
    case 'QUARTERLY':
      return quarterly(period, calendar.sessionStart);
    case 'TERM':
      return calendar.termStarts.length > 0
        ? calendar.termStarts.includes(period)
        : quarterly(period, calendar.sessionStart);
    case 'YEARLY':
      return period === calendar.sessionStart;
  }
}

/**
 * Plan items billed in `period`. ONCE items whose fee head the student was
 * already billed in this session (`onceBilledHeadIds`) are left out.
 */
export function dueItems(
  items: readonly PlanItem[],
  period: string,
  calendar: BillingCalendar,
  onceBilledHeadIds: ReadonlySet<string> = new Set(),
): PlanItem[] {
  return items.filter(
    (item) =>
      isDueInPeriod(item.frequency, period, calendar) &&
      !(item.frequency === 'ONCE' && onceBilledHeadIds.has(item.feeHeadId)),
  );
}

/** Earliest due day of the billed items in the period (default day 10). */
export function invoiceDueDate(
  items: readonly PlanItem[],
  period: string,
): Date {
  const day =
    items.length > 0
      ? Math.min(...items.map((item) => item.dueDay))
      : DEFAULT_DUE_DAY;
  return dayInPeriod(period, day);
}
