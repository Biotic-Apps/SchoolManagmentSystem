import { createWriteStream } from 'node:fs';
import { rm } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import { toJson } from '../../../core/common/prisma-json';
import { StorageDriver } from '../../../core/files/storage/storage-driver';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { BackupRun } from '../../../generated/prisma/client';
import { BackupAlerts } from '../backup-alerts';
import { backupKey, decryptFile, fileDigest } from '../crypto/backup-cipher';
import { parseDatabaseUrl } from '../dump/pg-target';
import type { SourceStats } from '../dump/source-stats';
import { withTempWorkspace } from '../temp-workspace';
import { restoreAndCompare } from './restore-check';
import { allPassed, check, type VerifyCheck } from './verify-checks';

const messageOf = (error: unknown) =>
  (error instanceof Error ? error.message : String(error)).slice(0, 1000);

/** Download → checksum → decrypt (tag verified) → restore → compare. */
@Injectable()
export class BackupVerifier {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly storage: StorageDriver,
    private readonly alerts: BackupAlerts,
  ) {}

  /** Runs the check of a RUNNING verify; returns the final status. */
  async verify(runId: string): Promise<'PASSED' | 'FAILED'> {
    const run = await this.prisma.backupRun.findUniqueOrThrow({
      where: { id: runId },
    });
    const checks = await this.checks(run);
    const passed = allPassed(checks);
    const failure = checks.find((c) => !c.ok);
    const error = failure
      ? `${failure.name}: expected ${String(failure.expected)}, got ${String(failure.actual)}`
      : null;
    await this.prisma.backupRun.update({
      where: { id: runId },
      data: {
        verifyStatus: passed ? 'PASSED' : 'FAILED',
        verifiedAt: passed ? new Date() : null,
        verifyChecks: toJson(checks),
        verifyError: error?.slice(0, 2000) ?? null,
      },
    });
    if (passed) {
      await this.alerts.record('backup.verified', runId, {
        checks: checks.length,
      });
    } else {
      await this.alerts.failed(
        'verify',
        runId,
        error ?? 'Restore check failed',
      );
    }
    return passed ? 'PASSED' : 'FAILED';
  }

  private async checks(run: BackupRun): Promise<VerifyCheck[]> {
    const done: VerifyCheck[] = [];
    try {
      if (!run.storageKey || !run.sourceStats) {
        throw new Error('Backup has no stored file or source stats');
      }
      const key = backupKey(this.config.get('BACKUP_ENCRYPTION_KEY'));
      const storageKey = run.storageKey;
      return await withTempWorkspace(async (path) => {
        const stream = await this.storage.read(storageKey);
        await pipeline(stream, createWriteStream(path('enc')));
        const digest = await fileDigest(path('enc'));
        done.push(check('file checksum', run.checksumSha256, digest.sha256));
        if (!done[0].ok) return done;
        await decryptFile(path('enc'), path('dump'), key);
        done.push(check('decrypt', 'ok', 'ok'));
        await rm(path('enc'));
        const restored = await restoreAndCompare({
          source: parseDatabaseUrl(this.config.get('DATABASE_URL')),
          format: run.format,
          dumpFile: path('dump'),
          expected: run.sourceStats as unknown as SourceStats,
          pgRestoreBinary: this.config.get('PG_RESTORE_PATH') ?? 'pg_restore',
        });
        return [...done, ...restored];
      });
    } catch (error) {
      const step =
        done.length === 0 ? 'file' : done.length === 1 ? 'decrypt' : 'restore';
      return [...done, check(step, 'ok', messageOf(error), false)];
    }
  }
}
