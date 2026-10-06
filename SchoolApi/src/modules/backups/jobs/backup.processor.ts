import { Injectable, OnModuleInit } from '@nestjs/common';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { QUEUES } from '../../../core/jobs/queues';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AsyncTaskService } from '../../tasks/async-task.service';
import { BACKUP_JOBS, type BackupJobData } from '../backup-jobs';
import { BackupRunner } from '../backup-runner';

/** Manual backup requested via POST /backups. */
@Injectable()
export class BackupProcessor
  implements JobProcessor<BackupJobData>, OnModuleInit
{
  readonly queue = QUEUES.MAINTENANCE;
  readonly name = BACKUP_JOBS.BACKUP;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly prisma: PrismaService,
    private readonly tasks: AsyncTaskService,
    private readonly runner: BackupRunner,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async process(data: BackupJobData): Promise<void> {
    const run = await this.prisma.backupRun.findUnique({
      where: { id: data.runId },
    });
    // Retries of a run that already finished or failed do nothing.
    if (!run || run.status !== 'RUNNING') return;
    await this.tasks.track(data.taskId, async () => {
      await this.runner.execute(run.id);
      return { backupId: run.id };
    });
  }
}
