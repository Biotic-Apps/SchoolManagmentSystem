import { Processor } from '@nestjs/bullmq';
import { JobRunner } from '../job-runner';
import { QUEUES } from '../queues';
import { QueueWorker } from './queue-worker';

@Processor(QUEUES.REPORTS)
export class ReportsWorker extends QueueWorker {
  constructor(runner: JobRunner) {
    super(runner, QUEUES.REPORTS);
  }
}
