import {
  addMonths,
  dayInPeriod,
  monthsBetween,
  periodOf,
} from '../../finance-core/period';

export interface RecurringTemplate {
  recurringMonthly: boolean;
  recurringUntil: string | null;
  billDate: Date;
  dueDate: Date | null;
}

/**
 * A template is due for `month` (YYYY-MM) when it recurs monthly, the month is
 * after the template's own bill month and not after `recurringUntil`.
 */
export function isDueForMonth(
  template: RecurringTemplate,
  month: string,
): boolean {
  if (!template.recurringMonthly) return false;
  if (month <= periodOf(template.billDate)) return false;
  return template.recurringUntil === null || month <= template.recurringUntil;
}

export function dueTemplates<T extends RecurringTemplate>(
  templates: readonly T[],
  month: string,
): T[] {
  return templates.filter((t) => isDueForMonth(t, month));
}

/** Bill and due dates of the copy: same day of month, clamped to month end. */
export function copyDates(
  template: RecurringTemplate,
  month: string,
): { billDate: Date; dueDate: Date | null } {
  const shift = monthsBetween(periodOf(template.billDate), month);
  const billDate = dayInPeriod(month, template.billDate.getUTCDate());
  const dueDate = template.dueDate
    ? dayInPeriod(
        addMonths(periodOf(template.dueDate), shift),
        template.dueDate.getUTCDate(),
      )
    : null;
  return { billDate, dueDate };
}
