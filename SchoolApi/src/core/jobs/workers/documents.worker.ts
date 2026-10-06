import { Processor } from '@nestjs/bullmq';
import { JobRunner } from '../job-runner';
import { QUEUES } from '../queues';
import { QueueWorker } from './queue-worker';

@Processor(QUEUES.DOCUMENTS)
export class DocumentsWorker extends QueueWorker {
  constructor(runner: JobRunner) {
    super(runner, QUEUES.DOCUMENTS);
  }
}
