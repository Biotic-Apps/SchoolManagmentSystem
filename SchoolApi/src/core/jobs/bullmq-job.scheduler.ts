import { getQueueToken } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import type { Queue } from 'bullmq';
import { JobScheduler, type ScheduledJob } from './job-scheduler';

@Injectable()
export class BullmqJobScheduler extends JobScheduler {
  constructor(private readonly moduleRef: ModuleRef) {
    super();
  }

  async schedule(job: ScheduledJob): Promise<void> {
    const queue = this.moduleRef.get<Queue>(getQueueToken(job.queue), {
      strict: false,
    });
    await queue.upsertJobScheduler(
      job.name,
      { pattern: job.cron },
      { name: job.name, data: {} },
    );
  }
}
