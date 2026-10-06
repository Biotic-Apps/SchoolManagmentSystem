import { rm } from 'node:fs/promises';
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import { toJson } from '../../core/common/prisma-json';
import { StorageDriver } from '../../core/files/storage/storage-driver';
import { PrismaService } from '../../core/prisma/prisma.service';
import { BackupAlerts } from './backup-alerts';
import { backupKey, encryptFile, fileDigest } from './crypto/backup-cipher';
import { dumpWithCopy } from './dump/copy-dumper';
import { dumpWithPgDump } from './dump/pg-dumper';
import { parseDatabaseUrl } from './dump/pg-target';
import { chooseDumpFormat } from './dump/pg-tools';
import { withTempWorkspace } from './temp-workspace';

export const BACKUP_MIME = 'application/octet-stream';

export const storageKeyOf = (id: string, startedAt: Date): string => {
  const month = String(startedAt.getUTCMonth() + 1).padStart(2, '0');
  return `backups/${startedAt.getUTCFullYear()}/${month}/${id}.esbk`;
};

/** Dump → encrypt → store, for a BackupRun created by BackupGuard. */
@Injectable()
export class BackupRunner {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly storage: StorageDriver,
    private readonly alerts: BackupAlerts,
  ) {}

  async execute(runId: string): Promise<void> {
    const run = await this.prisma.backupRun.findUniqueOrThrow({
      where: { id: runId },
    });
    try {
      const key = backupKey(this.config.get('BACKUP_ENCRYPTION_KEY'));
      const choice = await chooseDumpFormat({
        pgDumpPath: this.config.get('PG_DUMP_PATH'),
        production: this.config.isProduction,
      });
      await this.prisma.backupRun.update({
        where: { id: runId },
        data: { format: choice.format },
      });
      const source = parseDatabaseUrl(this.config.get('DATABASE_URL'));
      const storageKey = storageKeyOf(run.id, run.startedAt);
      const done = await withTempWorkspace(async (path) => {
        const stats =
          choice.format === 'pg_dump'
            ? await dumpWithPgDump(source, choice.binary!, path('dump'))
            : await dumpWithCopy(source, path('dump'));
        await encryptFile(path('dump'), path('dump.esbk'), key);
        await rm(path('dump'));
        const digest = await fileDigest(path('dump.esbk'));
        await this.storage.putFile(storageKey, path('dump.esbk'), BACKUP_MIME);
        return { stats, digest };
      });
      await this.prisma.backupRun.update({
        where: { id: runId },
        data: {
          status: 'DONE',
          finishedAt: new Date(),
          sizeBytes: BigInt(done.digest.size),
          checksumSha256: done.digest.sha256,
          encrypted: true,
          storageKey,
          sourceStats: toJson(done.stats),
        },
      });
      await this.alerts.record('backup.completed', runId, {
        format: choice.format,
        sizeBytes: done.digest.size,
        checksumSha256: done.digest.sha256,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.prisma.backupRun.update({
        where: { id: runId },
        data: {
          status: 'FAILED',
          finishedAt: new Date(),
          error: message.slice(0, 2000),
        },
      });
      await this.alerts.failed('backup', runId, message);
      throw error;
    }
  }
}
