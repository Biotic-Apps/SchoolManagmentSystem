import { Injectable } from '@nestjs/common';
import { conflict, notFound } from '../../core/common/errors/errors';
import { PrismaService } from '../../core/prisma/prisma.service';
import type {
  BackupRun,
  BackupTrigger,
  Prisma,
} from '../../generated/prisma/client';

/** A run with no progress for this long was interrupted (process restart). */
const STALE_MS = 6 * 60 * 60 * 1000;
const LOCK = 'backups:runs';

/** One backup and one restore check at a time, across API instances. */
@Injectable()
export class BackupGuard {
  constructor(private readonly prisma: PrismaService) {}

  async failStale(now = new Date()): Promise<void> {
    const before = new Date(now.getTime() - STALE_MS);
    await this.prisma.backupRun.updateMany({
      where: { status: 'RUNNING', startedAt: { lt: before } },
      data: { status: 'FAILED', finishedAt: now, error: 'Interrupted' },
    });
    await this.prisma.backupRun.updateMany({
      where: { verifyStatus: 'RUNNING', verifyStartedAt: { lt: before } },
      data: { verifyStatus: 'FAILED', verifyError: 'Interrupted' },
    });
  }

  private locked<T>(work: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${LOCK}, 0))`;
      return work(tx);
    });
  }

  /** Creates the RUNNING row; 409 while another backup runs. */
  async startBackup(
    trigger: BackupTrigger,
    requestedById: string | null,
  ): Promise<BackupRun> {
    await this.failStale();
    return this.locked(async (tx) => {
      const running = await tx.backupRun.count({
        where: { status: 'RUNNING' },
      });
      if (running > 0) throw conflict('A backup is already running');
      return tx.backupRun.create({
        data: { trigger, format: 'pending', requestedById },
      });
    });
  }

  /** Marks the restore check RUNNING; 409 unless DONE and stored. */
  async startVerify(id: string): Promise<BackupRun> {
    await this.failStale();
    return this.locked(async (tx) => {
      const run = await tx.backupRun.findUnique({ where: { id } });
      if (!run) throw notFound('Backup');
      if (run.status !== 'DONE' || run.prunedAt || !run.storageKey) {
        throw conflict('Only completed, stored backups can be verified');
      }
      const running = await tx.backupRun.count({
        where: { verifyStatus: 'RUNNING' },
      });
      if (running > 0) throw conflict('A restore check is already running');
      return tx.backupRun.update({
        where: { id },
        data: {
          verifyStatus: 'RUNNING',
          verifyStartedAt: new Date(),
          verifyError: null,
        },
      });
    });
  }
}
