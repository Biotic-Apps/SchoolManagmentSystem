import { Module } from '@nestjs/common';
import { AttachmentsService } from '../notices/attachments.service';
import { MessageDelivery } from './message-delivery.service';
import { MessageRecipientsService } from './message-recipients.service';
import { MessageSendAction } from './message-send.action';
import { MessageSender } from './message-sender.service';
import { MessagingController } from './messaging.controller';
import { ThreadAccessService } from './thread-access.service';
import { ThreadMessagesService } from './thread-messages.service';
import { ThreadViewService } from './thread-view.service';
import { ThreadsService } from './threads.service';

/** Parent ↔ staff threads about a child, with office hours and probation review. */
@Module({
  controllers: [MessagingController],
  providers: [
    AttachmentsService,
    MessageDelivery,
    MessageRecipientsService,
    MessageSendAction,
    MessageSender,
    ThreadAccessService,
    ThreadMessagesService,
    ThreadViewService,
    ThreadsService,
  ],
})
export class MessagingModule {}
