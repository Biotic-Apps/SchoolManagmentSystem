import { Module } from '@nestjs/common';
import { LeaveApprovalHandler } from './leave-approval.handler';
import { LeaveAutofill } from './leave-autofill';
import { LeaveReviewService } from './leave-review.service';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';

@Module({
  controllers: [LeaveController],
  providers: [
    LeaveService,
    LeaveReviewService,
    LeaveAutofill,
    LeaveApprovalHandler,
  ],
})
export class LeaveModule {}
