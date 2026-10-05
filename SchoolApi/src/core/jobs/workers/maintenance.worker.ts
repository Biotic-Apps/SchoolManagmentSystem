import { Processor } from '@nestjs/bullmq';
import { JobRunner } from '../job-runner';
import { QUEUES } from '../queues';
import { QueueWorker } from './queue-worker';

@Processor(QUEUES.MAINTENANCE)
export class MaintenanceWorker extends QueueWorker {
  constructor(runner: JobRunner) {
    super(runner, QUEUES.MAINTENANCE);
  }
}
