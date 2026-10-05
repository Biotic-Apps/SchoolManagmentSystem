import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobProcessorRegistry } from './job-processor.registry';
import type { QueueName } from './queues';

export interface JobRunInput {
  queue: QueueName;
  name: string;
  data: unknown;
  driver: 'bullmq' | 'inline';
  attempt: number;
}

/** Runs a processor and records the run in `job_runs` for visibility. */
@Injectable()
export class JobRunner {
  private readonly logger = new Logger(JobRunner.name);

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly prisma: PrismaService,
  ) {}

  async run(input: JobRunInput): Promise<void> {
    const processor = this.registry.get(input.queue, input.name);
    const run = await this.prisma.jobRun.create({
      data: {
        queue: input.queue,
        name: input.name,
        driver: input.driver,
        attempt: input.attempt,
      },
    });
    try {
      await processor.process(input.data);
      await this.finish(run.id, 'COMPLETED');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Job ${input.queue}/${input.name} failed: ${message}`);
      await this.finish(run.id, 'FAILED', message.slice(0, 2000));
      throw error;
    }
  }

  private async finish(
    id: string,
    status: 'COMPLETED' | 'FAILED',
    error?: string,
  ): Promise<void> {
    await this.prisma.jobRun.update({
      where: { id },
      data: { status, error, finishedAt: new Date() },
    });
  }
}
