import {
  homeworkRange,
  shiftDays,
  summarizeHomework,
} from './homework-summary';

describe('homework summary', () => {
  it('counts statuses', () => {
    expect(
      summarizeHomework(['DONE', 'DONE', 'PARTIAL', 'NOT_DONE', null]),
    ).toEqual({
      total: 5,
      done: 2,
      partial: 1,
      notDone: 1,
      unmarked: 1,
    });
  });

  it('defaults and limits the range', () => {
    expect(homeworkRange('2026-10-06')).toEqual({
      from: '2026-09-06',
      to: '2026-10-06',
    });
    expect(homeworkRange('2026-10-06', '2026-10-01', '2026-10-02')).toEqual({
      from: '2026-10-01',
      to: '2026-10-02',
    });
    expect(homeworkRange('2026-10-06', '2026-10-05', '2026-10-01')).toBeNull();
    expect(homeworkRange('2026-10-06', '2025-01-01', '2026-10-01')).toBeNull();
    expect(shiftDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});
