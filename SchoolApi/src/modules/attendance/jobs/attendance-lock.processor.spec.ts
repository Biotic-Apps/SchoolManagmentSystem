import type { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import type { JobScheduler } from '../../../core/jobs/job-scheduler';
import type { NotificationService } from '../../../core/notifications/notification.service';
import type { PrismaService } from '../../../core/prisma/prisma.service';
import type { BranchDailyJob } from '../../school-day/branch-daily-job';
import type { WorkingDayService } from '../../school-day/working-day.service';
import type { RegisterLockPolicy } from '../register-lock';
import { AttendanceLockProcessor } from './attendance-lock.processor';

function setup() {
  const prisma = {
    attendanceRegister: { updateMany: jest.fn() },
    section: { findMany: jest.fn().mockResolvedValue([]) },
  };
  const daily = {
    activeBranches: jest
      .fn()
      .mockResolvedValue([{ id: 'b', principalUserId: null }]),
    // Already claimed today: the unmarked notice went out earlier.
    claim: jest.fn().mockResolvedValue(false),
  };
  const processor = new AttendanceLockProcessor(
    {} as JobProcessorRegistry,
    {} as JobScheduler,
    prisma as unknown as PrismaService,
    daily as unknown as BranchDailyJob,
    {
      lockTime: jest.fn().mockResolvedValue('10:30'),
    } as unknown as RegisterLockPolicy,
    { isWorkingDay: jest.fn() } as unknown as WorkingDayService,
    {} as NotificationService,
  );
  return { processor, prisma };
}

const lockedDates = (prisma: ReturnType<typeof setup>['prisma']) =>
  (
    prisma.attendanceRegister.updateMany.mock.calls[0] as [
      { where: { date: unknown } },
    ]
  )[0].where.date;

describe('AttendanceLockProcessor', () => {
  it('before the lock time only locks earlier days', async () => {
    const { processor, prisma } = setup();
    await processor.run(new Date('2026-11-27T05:00:00Z')); // 10:00 PKT
    expect(lockedDates(prisma)).toEqual({
      lt: new Date('2026-11-27T00:00:00Z'),
    });
  });

  it('keeps locking today on every run after the lock time, not just the first', async () => {
    const { processor, prisma } = setup();
    await processor.run(new Date('2026-11-27T14:20:00Z')); // 19:20 PKT
    expect(lockedDates(prisma)).toEqual({
      lte: new Date('2026-11-27T00:00:00Z'),
    });
  });
});
