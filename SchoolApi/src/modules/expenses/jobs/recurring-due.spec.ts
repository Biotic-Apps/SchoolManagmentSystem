import { parseDate } from '../../../core/common/dates';
import { copyDates, dueTemplates, isDueForMonth } from './recurring-due';

const template = (until: string | null, monthly = true) => ({
  recurringMonthly: monthly,
  recurringUntil: until,
  billDate: parseDate('2026-01-31'),
  dueDate: parseDate('2026-02-05'),
});

describe('recurring expenses', () => {
  it('is due for months after the bill month up to untilMonth', () => {
    const t = template('2026-04');
    expect(isDueForMonth(t, '2026-01')).toBe(false);
    expect(isDueForMonth(t, '2026-02')).toBe(true);
    expect(isDueForMonth(t, '2026-04')).toBe(true);
    expect(isDueForMonth(t, '2026-05')).toBe(false);
  });

  it('runs forever without untilMonth and never when not monthly', () => {
    expect(isDueForMonth(template(null), '2030-12')).toBe(true);
    expect(isDueForMonth(template(null, false), '2026-03')).toBe(false);
  });

  it('filters due templates', () => {
    const list = [template('2026-02'), template(null), template(null, false)];
    expect(dueTemplates(list, '2026-03')).toEqual([list[1]]);
  });

  it('copies dates into the month, clamped to its last day', () => {
    const dates = copyDates(template(null), '2026-02');
    expect(dates.billDate).toEqual(parseDate('2026-02-28'));
    expect(dates.dueDate).toEqual(parseDate('2026-03-05'));
  });
});
