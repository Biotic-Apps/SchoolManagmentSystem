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
import { BACKUP_JOBS } from '../backup-jobs';
import { BackupScheduledWork } from './backup-scheduled-work';

const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/**
 * Nightly 02:00 backup (+ retention). Failures are recorded on the run and
 * alerted, not rethrown, so queue retries do not repeat the alert.
 */
@Injectable()
export class BackupNightlyProcessor
  implements JobProcessor, OnModuleInit, OnApplicationBootstrap
{
  readonly queue = QUEUES.MAINTENANCE;
  readonly name = BACKUP_JOBS.NIGHTLY;
  private readonly logger = new Logger(BackupNightlyProcessor.name);

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly scheduler: JobScheduler,
    private readonly work: BackupScheduledWork,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  onApplicationBootstrap(): Promise<void> {
    return this.scheduler.schedule({
      queue: this.queue,
      name: this.name,
      cron: '0 2 * * *',
    });
  }

  async process(): Promise<void> {
    await this.work
      .nightly()
      .catch((e) => this.logger.error(`Nightly backup: ${message(e)}`));
  }
}

/** Sunday 03:30: restore check of the latest stored backup. */
@Injectable()
export class BackupVerifyWeeklyProcessor
  implements JobProcessor, OnModuleInit, OnApplicationBootstrap
{
  readonly queue = QUEUES.MAINTENANCE;
  readonly name = BACKUP_JOBS.VERIFY_WEEKLY;
  private readonly logger = new Logger(BackupVerifyWeeklyProcessor.name);

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly scheduler: JobScheduler,
    private readonly work: BackupScheduledWork,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  onApplicationBootstrap(): Promise<void> {
    return this.scheduler.schedule({
      queue: this.queue,
      name: this.name,
      cron: '30 3 * * 0',
    });
  }

  async process(): Promise<void> {
    await this.work
      .weeklyVerify()
      .catch((e) => this.logger.error(`Weekly restore check: ${message(e)}`));
  }
}
