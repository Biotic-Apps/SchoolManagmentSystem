import { parseDate } from '../../core/common/dates';
import { isPastLock } from './register-lock';

describe('isPastLock (Asia/Karachi wall clock)', () => {
  // 2026-11-27 10:29 / 10:30 PKT = 05:29 / 05:30 UTC.
  const before = new Date('2026-11-27T05:29:00Z');
  const at = new Date('2026-11-27T05:30:00Z');
  const day = parseDate('2026-11-27');

  it('locks today only once the branch lock time is reached', () => {
    expect(isPastLock(day, '10:30', before)).toBe(false);
    expect(isPastLock(day, '10:30', at)).toBe(true);
    expect(isPastLock(day, '19:00', at)).toBe(false);
  });

  it('always locks earlier days and never later ones', () => {
    expect(isPastLock(parseDate('2026-11-26'), '23:59', before)).toBe(true);
    expect(isPastLock(parseDate('2026-11-28'), '00:00', at)).toBe(false);
  });

  it('uses the school date, not UTC (00:30 PKT is still the previous UTC day)', () => {
    const earlyMorning = new Date('2026-11-27T19:30:00Z'); // 28-Nov 00:30 PKT
    expect(isPastLock(parseDate('2026-11-28'), '10:30', earlyMorning)).toBe(
      false,
    );
    expect(isPastLock(parseDate('2026-11-27'), '23:00', earlyMorning)).toBe(
      true,
    );
  });
});
