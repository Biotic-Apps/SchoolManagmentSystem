import { Global, Module } from '@nestjs/common';
import { ChannelRegistry } from './channels/channel-registry';
import { EmailChannel } from './channels/email.channel';
import { PushChannel } from './channels/push.channel';
import { SmsChannel } from './channels/sms.channel';
import { DirectMessageProcessor } from './jobs/direct-message.processor';
import { SendNotificationProcessor } from './jobs/send-notification.processor';
import { NotificationInboxService } from './notification-inbox.service';
import { NotificationService } from './notification.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './notifications.repository';

@Global()
@Module({
  controllers: [NotificationsController],
  providers: [
    PushChannel,
    EmailChannel,
    SmsChannel,
    ChannelRegistry,
    NotificationsRepository,
    NotificationService,
    NotificationInboxService,
    SendNotificationProcessor,
    DirectMessageProcessor,
  ],
  exports: [NotificationService],
})
export class NotificationsModule {}
