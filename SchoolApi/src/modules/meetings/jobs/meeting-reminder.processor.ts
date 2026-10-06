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
import { PrismaService } from '../../../core/prisma/prisma.service';
import { localDateTime } from '../../school-day/clock';
import { MeetingNotifier } from '../meeting-notifier';

export const MEETING_REMINDER_JOB = 'meetings.reminder';

const HOUR_MS = 3_600_000;

/** Every 10 minutes: reminds both parties of meetings starting within the hour. */
@Injectable()
export class MeetingReminderProcessor
  implements JobProcessor, OnModuleInit, OnApplicationBootstrap
{
  readonly queue = QUEUES.MAINTENANCE;
  readonly name = MEETING_REMINDER_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly scheduler: JobScheduler,
    private readonly prisma: PrismaService,
    private readonly notifier: MeetingNotifier,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  onApplicationBootstrap(): Promise<void> {
    return this.scheduler.schedule({
      queue: this.queue,
      name: this.name,
      cron: '*/10 * * * *',
    });
  }

  async process(): Promise<void> {
    const now = new Date();
    const start = today();
    const meetings = await this.prisma.meeting.findMany({
      where: {
        status: 'SCHEDULED',
        reminderAt: null,
        date: {
          gte: new Date(start.getTime() - 86_400_000),
          lte: new Date(start.getTime() + 86_400_000),
        },
      },
      include: { guardian: { select: { userId: true } } },
    });
    for (const meeting of meetings) {
      const at = localDateTime(formatDate(meeting.date), meeting.startTime);
      const diff = at.getTime() - now.getTime();
      if (diff < 0 || diff > HOUR_MS) continue;
      const claimed = await this.prisma.meeting.updateMany({
        where: { id: meeting.id, reminderAt: null },
        data: { reminderAt: now },
      });
      if (claimed.count === 0) continue;
      await this.notifier.others(
        meeting,
        null,
        'Meeting reminder',
        `Your meeting starts at ${meeting.startTime}`,
      );
    }
  }
}
