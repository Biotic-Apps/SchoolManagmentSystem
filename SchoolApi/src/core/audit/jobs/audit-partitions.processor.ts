import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import type { JobProcessor } from '../../jobs/job-processor';
import { JobProcessorRegistry } from '../../jobs/job-processor.registry';
import { JobScheduler } from '../../jobs/job-scheduler';
import { QUEUES } from '../../jobs/queues';
import { PrismaService } from '../../prisma/prisma.service';
import { partitionMonths } from './audit-partition-months';

export const AUDIT_PARTITIONS_JOB = 'maintenance.auditPartitions';

/**
 * Daily: makes sure audit_logs has partitions for this month and the next
 * two (SQL function audit_logs_ensure_partition from the phase5 migration).
 * Fails loudly (job_runs FAILED) if rows already landed in audit_logs_default.
 */
@Injectable()
export class AuditPartitionsProcessor
  implements JobProcessor, OnModuleInit, OnApplicationBootstrap
{
  readonly queue = QUEUES.MAINTENANCE;
  readonly name = AUDIT_PARTITIONS_JOB;
  private readonly logger = new Logger(AuditPartitionsProcessor.name);

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly scheduler: JobScheduler,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  onApplicationBootstrap(): Promise<void> {
    return this.scheduler.schedule({
      queue: this.queue,
      name: this.name,
      cron: '10 0 * * *',
      runOnBootInline: true,
    });
  }

  async process(): Promise<void> {
    for (const month of partitionMonths(new Date())) {
      const rows = await this.prisma.$queryRaw<{ name: string }[]>`
        SELECT audit_logs_ensure_partition(${month}::date) AS name`;
      this.logger.debug(`audit partition ready: ${rows[0]?.name}`);
    }
  }
}
