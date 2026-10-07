import { defaultSessionDates, resolveSession } from './session-defaults';
import { sectionNames } from './presets';

describe('session defaults (Asia/Karachi)', () => {
  it('uses the school year that started on 1 April', () => {
    expect(defaultSessionDates(new Date('2026-10-07T10:00:00Z'))).toEqual({
      name: '2026-27',
      startDate: '2026-04-01',
      endDate: '2027-03-31',
    });
    expect(defaultSessionDates(new Date('2027-02-15T10:00:00Z')).name).toBe(
      '2026-27',
    );
  });

  it('switches year on the Karachi calendar, not UTC', () => {
    // 31 March 20:00 UTC is already 1 April 01:00 in Karachi.
    expect(
      defaultSessionDates(new Date('2027-03-31T20:00:00Z')).startDate,
    ).toBe('2027-04-01');
  });

  it('fills a missing end date one year after the given start', () => {
    expect(resolveSession({ startDate: '2026-01-01' })).toEqual({
      name: '2026',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });
  });

  it('names sections A, B, …', () => {
    expect(sectionNames(1)).toEqual(['A']);
    expect(sectionNames(4)).toEqual(['A', 'B', 'C', 'D']);
  });
});
