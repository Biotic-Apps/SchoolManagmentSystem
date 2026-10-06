import { Global, Module } from '@nestjs/common';
import { ProbationActionRegistry } from './probation-action.registry';
import { ProbationGate } from './probation-gate';
import { ProbationReviewHandler } from './probation-review.handler';

@Global()
@Module({
  providers: [ProbationActionRegistry, ProbationGate, ProbationReviewHandler],
  exports: [ProbationActionRegistry, ProbationGate],
})
export class ProbationModule {}
