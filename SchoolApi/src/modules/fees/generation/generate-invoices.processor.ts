import { Injectable, OnModuleInit } from '@nestjs/common';
import type { JobProcessor } from '../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../core/jobs/job-processor.registry';
import { QUEUES } from '../../../core/jobs/queues';
import {
  AsyncTaskService,
  type TaskJobData,
} from '../../tasks/async-task.service';
import type { GenerateInvoicesInput } from './generation-context.service';
import { InvoiceGeneratorService } from './invoice-generator.service';

export const GENERATE_INVOICES_JOB = 'fees.generateInvoices';

/** Runs one invoice generation; the task result is `{ count, skipped }`. */
@Injectable()
export class GenerateInvoicesProcessor
  implements JobProcessor<TaskJobData<GenerateInvoicesInput>>, OnModuleInit
{
  readonly queue = QUEUES.REPORTS;
  readonly name = GENERATE_INVOICES_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly tasks: AsyncTaskService,
    private readonly generator: InvoiceGeneratorService,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  process(input: TaskJobData<GenerateInvoicesInput>): Promise<void> {
    return this.tasks.track(input.taskId, async () => ({
      ...(await this.generator.generate(input)),
    }));
  }
}
