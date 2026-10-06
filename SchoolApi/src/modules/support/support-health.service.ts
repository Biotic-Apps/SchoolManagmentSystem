import { getQueueToken } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import type { Queue } from 'bullmq';
import { APP_VERSION } from '../../config/app-version';
import { AuditService } from '../../core/audit/audit.service';
import { StorageDriver } from '../../core/files/storage/storage-driver';
import { jobsDriverFromEnv } from '../../core/jobs/jobs-driver';
import { ACTIVE_QUEUES } from '../../core/jobs/queues';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { QueueHealthDto, SystemHealthDto } from './dto/system-health.dto';

const DAY_MS = 86_400_000;

/** GET /support/health (super admin only, checked by the controller). */
@Injectable()
export class SupportHealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageDriver,
    private readonly moduleRef: ModuleRef,
    private readonly audit: AuditService,
  ) {}

  async health(): Promise<SystemHealthDto> {
    const [db, queue, storageOk, lastBackup, verified] = await Promise.all([
      this.db(),
      this.queue(),
      this.storage.check().catch(() => false),
      this.prisma.backupRun.findFirst({
        where: { status: 'DONE' },
        orderBy: [{ finishedAt: 'desc' }, { startedAt: 'desc' }],
        select: { id: true, finishedAt: true, status: true },
      }),
      this.prisma.backupRun.findFirst({
        where: { verifyStatus: 'PASSED', verifiedAt: { not: null } },
        orderBy: { verifiedAt: 'desc' },
        select: { verifiedAt: true },
      }),
    ]);
    await this.audit.recordNow({
      action: 'support.health_read',
      entityType: 'System',
      entityId: 'health',
    });
    return {
      db,
      queue,
      storage: { driver: this.storage.name, ok: storageOk },
      lastBackup: lastBackup && {
        id: lastBackup.id,
        finishedAt: lastBackup.finishedAt?.toISOString() ?? null,
        status: lastBackup.status,
      },
      lastRestoreVerified: verified?.verifiedAt?.toISOString() ?? null,
      version: APP_VERSION,
    };
  }

  private async db(): Promise<'ok' | 'error'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'ok';
    } catch {
      return 'error';
    }
  }

  private async queue(): Promise<QueueHealthDto> {
    if (jobsDriverFromEnv() === 'inline') {
      const failed = await this.prisma.jobRun
        .count({
          where: {
            status: 'FAILED',
            startedAt: { gte: new Date(Date.now() - DAY_MS) },
          },
        })
        .catch(() => 0);
      return { driver: 'inline', waiting: 0, failed };
    }
    let waiting = 0;
    let failed = 0;
    for (const name of ACTIVE_QUEUES) {
      try {
        const queue = this.moduleRef.get<Queue>(getQueueToken(name), {
          strict: false,
        });
        const counts = await queue.getJobCounts('waiting', 'failed');
        waiting += counts.waiting ?? 0;
        failed += counts.failed ?? 0;
      } catch {
        // Queue unavailable (Redis down): counted as nothing, db/storage still report.
      }
    }
    return { driver: 'bullmq', waiting, failed };
  }
}
