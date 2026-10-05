import { Injectable, Logger } from '@nestjs/common';
import { JobDispatcher } from './job-dispatcher';
import { JobRunner } from './job-runner';
import type { QueueName } from './queues';

/** Dev/test driver: runs the processor after the current request, no Redis. */
@Injectable()
export class InlineJobDispatcher extends JobDispatcher {
  private readonly logger = new Logger(InlineJobDispatcher.name);

  constructor(private readonly runner: JobRunner) {
    super();
  }

  dispatch<T>(queue: QueueName, name: string, data: T): Promise<void> {
    setImmediate(() => {
      this.runner
        .run({ queue, name, data, driver: 'inline', attempt: 1 })
        .catch((error: unknown) =>
          this.logger.error(`Inline job ${queue}/${name} failed`, error),
        );
    });
    return Promise.resolve();
  }
}
