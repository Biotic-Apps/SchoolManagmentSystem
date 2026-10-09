import { Module } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { NoticeExpireProcessor } from './jobs/notice-expire.processor';
import { NoticeApprovalHandler } from './notice-approval.handler';
import { NoticeOverseers } from './notice-overseers.service';
import { NoticePublisher } from './notice-publisher.service';
import { NoticeRecipientsService } from './notice-recipients.service';
import { NoticeTargetService } from './notice-target.service';
import { NoticeWorkflowService } from './notice-workflow.service';
import { NoticesController } from './notices.controller';
import { NoticesService } from './notices.service';

/** Notices: draft → (principal approval) → published to resolved recipients. */
@Module({
  controllers: [NoticesController],
  providers: [
    AttachmentsService,
    NoticesService,
    NoticeTargetService,
    NoticeRecipientsService,
    NoticeOverseers,
    NoticePublisher,
    NoticeWorkflowService,
    NoticeApprovalHandler,
    NoticeExpireProcessor,
  ],
})
export class NoticesModule {}
