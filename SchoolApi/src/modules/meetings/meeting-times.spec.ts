import { parseDate } from '../../core/common/dates';
import { assertMeetingStarted } from './meeting-times';

const MEETING = { date: parseDate('2026-12-02'), startTime: '13:00' };

describe('assertMeetingStarted (school time, Asia/Karachi)', () => {
  it('refuses before the meeting starts', () => {
    expect(() =>
      assertMeetingStarted(MEETING, new Date('2026-11-27T14:00:00.000Z')),
    ).toThrow('The meeting has not started yet');
    // 12:59 in Karachi (UTC+5).
    expect(() =>
      assertMeetingStarted(MEETING, new Date('2026-12-02T07:59:00.000Z')),
    ).toThrow('The meeting has not started yet');
  });

  it('allows it from the start time on', () => {
    expect(() =>
      assertMeetingStarted(MEETING, new Date('2026-12-02T08:00:00.000Z')),
    ).not.toThrow();
    expect(() =>
      assertMeetingStarted(MEETING, new Date('2026-12-05T08:00:00.000Z')),
    ).not.toThrow();
  });
});
