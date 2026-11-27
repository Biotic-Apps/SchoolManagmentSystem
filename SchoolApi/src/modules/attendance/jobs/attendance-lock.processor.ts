import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import { formatDate, parseDate } from '../../../core/common/dates';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { JobScheduler } from '../../../core/jobs/job-scheduler';
import { QUEUES } from '../../../core/jobs/queues';
import { schoolDate } from '../../../core/common/school-time';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { BranchDailyJob } from '../../school-day/branch-daily-job';
import { WorkingDayService } from '../../school-day/working-day.service';
import { isPastLock, RegisterLockPolicy } from '../register-lock';

export const ATTENDANCE_LOCK_JOB = 'attendance.lock';

/**
 * Every run: locks SUBMITTED registers of earlier days, and of today once the
 * branch's `attendance.lockTime` passed (so a register submitted after the
 * lock time is locked on the next run, not the next day). Once a day after
 * the lock time it tells class teachers (and the principal) which sections
 * are still unmarked.
 */
@Injectable()
export class AttendanceLockProcessor
  implements JobProcessor, OnModuleInit, OnApplicationBootstrap
{
  readonly queue = QUEUES.MAINTENANCE;
  readonly name = ATTENDANCE_LOCK_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly scheduler: JobScheduler,
    private readonly prisma: PrismaService,
    private readonly daily: BranchDailyJob,
    private readonly lock: RegisterLockPolicy,
    private readonly workingDays: WorkingDayService,
    private readonly notifications: NotificationService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  onApplicationBootstrap(): Promise<void> {
    return this.scheduler.schedule({
      queue: this.queue,
      name: this.name,
      cron: '*/5 * * * *',
    });
  }

  process(): Promise<void> {
    return this.run(new Date());
  }

  async run(now: Date): Promise<void> {
    const day = parseDate(schoolDate(now));
    for (const branch of await this.daily.activeBranches()) {
      const lockTime = await this.lock.lockTime(branch.id);
      const todayLocked = isPastLock(day, lockTime, now);
      await this.prisma.attendanceRegister.updateMany({
        where: {
          branchId: branch.id,
          status: 'SUBMITTED',
          date: todayLocked ? { lte: day } : { lt: day },
        },
        data: { status: 'LOCKED', lockedAt: new Date() },
      });
      if (!(await this.daily.claim(branch.id, this.name, day, lockTime, now)))
        continue;
      if (await this.workingDays.isWorkingDay(branch.id, day))
        await this.notifyUnmarked(branch.id, branch.principalUserId, day);
    }
  }

  private async notifyUnmarked(
    branchId: string,
    principalUserId: string | null,
    day: Date,
  ): Promise<void> {
    const sections = await this.prisma.section.findMany({
      where: {
        branchId,
        status: 'ACTIVE',
        session: { status: 'ACTIVE' },
        enrollments: { some: { status: 'ACTIVE' } },
        attendanceRegisters: {
          none: { date: day, status: { in: ['SUBMITTED', 'LOCKED'] } },
        },
      },
      select: {
        id: true,
        name: true,
        schoolClass: { select: { name: true } },
        classTeacher: { select: { userId: true } },
      },
    });
    const date = formatDate(day);
    for (const section of sections) {
      const label = `${section.schoolClass.name}-${section.name}`;
      await this.notifications.notify({
        userIds: section.classTeacher?.userId
          ? [section.classTeacher.userId]
          : [],
        category: 'ATTENDANCE',
        title: 'Attendance not submitted',
        body: `Attendance for ${label} on ${date} is still unmarked.`,
        data: { sectionId: section.id, date },
      });
    }
    if (principalUserId && sections.length > 0) {
      await this.notifications.notify({
        userIds: [principalUserId],
        category: 'ATTENDANCE',
        title: `${sections.length} sections unmarked`,
        body: sections.map((s) => `${s.schoolClass.name}-${s.name}`).join(', '),
        data: { branchId, date, unmarked: sections.length },
      });
    }
  }
}
