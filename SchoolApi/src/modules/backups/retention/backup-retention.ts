import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import { StorageDriver } from '../../../core/files/storage/storage-driver';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { BackupAlerts } from '../backup-alerts';
import { selectPrunable } from './retention-policy';

/**
 * Deletes stored objects of backups outside the retention window and marks
 * them pruned; BackupRun rows are kept as history.
 */
@Injectable()
export class BackupRetention {
  private readonly logger = new Logger(BackupRetention.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly storage: StorageDriver,
    private readonly alerts: BackupAlerts,
  ) {}

  async apply(now = new Date()): Promise<number> {
    const stored = await this.prisma.backupRun.findMany({
      where: { status: 'DONE', prunedAt: null, storageKey: { not: null } },
      select: {
        id: true,
        startedAt: true,
        storageKey: true,
        verifyStatus: true,
      },
    });
    const prunable = new Set(
      selectPrunable(
        stored,
        {
          daily: this.config.get('BACKUP_RETENTION_DAILY'),
          monthly: this.config.get('BACKUP_RETENTION_MONTHLY'),
        },
        now,
      ),
    );
    let pruned = 0;
    for (const run of stored) {
      if (!prunable.has(run.id) || run.verifyStatus === 'RUNNING') continue;
      try {
        await this.storage.delete(run.storageKey!);
        await this.prisma.backupRun.update({
          where: { id: run.id },
          data: { prunedAt: new Date() },
        });
        await this.alerts.record('backup.pruned', run.id, {
          storageKey: run.storageKey,
        });
        pruned++;
      } catch (error) {
        this.logger.warn(`Pruning backup ${run.id} failed: ${String(error)}`);
      }
    }
    return pruned;
  }
}
