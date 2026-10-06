import { Injectable, OnModuleInit } from '@nestjs/common';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { QUEUES } from '../../../core/jobs/queues';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AsyncTaskService } from '../../tasks/async-task.service';
import { BACKUP_JOBS, type BackupJobData } from '../backup-jobs';
import { BackupVerifier } from '../verify/backup-verifier';

/** Restore check requested via POST /backups/:id/verify. */
@Injectable()
export class BackupVerifyProcessor
  implements JobProcessor<BackupJobData>, OnModuleInit
{
  readonly queue = QUEUES.MAINTENANCE;
  readonly name = BACKUP_JOBS.VERIFY;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly prisma: PrismaService,
    private readonly tasks: AsyncTaskService,
    private readonly verifier: BackupVerifier,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async process(data: BackupJobData): Promise<void> {
    const run = await this.prisma.backupRun.findUnique({
      where: { id: data.runId },
    });
    if (!run || run.verifyStatus !== 'RUNNING') return;
    await this.tasks.track(data.taskId, async () => ({
      backupId: run.id,
      verifyStatus: await this.verifier.verify(run.id),
    }));
  }
}
