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
import { DiaryMissingService } from '../diary-missing.service';

export const DIARY_MISSING_JOB = 'diary.missingCheck';

/** At `diary.closingTime`: principal and teachers hear about missing diaries. */
@Injectable()
export class DiaryMissingCheckProcessor
  implements JobProcessor, OnModuleInit, OnApplicationBootstrap
{
  readonly queue = QUEUES.MAINTENANCE;
  readonly name = DIARY_MISSING_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly scheduler: JobScheduler,
    private readonly prisma: PrismaService,
    private readonly daily: BranchDailyJob,
    private readonly settings: BranchSettingsReader,
    private readonly workingDays: WorkingDayService,
    private readonly missing: DiaryMissingService,
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
      const closing = await this.settings.get<string>(
        branch.id,
        'diary.closingTime',
      );
      if (!(await this.daily.claim(branch.id, this.name, day, closing)))
        continue;
      if (!(await this.workingDays.isWorkingDay(branch.id, day))) continue;
      const rows = await this.missing.missing(branch.id, day);
      if (rows.length === 0) continue;
      const date = formatDate(day);
      const teacherIds = [
        ...new Set(rows.map((r) => r.teacher?.id).filter((id) => !!id)),
      ] as string[];
      const teachers = await this.prisma.staff.findMany({
        where: { id: { in: teacherIds }, userId: { not: null } },
        select: { userId: true },
      });
      await this.notifications.notify({
        userIds: teachers.map((t) => t.userId!),
        category: 'DIARY',
        title: 'Diary not published',
        body: `Some of your diary entries for ${date} are missing.`,
        data: { date },
      });
      if (branch.principalUserId) {
        await this.notifications.notify({
          userIds: [branch.principalUserId],
          category: 'DIARY',
          title: `${rows.length} diaries missing`,
          body: rows
            .slice(0, 10)
            .map((r) => `${r.className}-${r.sectionName} ${r.subject.name}`)
            .join(', '),
          data: { branchId: branch.id, date, missing: rows.length },
        });
      }
    }
  }
}
