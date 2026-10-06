import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { JobScheduler } from '../../../core/jobs/job-scheduler';
import { QUEUES } from '../../../core/jobs/queues';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ComplaintEscalationService } from '../complaint-escalation.service';
import { CLOSED_STATUSES, MAX_ESCALATION_LEVEL } from '../complaint-status';

export const SLA_CHECK_JOB = 'complaints.slaCheck';

/** Hourly: escalates open complaints whose SLA deadline passed. */
@Injectable()
export class SlaCheckProcessor
  implements JobProcessor, OnModuleInit, OnApplicationBootstrap
{
  readonly queue = QUEUES.MAINTENANCE;
  readonly name = SLA_CHECK_JOB;
  private readonly logger = new Logger(SlaCheckProcessor.name);

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly scheduler: JobScheduler,
    private readonly prisma: PrismaService,
    private readonly escalation: ComplaintEscalationService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  onApplicationBootstrap(): Promise<void> {
    return this.scheduler.schedule({
      queue: this.queue,
      name: this.name,
      cron: '0 * * * *',
    });
  }

  async process(): Promise<void> {
    const overdue = await this.prisma.complaint.findMany({
      where: {
        status: { notIn: CLOSED_STATUSES },
        slaDueAt: { lt: new Date() },
        escalationLevel: { lt: MAX_ESCALATION_LEVEL },
      },
      orderBy: { slaDueAt: 'asc' },
      take: 500,
    });
    for (const complaint of overdue) {
      try {
        await this.escalation.escalate(complaint, null);
      } catch (error) {
        this.logger.warn(
          `Escalating ${complaint.ticketNo} failed: ${String(error)}`,
        );
      }
    }
  }
}
