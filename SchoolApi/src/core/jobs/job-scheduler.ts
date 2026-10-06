import type { QueueName } from './queues';

export interface ScheduledJob {
  queue: QueueName;
  name: string;
  /** Cron pattern (server time zone). */
  cron: string;
  /** Inline driver has no clock: run once at boot instead (skipped in tests). */
  runOnBootInline?: boolean;
}

/** Registers recurring jobs; BullMQ job schedulers or a one-off inline run. */
export abstract class JobScheduler {
  abstract schedule(job: ScheduledJob): Promise<void>;
}
