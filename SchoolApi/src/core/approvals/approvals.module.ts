import { Global, Module } from '@nestjs/common';
import { ApprovalHandlerRegistry } from './approval-handler.registry';
import { ApprovalService } from './approval.service';
import { ApprovalsController } from './approvals.controller';
import { ApprovalsRepository } from './approvals.repository';
import { ReassignApprovalsProcessor } from './jobs/reassign-approvals.processor';

@Global()
@Module({
  controllers: [ApprovalsController],
  providers: [
    ApprovalHandlerRegistry,
    ApprovalsRepository,
    ApprovalService,
    ReassignApprovalsProcessor,
  ],
  exports: [ApprovalService, ApprovalHandlerRegistry, ApprovalsRepository],
})
export class ApprovalsModule {}
