import { Injectable } from '@nestjs/common';
import { Prisma, type JobRunStatus } from '../../generated/prisma/client';
import { AuditService } from '../../core/audit/audit.service';
import { conflict, notFound } from '../../core/common/errors/errors';
import { parseDate } from '../../core/common/dates';
import type { PageResult } from '../../core/common/pagination/page-result';
import {
  toPageResult,
  toSkipTake,
} from '../../core/common/pagination/paginate';
import type { AuthUser } from '../../core/common/types/auth-user';
import { JobDispatcher } from '../../core/jobs/job-dispatcher';
import { ACTIVE_QUEUES, type QueueName } from '../../core/jobs/queues';
import { PrismaService } from '../../core/prisma/prisma.service';
import type {
  JobRunDto,
  JobRunQueryDto,
  SupportJobStatus,
} from './dto/job-run.dto';

const TO_DB: Record<SupportJobStatus, JobRunStatus> = {
  RUNNING: 'RUNNING',
  DONE: 'COMPLETED',
  FAILED: 'FAILED',
};
const FROM_DB: Record<JobRunStatus, SupportJobStatus> = {
  RUNNING: 'RUNNING',
  COMPLETED: 'DONE',
  FAILED: 'FAILED',
};

/** Never selects `data` for responses. */
const RUN_SELECT = {
  id: true,
  queue: true,
  name: true,
  status: true,
  attempt: true,
  error: true,
  startedAt: true,
  finishedAt: true,
  retriedAt: true,
} as const;

type RunRow = Prisma.JobRunGetPayload<{ select: typeof RUN_SELECT }>;

const RETRYABLE: Prisma.JobRunWhereInput = {
  status: 'FAILED',
  retriedAt: null,
  data: { not: Prisma.DbNull },
};

function toDto(row: RunRow, retryable: boolean): JobRunDto {
  return {
    id: row.id,
    queue: row.queue,
    name: row.name,
    status: FROM_DB[row.status],
    attempts: row.attempt,
    error: row.error,
    startedAt: row.startedAt.toISOString(),
    finishedAt: row.finishedAt?.toISOString() ?? null,
    retriedAt: row.retriedAt?.toISOString() ?? null,
    retryable,
  };
}

/** job_runs for Settings › Support (super admin only, checked by the controller). */
@Injectable()
export class SupportJobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobs: JobDispatcher,
    private readonly audit: AuditService,
  ) {}

  async list(query: JobRunQueryDto): Promise<PageResult<JobRunDto>> {
    const where: Prisma.JobRunWhereInput = {
      queue: query.queue,
      status: query.status ? TO_DB[query.status] : undefined,
      startedAt: query.from ? { gte: parseDate(query.from) } : undefined,
    };
    const [rows, total] = await Promise.all([
      this.prisma.jobRun.findMany({
        where,
        select: RUN_SELECT,
        orderBy: [{ startedAt: 'desc' }, { id: 'desc' }],
        ...toSkipTake(query),
      }),
      this.prisma.jobRun.count({ where }),
    ]);
    const retryable = await this.retryableIds(rows.map((row) => row.id));
    return toPageResult(
      rows.map((row) => toDto(row, retryable.has(row.id))),
      total,
      query,
    );
  }

  async retry(user: AuthUser, id: string): Promise<JobRunDto> {
    const run = await this.prisma.jobRun.findUnique({ where: { id } });
    if (!run) throw notFound('Job run');
    const queue = run.queue as QueueName;
    if (
      run.status !== 'FAILED' ||
      run.data === null ||
      run.retriedAt !== null ||
      !ACTIVE_QUEUES.includes(queue)
    ) {
      throw conflict('Only failed runs with stored input can be retried once');
    }
    const { count } = await this.prisma.jobRun.updateMany({
      where: { id, ...RETRYABLE },
      data: { retriedAt: new Date(), retriedById: user.id },
    });
    if (count !== 1) throw conflict('This run was already retried');
    try {
      await this.jobs.dispatch(queue, run.name, run.data);
    } catch (error) {
      await this.prisma.jobRun.update({
        where: { id },
        data: { retriedAt: null, retriedById: null },
      });
      throw error;
    }
    const row = await this.prisma.jobRun.findUniqueOrThrow({
      where: { id },
      select: RUN_SELECT,
    });
    this.audit.stage({
      action: 'support.job_retry',
      entityType: 'JobRun',
      entityId: id,
      after: { queue: row.queue, name: row.name, retriedAt: row.retriedAt },
    });
    return toDto(row, false);
  }

  private async retryableIds(ids: string[]): Promise<Set<string>> {
    if (ids.length === 0) return new Set();
    const rows = await this.prisma.jobRun.findMany({
      where: { id: { in: ids }, ...RETRYABLE },
      select: { id: true },
    });
    return new Set(rows.map((row) => row.id));
  }
}
