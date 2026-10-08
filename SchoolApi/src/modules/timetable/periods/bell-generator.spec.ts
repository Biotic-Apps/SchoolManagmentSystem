import { DEFAULT_BELL, generateBellSchedule } from './bell-generator';
import { groupSchedule, numberPeriods, rowsForDay } from './bell-schedule';

describe('generateBellSchedule', () => {
  it('builds the contract default with a shorter Friday', () => {
    const { default: rows, days } = generateBellSchedule(DEFAULT_BELL);
    expect(rows).toHaveLength(9);
    expect(rows[4]).toMatchObject({
      index: 5,
      startTime: '10:40',
      endTime: '11:10',
      isBreak: true,
      label: 'Break',
    });
    expect(rows.at(-1)?.endTime).toBe('13:50');
    expect(days['5'][3].endTime).toBe('10:20');
    expect(days['5'][4]).toMatchObject({ startTime: '10:20', isBreak: true });
    expect(days['5'].at(-1)?.endTime).toBe('11:45');
  });

  it('skips Friday when it is not a working day and supports no break', () => {
    const result = generateBellSchedule(
      { ...DEFAULT_BELL, breakAfter: 0 },
      [1, 2, 3, 4, 6],
    );
    expect(result.days).toEqual({});
    expect(result.default.some((r) => r.isBreak)).toBe(false);
  });

  it('rejects a day that runs past midnight or a break after the last period', () => {
    expect(() =>
      generateBellSchedule({ startTime: '22:00', periodsPerDay: 8 }),
    ).toThrow(/ends after 23:59/);
    expect(() =>
      generateBellSchedule({ periodsPerDay: 4, breakAfter: 4 }),
    ).toThrow(/breakAfter/);
  });
});

describe('bell schedule helpers', () => {
  const row = (day: number, index: number, isBreak = false) => ({
    day,
    index,
    startTime: `0${index}:00`,
    endTime: `0${index}:30`,
    isBreak,
    label: isBreak ? null : 'english',
  });

  it('numbers teaching periods and hides labels on them', () => {
    const numbered = numberPeriods([row(0, 1), row(0, 2, true), row(0, 3)]);
    expect(numbered.map((p) => [p.number, p.label])).toEqual([
      [1, null],
      [null, 'Break'],
      [2, null],
    ]);
  });

  it('uses a weekday variant when present, else the default', () => {
    const rows = [row(0, 1), row(0, 2), row(5, 1)];
    expect(rowsForDay(rows, 5)).toHaveLength(1);
    expect(rowsForDay(rows, 1)).toHaveLength(2);
    expect(Object.keys(groupSchedule(rows).days)).toEqual(['5']);
  });
});
