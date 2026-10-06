import { Injectable, OnModuleInit } from '@nestjs/common';
import type { JobProcessor } from '../../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../../core/jobs/job-processor.registry';
import { QUEUES } from '../../../../core/jobs/queues';
import {
  AsyncTaskService,
  type TaskJobData,
} from '../../../tasks/async-task.service';
import { PayrollCalculationService } from '../payroll-calculation.service';

export const PAYROLL_CALCULATE_JOB = 'payroll.calculate';

export interface PayrollCalculateInput {
  runId: string;
  userId: string;
}

/** `payroll.calculate`: builds the lines of one run. */
@Injectable()
export class PayrollCalculateProcessor
  implements JobProcessor<TaskJobData<PayrollCalculateInput>>, OnModuleInit
{
  readonly queue = QUEUES.PAYROLL;
  readonly name = PAYROLL_CALCULATE_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly tasks: AsyncTaskService,
    private readonly calculation: PayrollCalculationService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  process(input: TaskJobData<PayrollCalculateInput>): Promise<void> {
    return this.tasks.track(input.taskId, async () => ({
      count: await this.calculation.calculate(input.runId, input.userId),
      runId: input.runId,
    }));
  }
}
