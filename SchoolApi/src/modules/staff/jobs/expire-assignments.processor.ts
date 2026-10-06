import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { JobScheduler } from '../../../core/jobs/job-scheduler';
import { QUEUES } from '../../../core/jobs/queues';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AssignmentEnder } from '../assignments/assignment-ender';

export const EXPIRE_ASSIGNMENTS_JOB = 'maintenance.expireAssignments';

/** Nightly: ends substitute/temporary assignments whose validUntil passed. */
@Injectable()
export class ExpireAssignmentsProcessor
  implements JobProcessor, OnModuleInit, OnApplicationBootstrap
{
  readonly queue = QUEUES.MAINTENANCE;
  readonly name = EXPIRE_ASSIGNMENTS_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly scheduler: JobScheduler,
    private readonly prisma: PrismaService,
    private readonly ender: AssignmentEnder,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  onApplicationBootstrap(): Promise<void> {
    return this.scheduler.schedule({
      queue: this.queue,
      name: this.name,
      cron: '15 1 * * *',
      runOnBootInline: true,
    });
  }

  async process(): Promise<void> {
    const now = new Date();
    const due = await this.prisma.staffAssignment.findMany({
      where: { endedAt: null, validUntil: { lte: now } },
      include: { staff: { select: { userId: true } } },
    });
    if (due.length === 0) return;
    await this.prisma.$transaction((tx) => this.ender.end(tx, due, now));
    await this.ender.refresh(due.map((row) => row.staff.userId));
    await this.audit.write(
      due.map((row) => ({
        action: 'staff.assignment_expire',
        entityType: 'Staff',
        entityId: row.staffId,
        schoolId: row.schoolId,
        branchId: row.branchId,
        before: {
          assignmentId: row.id,
          kind: row.kind,
          validUntil: row.validUntil,
        },
      })),
      {},
    );
  }
}
