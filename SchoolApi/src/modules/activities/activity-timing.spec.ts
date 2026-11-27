import { parseDate } from '../../core/common/dates';
import { assertActivityTimes, assertStatusTiming } from './activity-timing';

const now = new Date('2026-11-27T09:00:00Z'); // 14:00 PKT
const start = new Date('2026-12-05T04:00:00Z'); // 09:00 PKT
const end = new Date('2026-12-05T08:00:00Z');

describe('assertActivityTimes', () => {
  it('accepts a future activity with a deadline before it', () => {
    expect(() =>
      assertActivityTimes(start, end, parseDate('2026-12-01'), {
        isNew: true,
        now,
      }),
    ).not.toThrow();
  });

  it('rejects a consent deadline after the start date', () => {
    expect(() =>
      assertActivityTimes(start, end, parseDate('2026-12-20'), {
        isNew: true,
        now,
      }),
    ).toThrow('consentDeadline must be on or before');
  });

  it('rejects a new activity on a day already past, and end before start', () => {
    const past = new Date('2025-01-01T04:00:00Z');
    expect(() =>
      assertActivityTimes(past, past, null, { isNew: true, now }),
    ).toThrow('already passed');
    expect(() =>
      assertActivityTimes(end, start, null, { isNew: true, now }),
    ).toThrow('endAt must not be before startAt');
  });
});

describe('assertStatusTiming', () => {
  it('refuses ONGOING / COMPLETED before the start', () => {
    expect(() => assertStatusTiming('ONGOING', start, now)).toThrow(
      'cannot be ongoing',
    );
    expect(() => assertStatusTiming('COMPLETED', start, now)).toThrow();
    expect(() => assertStatusTiming('CANCELLED', start, now)).not.toThrow();
    expect(() =>
      assertStatusTiming('ONGOING', start, new Date('2026-12-05T05:00:00Z')),
    ).not.toThrow();
  });
});
