import { parseDate } from '../../../core/common/dates';
import type { PrismaService } from '../../../core/prisma/prisma.service';
import { ParentHomeStatsReader } from './parent-home-stats.reader';

const entry = (date: string, status: string) => ({
  status,
  register: { date: parseDate(date) },
});

describe('ParentHomeStatsReader.attendance', () => {
  it("tallies this month's submitted marks and picks today's", async () => {
    const findMany = jest
      .fn()
      .mockResolvedValue([
        entry('2026-10-01', 'PRESENT'),
        entry('2026-10-02', 'ABSENT'),
        entry('2026-10-05', 'LATE'),
        entry('2026-10-06', 'LEAVE'),
        entry('2026-10-09', 'PRESENT'),
      ]);
    const prisma = { attendanceEntry: { findMany } };
    const reader = new ParentHomeStatsReader(
      prisma as unknown as PrismaService,
    );
    const result = await reader.attendance('kid-1', parseDate('2026-10-09'));
    expect(result.today).toBe('PRESENT');
    expect(result.month).toEqual({
      month: '2026-10',
      present: 2,
      absent: 1,
      late: 1,
      leave: 1,
      halfDay: 0,
      percent: 75,
    });
    type Args = {
      where: { register: { date: { gte: Date }; status: unknown } };
    };
    const [[{ where }]] = findMany.mock.calls as [[Args]];
    expect(where.register.date.gte).toEqual(parseDate('2026-10-01'));
    expect(where.register.status).toEqual({ in: ['SUBMITTED', 'LOCKED'] });
  });

  it('is UNMARKED today with no percent before any mark', async () => {
    const prisma = {
      attendanceEntry: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const reader = new ParentHomeStatsReader(
      prisma as unknown as PrismaService,
    );
    const result = await reader.attendance('kid-1', parseDate('2026-10-09'));
    expect(result.today).toBe('UNMARKED');
    expect(result.month.percent).toBeNull();
  });
});
