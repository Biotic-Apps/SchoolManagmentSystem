import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import { formatDate } from '../../../core/common/dates';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { JobScheduler } from '../../../core/jobs/job-scheduler';
import { QUEUES } from '../../../core/jobs/queues';
import { today } from '../../../core/common/week';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { BranchSettingsReader } from '../../branches/settings/branch-settings.reader';
import { BranchDailyJob } from '../../school-day/branch-daily-job';
import { WorkingDayService } from '../../school-day/working-day.service';

export const ATTENDANCE_LOCK_JOB = 'attendance.lock';

/**
 * At each branch's `attendance.lockTime`: locks submitted registers and tells
 * class teachers (and the principal) which sections are still unmarked.
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
    private readonly settings: BranchSettingsReader,
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

  async process(): Promise<void> {
    const day = today();
    for (const branch of await this.daily.activeBranches()) {
      const lockTime = await this.settings.get<string>(
        branch.id,
        'attendance.lockTime',
      );
      if (!(await this.daily.claim(branch.id, this.name, day, lockTime)))
        continue;
      await this.prisma.attendanceRegister.updateMany({
        where: { branchId: branch.id, status: 'SUBMITTED', date: { lte: day } },
        data: { status: 'LOCKED', lockedAt: new Date() },
      });
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
