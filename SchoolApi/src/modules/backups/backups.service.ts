import type { Readable } from 'node:stream';
import { Injectable } from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service';
import { AppError } from '../../core/common/errors/app-error';
import { ErrorCode } from '../../core/common/errors/error-code.enum';
import { forbidden, notFound } from '../../core/common/errors/errors';
import type { AuthUser } from '../../core/common/types/auth-user';
import { StorageDriver } from '../../core/files/storage/storage-driver';
import { QUEUES } from '../../core/jobs/queues';
import { PrismaService } from '../../core/prisma/prisma.service';
import { isSuperAdmin } from '../../core/rbac/actor';
import type { BackupRun } from '../../generated/prisma/client';
import { AsyncTaskService } from '../tasks/async-task.service';
import { BackupGuard } from './backup-guard';
import { BACKUP_URL_TTL_SECONDS, BackupUrlSigner } from './backup-url-signer';
import { BACKUP_JOBS } from './backup-jobs';
import type { BackupDownloadDto, BackupJobDto } from './dto/backup-run.dto';

const fileNameOf = (run: BackupRun) =>
  `eschool-backup-${run.startedAt.toISOString().slice(0, 10)}-${run.id.slice(-8)}.esbk`;

/** Super Admin requests: start backups/checks, download files. */
@Injectable()
export class BackupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly guard: BackupGuard,
    private readonly tasks: AsyncTaskService,
    private readonly audit: AuditService,
    private readonly storage: StorageDriver,
    private readonly signer: BackupUrlSigner,
  ) {}

  assertSuperAdmin(user: AuthUser): void {
    if (!isSuperAdmin(user)) throw forbidden('Backups are Super Admin only');
  }

  async requestBackup(user: AuthUser): Promise<BackupJobDto> {
    this.assertSuperAdmin(user);
    const run = await this.guard.startBackup('MANUAL', user.id);
    const jobId = await this.tasks.enqueue(user, {
      queue: QUEUES.MAINTENANCE,
      name: BACKUP_JOBS.BACKUP,
      data: { runId: run.id },
    });
    this.audit.stage({
      action: 'backup.create',
      entityType: 'BackupRun',
      entityId: run.id,
      after: { trigger: run.trigger, jobId },
    });
    return { jobId };
  }

  async requestVerify(user: AuthUser, id: string): Promise<BackupJobDto> {
    this.assertSuperAdmin(user);
    const run = await this.guard.startVerify(id);
    const jobId = await this.tasks.enqueue(user, {
      queue: QUEUES.MAINTENANCE,
      name: BACKUP_JOBS.VERIFY,
      data: { runId: run.id },
    });
    this.audit.stage({
      action: 'backup.verify',
      entityType: 'BackupRun',
      entityId: run.id,
      after: { jobId },
    });
    return { jobId };
  }

  private async stored(
    id: string,
  ): Promise<BackupRun & { storageKey: string }> {
    const run = await this.prisma.backupRun.findUnique({ where: { id } });
    if (!run) throw notFound('Backup');
    if (run.status !== 'DONE' || run.prunedAt || !run.storageKey) {
      throw new AppError(
        ErrorCode.FILE_UNAVAILABLE,
        'This backup has no stored file',
      );
    }
    return { ...run, storageKey: run.storageKey };
  }

  async downloadUrl(user: AuthUser, id: string): Promise<BackupDownloadDto> {
    this.assertSuperAdmin(user);
    const run = await this.stored(id);
    const presigned = await this.storage.presignedUrl(
      run.storageKey,
      BACKUP_URL_TTL_SECONDS,
      fileNameOf(run),
    );
    const link = presigned
      ? {
          url: presigned,
          expiresAt: new Date(
            Date.now() + BACKUP_URL_TTL_SECONDS * 1000,
          ).toISOString(),
        }
      : this.signer.sign(run.id);
    await this.audit.recordNow({
      action: 'backup.download',
      entityType: 'BackupRun',
      entityId: run.id,
      after: { expiresAt: link.expiresAt },
    });
    return link;
  }

  /** Target of signed links; the signature is the authorization. */
  async open(
    id: string,
    exp: number,
    sig: string,
  ): Promise<{ name: string; size: number | null; stream: Readable }> {
    if (!this.signer.verify(id, exp, sig)) throw notFound('Backup');
    const run = await this.stored(id);
    return {
      name: fileNameOf(run),
      size: run.sizeBytes === null ? null : Number(run.sizeBytes),
      stream: await this.storage.read(run.storageKey),
    };
  }
}
