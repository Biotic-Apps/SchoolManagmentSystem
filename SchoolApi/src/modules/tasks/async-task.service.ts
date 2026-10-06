import { Injectable, Logger } from '@nestjs/common';
import type { AsyncTask, ReportFormat } from '../../generated/prisma/client';
import { toJson } from '../../core/common/prisma-json';
import { JobDispatcher } from '../../core/jobs/job-dispatcher';
import type { QueueName } from '../../core/jobs/queues';
import { PrismaService } from '../../core/prisma/prisma.service';

export interface TaskRequester {
  id: string;
  activeRole?: string | null;
}

export interface EnqueueTask<T extends object> {
  queue: QueueName;
  /** Job name of the registered processor. */
  name: string;
  /** Processor input; `taskId` is added. */
  data: T;
  schoolId?: string | null;
  branchId?: string | null;
  format?: ReportFormat | null;
  /** Stored for display/audit; defaults to `data`. */
  params?: unknown;
}

/** What a tracked job returns: a file and/or a small summary. */
export interface TaskOutcome {
  fileId?: string | null;
  count?: number;
  [key: string]: unknown;
}

export type TaskJobData<T> = T & { taskId: string };

/**
 * Background work the caller can poll at `GET /jobs/:id` (also
 * `GET /reports/:jobId`). Processors wrap their work in `track`.
 */
@Injectable()
export class AsyncTaskService {
  private readonly logger = new Logger(AsyncTaskService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jobs: JobDispatcher,
  ) {}

  /** Creates the task row and dispatches the job; returns the job id. */
  async enqueue<T extends object>(
    requester: TaskRequester,
    input: EnqueueTask<T>,
  ): Promise<string> {
    const task = await this.prisma.asyncTask.create({
      data: {
        kind: `${input.queue}/${input.name}`,
        params: toJson(input.params ?? input.data),
        format: input.format ?? null,
        schoolId: input.schoolId ?? null,
        branchId: input.branchId ?? null,
        requestedById: requester.id,
        activeRole: requester.activeRole ?? null,
      },
    });
    await this.jobs.dispatch(input.queue, input.name, {
      ...input.data,
      taskId: task.id,
    });
    return task.id;
  }

  /** A task that is already done (e.g. a PDF that is already rendered). */
  async completed(
    requester: TaskRequester,
    kind: string,
    outcome: TaskOutcome,
    schoolId?: string | null,
  ): Promise<string> {
    const now = new Date();
    const task = await this.prisma.asyncTask.create({
      data: {
        kind,
        params: {},
        schoolId: schoolId ?? null,
        requestedById: requester.id,
        activeRole: requester.activeRole ?? null,
        status: 'COMPLETED',
        fileId: outcome.fileId ?? null,
        result: toJson(outcome),
        startedAt: now,
        finishedAt: now,
      },
    });
    return task.id;
  }

  /**
   * Runs `work` with RUNNING/COMPLETED/FAILED bookkeeping. Without a taskId
   * (scheduled runs) the work just runs. Errors are recorded and rethrown.
   */
  async track(
    taskId: string | undefined,
    work: (
      progress: (percent: number) => Promise<void>,
    ) => Promise<TaskOutcome | void>,
  ): Promise<void> {
    const progress = async (percent: number) => {
      if (!taskId) return;
      await this.prisma.asyncTask.update({
        where: { id: taskId },
        data: {
          result: { progress: Math.max(0, Math.min(100, Math.round(percent))) },
        },
      });
    };
    if (taskId) {
      await this.prisma.asyncTask.update({
        where: { id: taskId },
        data: { status: 'RUNNING', startedAt: new Date() },
      });
    }
    try {
      const outcome = (await work(progress)) ?? {};
      if (taskId) {
        await this.prisma.asyncTask.update({
          where: { id: taskId },
          data: {
            status: 'COMPLETED',
            fileId: outcome.fileId ?? null,
            result: toJson({ ...outcome, progress: 100 }),
            finishedAt: new Date(),
          },
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (taskId) {
        await this.prisma.asyncTask
          .update({
            where: { id: taskId },
            data: {
              status: 'FAILED',
              error: message.slice(0, 1000),
              finishedAt: new Date(),
            },
          })
          .catch((e: unknown) => this.logger.error(e));
      }
      throw error;
    }
  }

  /** Own tasks only (others look missing). */
  findOwn(id: string, userId: string): Promise<AsyncTask | null> {
    return this.prisma.asyncTask.findFirst({
      where: { id, requestedById: userId },
    });
  }
}
