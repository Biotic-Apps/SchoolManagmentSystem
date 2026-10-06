import { Injectable, OnModuleInit } from '@nestjs/common';
import type { JobProcessor } from '../../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../../core/jobs/job-processor.registry';
import { QUEUES } from '../../../../core/jobs/queues';
import {
  AsyncTaskService,
  type TaskJobData,
} from '../../../tasks/async-task.service';
import { ResultWriter } from '../result-writer';

export const COMPUTE_RESULTS_JOB = 'results.compute';

export interface ComputeResultsInput {
  examId: string;
}

/** Computes and stores every student's result of an exam. */
@Injectable()
export class ComputeResultsProcessor
  implements JobProcessor<TaskJobData<ComputeResultsInput>>, OnModuleInit
{
  readonly queue = QUEUES.REPORTS;
  readonly name = COMPUTE_RESULTS_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly tasks: AsyncTaskService,
    private readonly writer: ResultWriter,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  process(input: TaskJobData<ComputeResultsInput>): Promise<void> {
    return this.tasks.track(input.taskId, async () => ({
      count: await this.writer.run(input.examId),
    }));
  }
}
