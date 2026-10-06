import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import { today } from '../../../core/common/week';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { JobScheduler } from '../../../core/jobs/job-scheduler';
import { QUEUES } from '../../../core/jobs/queues';
import { PrismaService } from '../../../core/prisma/prisma.service';

export const NOTICE_EXPIRE_JOB = 'notices.expire';

/** Daily: published notices past their expiry date become EXPIRED. */
@Injectable()
export class NoticeExpireProcessor
  implements JobProcessor, OnModuleInit, OnApplicationBootstrap
{
  readonly queue = QUEUES.MAINTENANCE;
  readonly name = NOTICE_EXPIRE_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly scheduler: JobScheduler,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  onApplicationBootstrap(): Promise<void> {
    return this.scheduler.schedule({
      queue: this.queue,
      name: this.name,
      cron: '5 0 * * *',
    });
  }

  async process(): Promise<void> {
    const where = { status: 'PUBLISHED' as const, expiresOn: { lt: today() } };
    const expiring = await this.prisma.notice.findMany({
      where,
      select: { id: true, schoolId: true, branchId: true },
    });
    if (expiring.length === 0) return;
    await this.prisma.notice.updateMany({
      where: { id: { in: expiring.map((n) => n.id) } },
      data: { status: 'EXPIRED' },
    });
    await this.audit.write(
      expiring.map((n) => ({
        action: 'notice.expire',
        entityType: 'Notice',
        entityId: n.id,
        schoolId: n.schoolId,
        branchId: n.branchId,
        after: { status: 'EXPIRED' },
      })),
      {},
    );
  }
}
