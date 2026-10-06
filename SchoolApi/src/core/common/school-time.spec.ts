import { schoolDate, schoolDateTime, schoolTime } from './school-time';

const KARACHI = 'Asia/Karachi';

describe('school-time', () => {
  it('uses the school date, not UTC, before 05:00 local', () => {
    const utc = new Date('2026-10-06T21:30:00.000Z'); // 02:30 on 7 Oct in Karachi
    expect(schoolDate(utc, KARACHI)).toBe('2026-10-07');
    expect(schoolTime(utc, KARACHI)).toBe('02:30');
  });

  it('converts a school wall time to the right instant', () => {
    expect(schoolDateTime('2026-10-07', '08:00', KARACHI).toISOString()).toBe(
      '2026-10-07T03:00:00.000Z',
    );
  });

  it('round-trips date and time', () => {
    const instant = schoolDateTime('2026-10-07', '11:45', KARACHI);
    expect(schoolDate(instant, KARACHI)).toBe('2026-10-07');
    expect(schoolTime(instant, KARACHI)).toBe('11:45');
  });
});
