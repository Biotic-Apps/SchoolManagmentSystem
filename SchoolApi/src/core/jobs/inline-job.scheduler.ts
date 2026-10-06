import { Injectable } from '@nestjs/common';
import { JobDispatcher } from './job-dispatcher';
import { JobScheduler, type ScheduledJob } from './job-scheduler';

/** Dev driver: no recurring clock, so marked jobs run once after boot. */
@Injectable()
export class InlineJobScheduler extends JobScheduler {
  constructor(private readonly jobs: JobDispatcher) {
    super();
  }

  async schedule(job: ScheduledJob): Promise<void> {
    if (!job.runOnBootInline || process.env.NODE_ENV === 'test') return;
    await this.jobs.dispatch(job.queue, job.name, {});
  }
}
