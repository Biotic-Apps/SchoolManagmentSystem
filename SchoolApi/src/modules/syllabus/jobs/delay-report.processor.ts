import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { JobScheduler } from '../../../core/jobs/job-scheduler';
import { QUEUES } from '../../../core/jobs/queues';
import { today } from '../../../core/common/week';
import { NotificationService } from '../../../core/notifications/notification.service';
import { PrismaService } from '../../../core/prisma/prisma.service';

export const DELAY_REPORT_JOB = 'syllabus.delayReport';

/** Weekly: tells each principal which topics are past their target date. */
@Injectable()
export class DelayReportProcessor
  implements JobProcessor, OnModuleInit, OnApplicationBootstrap
{
  readonly queue = QUEUES.REPORTS;
  readonly name = DELAY_REPORT_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly scheduler: JobScheduler,
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  onApplicationBootstrap(): Promise<void> {
    return this.scheduler.schedule({
      queue: this.queue,
      name: this.name,
      cron: '0 7 * * 1',
    });
  }

  async process(): Promise<void> {
    const delayed = await this.prisma.syllabusTopic.findMany({
      where: {
        status: { not: 'COMPLETED' },
        targetDate: { lt: today() },
        plan: { status: 'APPROVED', session: { status: 'ACTIVE' } },
      },
      select: {
        title: true,
        plan: {
          select: {
            branchId: true,
            branch: { select: { principalUserId: true } },
            subject: { select: { name: true } },
            section: {
              select: { name: true, schoolClass: { select: { name: true } } },
            },
          },
        },
      },
    });
    const byBranch = new Map<string, typeof delayed>();
    for (const topic of delayed) {
      const list = byBranch.get(topic.plan.branchId) ?? [];
      list.push(topic);
      byBranch.set(topic.plan.branchId, list);
    }
    for (const [branchId, topics] of byBranch) {
      const principal = topics[0].plan.branch.principalUserId;
      if (!principal) continue;
      const lines = topics
        .slice(0, 10)
        .map(
          (t) =>
            `${t.plan.section.schoolClass.name}-${t.plan.section.name} ${t.plan.subject.name}: ${t.title}`,
        );
      await this.notifications.notify({
        userIds: [principal],
        category: 'SYLLABUS',
        title: `${topics.length} delayed syllabus topics`,
        body:
          lines.join('\n') +
          (topics.length > 10 ? `\n...and ${topics.length - 10} more` : ''),
        data: { branchId, delayed: topics.length },
      });
    }
  }
}
