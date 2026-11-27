import { parseDate } from './dates';
import { assertNotFuture, assertNotPastDay, onSchoolDay } from './time-checks';

// 27-Nov-2026 00:30 in Karachi is still 26-Nov in UTC.
const NOW = new Date('2026-11-26T19:30:00.000Z');

describe('time checks (school day in Asia/Karachi)', () => {
  it('rejects a date before the school day, using the school time zone', () => {
    expect(() => assertNotPastDay('2026-11-26', 'Date', NOW)).toThrow(
      'Date cannot be in the past',
    );
    expect(() => assertNotPastDay('2026-11-27', 'Date', NOW)).not.toThrow();
    expect(() => assertNotPastDay('2026-12-02', 'Date', NOW)).not.toThrow();
  });

  it('rejects instants in the future beyond the clock-skew allowance', () => {
    const later = (ms: number) => new Date(NOW.getTime() + ms);
    expect(() => assertNotFuture(later(60_000), 'Time', NOW)).not.toThrow();
    expect(() => assertNotFuture(later(6 * 60_000), 'Time', NOW)).toThrow(
      'Time cannot be in the future',
    );
    expect(() =>
      assertNotFuture(new Date('2027-05-01T10:00:00+05:00'), 'Time', NOW),
    ).toThrow();
  });

  it('matches an instant to the school day it falls on', () => {
    expect(onSchoolDay(parseDate('2026-11-27'), NOW)).toBe(true);
    expect(onSchoolDay(parseDate('2026-11-26'), NOW)).toBe(false);
    expect(onSchoolDay(parseDate('2026-11-28'), NOW)).toBe(false);
  });
});
