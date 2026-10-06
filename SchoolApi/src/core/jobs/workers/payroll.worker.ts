import { Processor } from '@nestjs/bullmq';
import { JobRunner } from '../job-runner';
import { QUEUES } from '../queues';
import { QueueWorker } from './queue-worker';

@Processor(QUEUES.PAYROLL)
export class PayrollWorker extends QueueWorker {
  constructor(runner: JobRunner) {
    super(runner, QUEUES.PAYROLL);
  }
}
