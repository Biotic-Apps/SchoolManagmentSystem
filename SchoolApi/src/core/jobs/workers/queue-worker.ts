import { WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import type { JobRunner } from '../job-runner';
import type { QueueName } from '../queues';

/** Base BullMQ worker: delegates each job to the shared JobRunner. */
export abstract class QueueWorker extends WorkerHost {
  protected constructor(
    private readonly runner: JobRunner,
    private readonly queue: QueueName,
  ) {
    super();
  }

  process(job: Job): Promise<void> {
    return this.runner.run({
      queue: this.queue,
      name: job.name,
      data: job.data,
      driver: 'bullmq',
      attempt: job.attemptsMade + 1,
    });
  }
}
