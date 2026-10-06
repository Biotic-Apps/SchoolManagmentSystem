import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { toBackupRunDto, type BackupRunDto } from './dto/backup-run.dto';

const LIST_LIMIT = 100;

export interface BackupHealth {
  /** Finish time of the newest completed backup. */
  lastBackup: Date | null;
  /** When a backup last passed its restore check. */
  lastRestoreVerified: Date | null;
}

/** Read side of backups (no authorization: callers check). */
@Injectable()
export class BackupsQuery {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<BackupRunDto[]> {
    const runs = await this.prisma.backupRun.findMany({
      orderBy: [{ startedAt: 'desc' }, { id: 'desc' }],
      take: LIST_LIMIT,
    });
    return runs.map(toBackupRunDto);
  }

  async latest(): Promise<BackupHealth> {
    const [backup, verified] = await Promise.all([
      this.prisma.backupRun.findFirst({
        where: { status: 'DONE' },
        orderBy: { finishedAt: 'desc' },
        select: { finishedAt: true },
      }),
      this.prisma.backupRun.findFirst({
        where: { verifyStatus: 'PASSED' },
        orderBy: { verifiedAt: 'desc' },
        select: { verifiedAt: true },
      }),
    ]);
    return {
      lastBackup: backup?.finishedAt ?? null,
      lastRestoreVerified: verified?.verifiedAt ?? null,
    };
  }
}
