import { Injectable, OnModuleInit } from '@nestjs/common';
import { AuditService } from '../../../core/audit/audit.service';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { QUEUES } from '../../../core/jobs/queues';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AccessCache } from '../../../core/rbac/access/access-cache';
import { summarize, totalRows } from './deletion-summary';
import { SchoolPurgeService } from './school-purge.service';

export const DELETE_SCHOOL_JOB = 'schools.delete';

export interface DeleteSchoolInput {
  schoolId: string;
  actorId: string;
}

/** Permanently removes a school (DELETE /schools/:id). */
@Injectable()
export class SchoolDeletionProcessor
  implements JobProcessor<DeleteSchoolInput>, OnModuleInit
{
  readonly queue = QUEUES.MAINTENANCE;
  readonly name = DELETE_SCHOOL_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly prisma: PrismaService,
    private readonly purge: SchoolPurgeService,
    private readonly access: AccessCache,
    private readonly audit: AuditService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  async process(input: DeleteSchoolInput): Promise<void> {
    const school = await this.prisma.school.findUnique({
      where: { id: input.schoolId },
      select: { code: true, name: true },
    });
    if (!school) return; // Already gone (retried run).
    const counts = await this.purge.purge(input.schoolId);
    await this.access.invalidateAllUsers();
    await this.audit.write(
      [
        {
          action: 'school.delete',
          entityType: 'School',
          entityId: input.schoolId,
          schoolId: input.schoolId,
          actorId: input.actorId,
          before: school,
          after: {
            summary: summarize(counts),
            removedUsers: counts.removedUsers,
            keptUsers: counts.keptUsers,
            totalRows: totalRows(counts),
            tables: counts.tables,
          },
        },
      ],
      {},
    );
  }
}
