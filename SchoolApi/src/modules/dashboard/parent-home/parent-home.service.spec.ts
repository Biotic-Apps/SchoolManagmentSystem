import { formatDate } from '../../../core/common/dates';
import type { AuthUser } from '../../../core/common/types/auth-user';
import { today } from '../../../core/common/week';
import type { PrismaService } from '../../../core/prisma/prisma.service';
import type { Scope } from '../../../core/rbac/scope/scope';
import type { DiaryService } from '../../diary/diary.service';
import type { FeeSummaryService } from '../../fees/student-fees/fee-summary.service';
import type { StudentPlacementService } from '../../school-day/student-placement.service';
import type { WeekViewService } from '../../timetable/week-view.service';
import type { ParentHomeChildReader } from './parent-home-child.reader';
import type { ParentHomeEventsReader } from './parent-home-events.reader';
import type { ParentHomeStatsReader } from './parent-home-stats.reader';
import { ParentHomeService } from './parent-home.service';

const parent = (permissions: string[]): AuthUser => ({
  id: 'parent-1',
  sessionId: 's',
  tokenVersion: 0,
  activeRole: 'PARENT',
  roles: ['PARENT'],
  permissions: new Set(permissions),
  assignments: [],
});

const guardianScope = (children: string[]) =>
  ({
    guardian: true,
    canAccessStudent: (id: string) => children.includes(id),
  }) as unknown as Scope;

const slot = (date: string, startTime: string) => ({ date, startTime });

function setup() {
  const date = formatDate(today());
  const placement = {
    read: jest.fn().mockResolvedValue({
      studentId: 'kid-1',
      schoolId: 'school-1',
      branchId: 'branch-1',
      sectionId: 'section-1',
    }),
  };
  const childReader = { read: jest.fn().mockResolvedValue({ id: 'kid-1' }) };
  const stats = {
    attendance: jest.fn().mockResolvedValue({ today: 'PRESENT' }),
    latestResult: jest.fn().mockResolvedValue(null),
    homework: jest.fn().mockResolvedValue({ dueCount: 2, nextDueDate: date }),
  };
  const upcoming = {
    meetings: jest.fn().mockResolvedValue([]),
    events: jest.fn().mockResolvedValue({ events: [], consentsPending: 1 }),
  };
  const diary = {
    list: jest.fn().mockResolvedValue(Array.from({ length: 7 }, (_, i) => i)),
  };
  const weeks = {
    forMe: jest
      .fn()
      .mockResolvedValue([
        slot(date, '09:00'),
        slot('1999-01-01', '08:00'),
        slot(date, '08:00'),
      ]),
  };
  const fees = { summary: jest.fn().mockResolvedValue({ totalDueMinor: 500 }) };
  const prisma = {
    noticeRecipient: { findMany: jest.fn().mockResolvedValue([]) },
  };
  const service = new ParentHomeService(
    prisma as unknown as PrismaService,
    placement as unknown as StudentPlacementService,
    childReader as unknown as ParentHomeChildReader,
    stats as unknown as ParentHomeStatsReader,
    upcoming as unknown as ParentHomeEventsReader,
    diary as unknown as DiaryService,
    weeks as unknown as WeekViewService,
    fees as unknown as FeeSummaryService,
  );
  return { service, placement, fees, date };
}

const codeOf = (p: Promise<unknown>) =>
  p.then(
    () => 'resolved',
    (e: { code?: string }) => e.code,
  );

describe('ParentHomeService', () => {
  it('is not found for staff (no guardian scope)', async () => {
    const { service, placement } = setup();
    const staff = { guardian: false } as unknown as Scope;
    expect(await codeOf(service.home(parent([]), staff, 'kid-1'))).toBe(
      'NOT_FOUND',
    );
    expect(placement.read).not.toHaveBeenCalled();
  });

  it('is not found for a child that is not linked to the parent', async () => {
    const { service, placement } = setup();
    const scope = guardianScope(['kid-2']);
    expect(await codeOf(service.home(parent([]), scope, 'kid-1'))).toBe(
      'NOT_FOUND',
    );
    expect(placement.read).not.toHaveBeenCalled();
  });

  it("assembles the verified child's home: today's periods in order, 5 diary entries", async () => {
    const { service, fees, date } = setup();
    const home = await service.home(
      parent(['fees.view']),
      guardianScope(['kid-1']),
      'kid-1',
    );
    expect(home.todayPeriods).toEqual([
      slot(date, '08:00'),
      slot(date, '09:00'),
    ]);
    expect(home.diary).toHaveLength(5);
    expect(home.fees).toEqual({ totalDueMinor: 500 });
    expect(home.homework.dueCount).toBe(2);
    expect(home.consentsPending).toBe(1);
    expect(fees.summary).toHaveBeenCalledTimes(1);
  });

  it('leaves fees out when the role cannot see fees', async () => {
    const { service, fees } = setup();
    const home = await service.home(
      parent([]),
      guardianScope(['kid-1']),
      'kid-1',
    );
    expect(home.fees).toBeNull();
    expect(fees.summary).not.toHaveBeenCalled();
  });
});
