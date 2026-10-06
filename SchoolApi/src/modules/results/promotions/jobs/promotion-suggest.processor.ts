import { Injectable, OnModuleInit } from '@nestjs/common';
import type { JobProcessor } from '../../../../core/jobs/job-processor';
import { JobProcessorRegistry } from '../../../../core/jobs/job-processor.registry';
import { QUEUES } from '../../../../core/jobs/queues';
import {
  AsyncTaskService,
  type TaskJobData,
} from '../../../tasks/async-task.service';
import { PromotionBuilder, type SuggestInput } from '../promotion-builder';

export const PROMOTION_SUGGEST_JOB = 'promotions.suggest';

/** Builds promotion suggestions for a session. */
@Injectable()
export class PromotionSuggestProcessor
  implements JobProcessor<TaskJobData<SuggestInput>>, OnModuleInit
{
  readonly queue = QUEUES.REPORTS;
  readonly name = PROMOTION_SUGGEST_JOB;

  constructor(
    private readonly registry: JobProcessorRegistry,
    private readonly tasks: AsyncTaskService,
    private readonly builder: PromotionBuilder,
  ) {}

  onModuleInit(): void {
    this.registry.register(this);
  }

  process(input: TaskJobData<SuggestInput>): Promise<void> {
    return this.tasks.track(input.taskId, async () => ({
      count: await this.builder.run(input),
    }));
  }
}
