import { Global, Module } from '@nestjs/common';
import { ChannelRegistry } from './channels/channel-registry';
import { EmailChannel } from './channels/email.channel';
import { PushChannel } from './channels/push.channel';
import { SenderIdentityResolver } from './channels/sender-identity';
import { SmsChannel } from './channels/sms.channel';
import { WhatsAppChannel } from './channels/whatsapp.channel';
import { DirectMessageProcessor } from './jobs/direct-message.processor';
import { RecipientSwitches } from './jobs/recipient-switches';
import { SendNotificationProcessor } from './jobs/send-notification.processor';
import { NotificationInboxService } from './notification-inbox.service';
import { NotificationService } from './notification.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './notifications.repository';
import { NotificationPreferencesController } from './preferences/notification-preferences.controller';
import { NotificationPreferencesService } from './preferences/notification-preferences.service';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppRepository } from './whatsapp.repository';

@Global()
@Module({
  controllers: [
    NotificationsController,
    NotificationPreferencesController,
    WhatsAppController,
  ],
  providers: [
    SenderIdentityResolver,
    PushChannel,
    EmailChannel,
    SmsChannel,
    WhatsAppChannel,
    ChannelRegistry,
    NotificationsRepository,
    WhatsAppRepository,
    NotificationService,
    NotificationInboxService,
    RecipientSwitches,
    SendNotificationProcessor,
    DirectMessageProcessor,
    NotificationPreferencesService,
  ],
  exports: [
    NotificationService,
    ChannelRegistry,
    NotificationsRepository,
    WhatsAppRepository,
  ],
})
export class NotificationsModule {}
