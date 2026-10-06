import { Injectable, Logger } from '@nestjs/common';
import { AppError } from '../../../core/common/errors/app-error';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { BackupGuard } from '../backup-guard';
import { BackupRunner } from '../backup-runner';
import { BackupRetention } from '../retention/backup-retention';
import { BackupVerifier } from '../verify/backup-verifier';

/** What the scheduled backup jobs do; busy states are skipped, not failed. */
@Injectable()
export class BackupScheduledWork {
  private readonly logger = new Logger(BackupScheduledWork.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly guard: BackupGuard,
    private readonly runner: BackupRunner,
    private readonly verifier: BackupVerifier,
    private readonly retention: BackupRetention,
  ) {}

  private skipBusy(error: unknown, what: string): null {
    if (error instanceof AppError) {
      this.logger.warn(`${what} skipped: ${error.message}`);
      return null;
    }
    throw error;
  }

  async nightly(): Promise<void> {
    const run = await this.guard
      .startBackup('SCHEDULED', null)
      .catch((e: unknown) => this.skipBusy(e, 'Nightly backup'));
    if (!run) return;
    await this.runner.execute(run.id);
    const pruned = await this.retention.apply();
    if (pruned > 0) this.logger.log(`Retention pruned ${pruned} backup(s)`);
  }

  async weeklyVerify(): Promise<void> {
    const latest = await this.prisma.backupRun.findFirst({
      where: { status: 'DONE', prunedAt: null, storageKey: { not: null } },
      orderBy: { startedAt: 'desc' },
      select: { id: true },
    });
    if (!latest) return;
    const run = await this.guard
      .startVerify(latest.id)
      .catch((e: unknown) => this.skipBusy(e, 'Weekly restore check'));
    if (!run) return;
    await this.verifier.verify(run.id);
  }
}
