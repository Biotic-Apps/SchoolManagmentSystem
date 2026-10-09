import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { ChannelMessage } from './channel-message';
import { DevLogChannel } from './dev-log-channel';
import { parseFcmCredentials } from './fcm/fcm-credentials';
import { FcmSender } from './fcm/fcm-sender';

/** Real FCM when FCM_SERVICE_ACCOUNT_JSON is set; otherwise logs (dev). */
@Injectable()
export class PushChannel extends DevLogChannel {
  private readonly fcm: FcmSender | null;

  constructor(config: AppConfigService, prisma: PrismaService) {
    super('PUSH', config);
    const raw = config.get('FCM_SERVICE_ACCOUNT_JSON');
    this.fcm = raw
      ? new FcmSender(parseFcmCredentials(raw), async (token) => {
          await prisma.userDevice.deleteMany({ where: { fcmToken: token } });
        })
      : null;
  }

  override send(message: ChannelMessage): Promise<void> {
    return this.fcm ? this.fcm.send(message) : super.send(message);
  }

  protected destination(message: ChannelMessage): string | undefined {
    const count = message.deviceTokens?.length ?? 0;
    return count > 0 ? `${count} device(s)` : undefined;
  }
}
