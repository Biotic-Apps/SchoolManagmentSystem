import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { toJson } from '../common/prisma-json';
import { JobDispatcher } from '../jobs/job-dispatcher';
import type { QueueName } from '../jobs/queues';
import { PrismaService } from '../prisma/prisma.service';

export interface OutboxJob {
  queue: QueueName;
  name: string;
  data: unknown;
  aggregateType: string;
  aggregateId: string;
}

interface StoredJob {
  queue: QueueName;
  data: unknown;
}

/**
 * Transactional outbox (databaseManagement.md §5): jobs are written inside the
 * business transaction and enqueued only after it commits.
 */
@Injectable()
export class OutboxService implements OnApplicationBootstrap {
  private readonly logger = new Logger(OutboxService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jobs: JobDispatcher,
  ) {}

  async add(tx: Prisma.TransactionClient, job: OutboxJob): Promise<string> {
    const row = await tx.domainEvent.create({
      data: {
        type: job.name,
        aggregateType: job.aggregateType,
        aggregateId: job.aggregateId,
        payload: toJson({ queue: job.queue, data: job.data }),
      },
    });
    return row.id;
  }

  /** Call after commit with the ids returned by `add`. */
  async publish(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const rows = await this.prisma.domainEvent.findMany({
      where: { id: { in: ids }, status: 'PENDING' },
    });
    for (const row of rows) {
      const stored = row.payload as unknown as StoredJob;
      try {
        await this.jobs.dispatch(stored.queue, row.type, stored.data);
        await this.prisma.domainEvent.update({
          where: { id: row.id },
          data: { status: 'DISPATCHED', dispatchedAt: new Date() },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Outbox ${row.id} not dispatched: ${message}`);
        await this.prisma.domainEvent.update({
          where: { id: row.id },
          data: {
            attempts: { increment: 1 },
            lastError: message.slice(0, 500),
          },
        });
      }
    }
  }

  /** Re-sends events left pending by a crash between commit and dispatch. */
  async onApplicationBootstrap(): Promise<void> {
    if (process.env.NODE_ENV === 'test') return;
    const pending = await this.prisma.domainEvent
      .findMany({ where: { status: 'PENDING' }, select: { id: true } })
      .catch(() => []);
    await this.publish(pending.map((row) => row.id));
  }
}
